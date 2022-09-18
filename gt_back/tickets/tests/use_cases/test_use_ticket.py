import logging
from datetime import date
from typing import Tuple
from unittest import mock

from django.test import TestCase
from rest_framework.exceptions import PermissionDenied, NotFound
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import UseTicket
from tickets.utils import SlackMessengerForUseTicket
from users.models import User


class TestUseTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()
        cls.use_case_name = "tickets.use_cases.use_ticket"

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use(self, slack_mock):
        with self.subTest(case="normal_ticket"):
            slack_instance_mock = self._prepare_mock(slack_mock)
            user, ticket = self._given_ticket(is_special=False)

            cm = self._when_ticket_is_used(user, ticket)

            self._then_ticket_should_be(ticket)
            self._then_slack_message_is_sent(ticket, slack_instance_mock)
            self._then_info_log_is_output(cm.output)

        with self.subTest(case="special_ticket"):
            slack_instance_mock = self._prepare_mock(slack_mock)
            user, ticket = self._given_ticket(is_special=True)

            cm = self._when_ticket_is_used(user, ticket)

            self._then_ticket_should_be(ticket)
            self._then_slack_message_is_sent(ticket, slack_instance_mock)
            self._then_info_log_is_output(cm.output)

    def test_use_error__bad_ticket(self):
        with self.subTest(case="giving_ticket"):
            user, giving_ticket = self._given_bad_ticket("giving_ticket")

            self._when_used_should_raise_exception(
                user,
                giving_ticket,
                exception=PermissionDenied,
                exception_message="Only the receiving user may use ticket.",
            )

            self._then_ticket_is_not_used(giving_ticket)

        with self.subTest(case="unrelated_ticket"):
            user, unrelated_ticket = self._given_bad_ticket("unrelated_ticket")

            self._when_used_should_raise_exception(
                user,
                unrelated_ticket,
                exception=PermissionDenied,
                exception_message="Only the receiving user may use ticket.",
            )

            self._then_ticket_is_not_used(unrelated_ticket)

        with self.subTest(case="non_existent_ticket"):
            user, non_existent_ticket = self._given_bad_ticket("non_existent_ticket")

            self._when_used_should_raise_exception(
                user,
                non_existent_ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

        with self.subTest(case="used_ticket"):
            user, used_ticket = self._given_bad_ticket("used_ticket")

            self._when_used_should_raise_exception(
                user,
                used_ticket,
                exception=PermissionDenied,
                exception_message="This ticket is already used.",
            )

    """
    Util Functions
    """

    def _prepare_mock(self, slack_mock) -> mock.Mock:
        slack_mock.reset_mock()

        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        return slack_instance_mock

    def _given_ticket(self, is_special: bool) -> Tuple[User, Ticket]:
        user = self.seeds.users[1]
        receiving_relation = user.receiving_relations.first()
        # MYMEMO: ここはチケットを新たに作るようにした方がよさそう
        ticket = (
            Ticket.objects.filter_eq_user_relation_id(receiving_relation.id)
            .filter(use_date__isnull=True, is_special=is_special)
            .first()
        )

        return (user, ticket)

    def _given_bad_ticket(self, case: str) -> Tuple[User, Ticket]:
        user = self.seeds.users[1]

        if case == "giving_ticket":
            giving_relation = user.giving_relations.first()
            ticket = Ticket.objects.filter_eq_user_relation_id(
                giving_relation.id
            ).first()

        elif case == "unrelated_ticket":
            unrelated_relation = self.seeds.user_relations[2]
            ticket = Ticket.objects.filter_eq_user_relation_id(
                unrelated_relation.id
            ).first()

        elif case == "non_existent_ticket":
            ticket = Ticket(id="-1", description="not_saved")

        elif case == "used_ticket":
            receiving_relation = user.receiving_relations.first()
            ticket = Ticket(
                description="used_ticket",
                user_relation=receiving_relation,
                gift_date=date.today(),
                use_date=date.today(),
            )
            ticket.save()

        return (user, ticket)

    def _when_ticket_is_used(self, user: User, ticket: Ticket):
        data = {"use_description": "test_use_ticket"}

        logger = logging.getLogger(self.use_case_name)
        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            UseTicket().execute(user=user, data=data, ticket_id=str(ticket.id))

        return cm

    def _when_used_should_raise_exception(
        self, user: User, ticket: Ticket, exception: Exception, exception_message: str
    ):
        data = {"use_description": "test_use_case_error"}

        expected_exc_detail = f"UseTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            UseTicket().execute(user=user, data=data, ticket_id=str(ticket.id))

    def _then_ticket_should_be(self, ticket: Ticket):
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()

        self.assertEqual(date.today(), ticket.use_date)
        self.assertEqual("test_use_ticket", ticket.use_description)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def _then_info_log_is_output(self, cm_output: list[str]):
        expected_log = [f"INFO:{self.use_case_name}:UseTicket"]
        self.assertEqual(expected_log, cm_output)

    def _then_slack_message_is_sent(
        self, ticket: Ticket, slack_instance_mock: mock.Mock
    ):
        slack_instance_mock.generate_message.assert_called_once_with(ticket)
        slack_instance_mock.send_message.assert_called_once()

    def _then_ticket_is_not_used(self, ticket: Ticket):
        ticket.refresh_from_db()
        self.assertIsNone(ticket.use_date)
        self.assertEqual("", ticket.use_description)
