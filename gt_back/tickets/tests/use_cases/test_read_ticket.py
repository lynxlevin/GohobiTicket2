from django.test import TestCase
from rest_framework.exceptions import PermissionDenied
from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory
from tickets.use_cases import ReadTicket
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestReadTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.use_case_name = "tickets.use_cases.read_ticket"

        cls.user = UserFactory()
        cls.giving_relation = UserRelationFactory(giving_user=cls.user)
        cls.receiving_relation = UserRelationFactory(receiving_user=cls.user)

    def test_read(self):
        unread_ticket = TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.receiving_relation)

        ReadTicket().execute(self.user, unread_ticket.id)

        self._assert_ticket_status(Ticket.STATUS_READ, unread_ticket)

    def test_read__giving_user(self):
        unread_ticket = TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.giving_relation)

        exception_message = "Only receiving user can perform this action."
        self._when_executed_should_raise_permission_denied(
            unread_ticket, exception_message
        )

        self._assert_ticket_status(Ticket.STATUS_UNREAD, unread_ticket)

    def test_read__draft_ticket(self):
        draft_ticket = TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.receiving_relation)

        exception_message = "Draft tickets cannot be read."
        self._when_executed_should_raise_permission_denied(
            draft_ticket, exception_message
        )

        self._assert_ticket_status(Ticket.STATUS_DRAFT, draft_ticket)

    """
    Util Functions
    """

    def _when_executed_should_raise_permission_denied(
        self, ticket, exception_message
    ):
        self._when_executed_should_raise_exception(
            ticket,
            PermissionDenied,
            exception_message,
        )

    def _when_executed_should_raise_exception(
        self, ticket, exception, exception_message
    ):
        expected_exc_detail = f"ReadTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            ReadTicket().execute(self.user, ticket.id)

    def _assert_ticket_status(self, expected_status, ticket):
        ticket.refresh_from_db()
        self.assertEqual(expected_status, ticket.status)
        self.assertEqual(expected_status, ticket.status)
        self.assertEqual(expected_status, ticket.status)
