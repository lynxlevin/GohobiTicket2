import logging
from datetime import date
from unittest import mock

from django.test import TestCase
from rest_framework.exceptions import NotFound, PermissionDenied
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory
from tickets.use_cases import UseTicket
from tickets.utils import SlackMessengerForUseTicket


class TestUseTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.use_case_name = "tickets.use_cases.use_ticket"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use(self, slack_mock):
        with self.subTest(case="normal_ticket"):
            slack_instance_mock = self._prepare_mock(slack_mock)
            normal_ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)

            cm = self._when_ticket_is_used(normal_ticket)

            self._then_ticket_should_be(normal_ticket)
            self._then_slack_message_is_sent(normal_ticket, slack_instance_mock)
            self._then_info_log_is_output(cm.output)

        with self.subTest(case="special_ticket"):
            slack_instance_mock = self._prepare_mock(slack_mock)
            special_ticket = TicketFactory(is_special=True, user_relation=self.relation, giving_user=self.partner)

            cm = self._when_ticket_is_used(special_ticket)

            self._then_ticket_should_be(special_ticket)
            self._then_slack_message_is_sent(special_ticket, slack_instance_mock)
            self._then_info_log_is_output(cm.output)

    def test_use_error__bad_ticket(self):
        with self.subTest(case="giving_ticket"):
            giving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)

            self._when_used_should_raise_exception(
                giving_ticket,
                exception=PermissionDenied,
                exception_message="Not receiving user.",
            )

            self._then_ticket_is_not_used(giving_ticket)

        with self.subTest(case="unrelated_ticket"):
            unrelated_ticket = TicketFactory()

            self._when_used_should_raise_exception(
                unrelated_ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

            self._then_ticket_is_not_used(unrelated_ticket)

        with self.subTest(case="non_existent_ticket"):
            non_existent_ticket = Ticket(id="-1", description="not_saved")

            self._when_used_should_raise_exception(
                non_existent_ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

        with self.subTest(case="used_ticket"):
            used_ticket = UsedTicketFactory(user_relation=self.relation, giving_user=self.partner)

            self._when_used_should_raise_exception(
                used_ticket,
                exception=PermissionDenied,
                exception_message="Not unused ticket.",
            )

    """
    Util Functions
    """

    def _prepare_mock(self, slack_mock) -> mock.Mock:
        slack_mock.reset_mock()

        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        return slack_instance_mock

    def _when_ticket_is_used(self, ticket: Ticket):
        data = {"use_description": "test_use_ticket"}

        logger = logging.getLogger(self.use_case_name)
        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            UseTicket().execute(user=self.user, data=data, ticket_id=str(ticket.id))

        return cm

    def _when_used_should_raise_exception(self, ticket: Ticket, exception: Exception, exception_message: str):
        data = {"use_description": "test_use_case_error"}

        with self.assertRaisesRegex(exception, exception_message):
            UseTicket().execute(user=self.user, data=data, ticket_id=str(ticket.id))

    def _then_ticket_should_be(self, ticket: Ticket):
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()

        self.assertEqual(date.today(), ticket.use_date)
        self.assertEqual("test_use_ticket", ticket.use_description)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def _then_info_log_is_output(self, cm_output: list[str]):
        expected_log = [f"INFO:{self.use_case_name}:UseTicket"]
        self.assertEqual(expected_log, cm_output)

    def _then_slack_message_is_sent(self, ticket: Ticket, slack_instance_mock: mock.Mock):
        slack_instance_mock.generate_message.assert_called_once_with(ticket)
        slack_instance_mock.send_message.assert_called_once()

    def _then_ticket_is_not_used(self, ticket: Ticket):
        ticket.refresh_from_db()
        self.assertIsNone(ticket.use_date)
        self.assertEqual("", ticket.use_description)
        self.assertEqual("", ticket.use_description)
        self.assertEqual("", ticket.use_description)
        self.assertEqual("", ticket.use_description)
