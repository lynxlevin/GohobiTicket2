import logging

from django.test import TestCase
from rest_framework.exceptions import NotFound, PermissionDenied
from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory
from tickets.use_cases import PartialUpdateTicket
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.models import User
from users.tests.user_factory import UserFactory


class TestPartialUpdateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.use_case_name = "tickets.use_cases.partial_update_ticket"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_update_status_from_draft_to_unread(self):
        draft_ticket = TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.relation, giving_user=self.user)
        cm = self._execute_use_case(self.user, draft_ticket, {"status": Ticket.STATUS_UNREAD})

        self._then_ticket_should_be(draft_ticket, Ticket.STATUS_UNREAD)
        self._then_info_log_is_output(cm.output)

    def test_update_description(self):
        with self.subTest(case="unread_ticket"):
            unread_ticket = TicketFactory(
                status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.user
            )
            cm = self._execute_use_case(self.user, unread_ticket, {"description": "edited_description"})
            self._then_ticket_should_be(
                unread_ticket,
                status=Ticket.STATUS_UNREAD,
                description="edited_description",
            )
            self._then_info_log_is_output(cm.output)

        with self.subTest(case="read_ticket"):
            read_ticket = TicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.user)
            cm = self._execute_use_case(self.user, read_ticket, {"description": "edited_description"})
            self._then_ticket_should_be(
                read_ticket,
                status=Ticket.STATUS_EDITED,
                description="edited_description",
            )
            self._then_info_log_is_output(cm.output)

    def test_update_error__bad_ticket(self):
        with self.subTest(case="receiving_ticket"):
            receiving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)

            self._execute_use_case_raise_exception(
                self.user,
                receiving_ticket,
                data={"description": "updated description"},
                exception=PermissionDenied,
                exception_message="Only the giving user may update ticket.",
            )

            self._then_ticket_is_not_updated(receiving_ticket)

        with self.subTest(case="unrelated_ticket"):
            unrelated_ticket = TicketFactory()

            self._execute_use_case_raise_exception(
                self.user,
                unrelated_ticket,
                data={"description": "updated description"},
                exception=NotFound,
                exception_message="Ticket not found.",
            )

            self._then_ticket_is_not_updated(unrelated_ticket)

        with self.subTest(case="non_existent_ticket"):
            non_existent_ticket = Ticket(id="-1", description="not_saved")

            self._execute_use_case_raise_exception(
                self.user,
                non_existent_ticket,
                data={"description": "updated description"},
                exception=NotFound,
                exception_message="Ticket not found.",
            )

    def test_update_status_error(self):
        with self.subTest(case="to_draft"):
            unread_ticket = TicketFactory(
                status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.user
            )

            self._execute_use_case_raise_exception(
                self.user,
                unread_ticket,
                data={"status": Ticket.STATUS_DRAFT},
                exception=PermissionDenied,
                exception_message="Tickets cannot be updated to draft.",
            )
            self._then_ticket_is_not_updated(unread_ticket)

    """
    Utility Functions
    """

    def _execute_use_case(self, user: User, ticket: Ticket, data: dict):
        logger = logging.getLogger(self.use_case_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            PartialUpdateTicket().execute(
                user=user,
                data=data,
                ticket_id=ticket.id,
            )

        return cm

    def _execute_use_case_raise_exception(
        self,
        user: User,
        ticket: Ticket,
        data: dict,
        exception: Exception,
        exception_message: str,
    ):
        exc_detail = f"PartialUpdateTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, exc_detail):
            PartialUpdateTicket().execute(user=user, data=data, ticket_id=ticket.id)

    def _then_ticket_should_be(self, ticket: Ticket, status: str, description: str = ""):
        original_updated_at = ticket.updated_at
        ticket.refresh_from_db()
        self.assertNotEqual(original_updated_at, ticket.updated_at)
        self.assertEqual(status, ticket.status)
        if description:
            self.assertEqual(description, ticket.description)

    def _then_ticket_is_not_updated(self, ticket: Ticket):
        original_description = ticket.description
        original_status = ticket.status
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()
        self.assertEqual(original_description, ticket.description)
        self.assertEqual(original_status, ticket.status)
        self.assertEqual(original_updated_at, ticket.updated_at)

    def _then_info_log_is_output(self, cm_output):
        expected_log = [f"INFO:{self.use_case_name}:PartialUpdateTicket"]
        self.assertEqual(expected_log, cm_output)
