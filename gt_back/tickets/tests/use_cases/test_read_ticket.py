from django.test import TestCase
from rest_framework.exceptions import PermissionDenied
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import ReadTicket


class TestReadTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()
        cls.use_case_name = "tickets.use_cases.read_ticket"
        cls.giving_user = cls.seeds.users[0]
        cls.receiving_user = cls.seeds.users[1]

    def test_read(self):
        unread_ticket = self.seeds.tickets[0]

        ReadTicket().execute(self.receiving_user, unread_ticket.id)

        self._assert_ticket_status(Ticket.STATUS_READ, unread_ticket)

    def test_read__giving_user(self):
        unread_ticket = self.seeds.tickets[0]

        exception_message = "Only receiving user can perform this action."
        self._when_executed_should_raise_permission_denied(
            unread_ticket, self.giving_user, exception_message
        )

        self._assert_ticket_status(Ticket.STATUS_UNREAD, unread_ticket)

    def test_read__draft_ticket(self):
        draft_ticket = self.seeds.tickets[1]

        exception_message = "Draft tickets cannot be read."
        self._when_executed_should_raise_permission_denied(
            draft_ticket, self.receiving_user, exception_message
        )

        self._assert_ticket_status(Ticket.STATUS_DRAFT, draft_ticket)

    """
    Util Functions
    """

    def _when_executed_should_raise_permission_denied(
        self, ticket, user, exception_message
    ):
        self._when_executed_should_raise_exception(
            ticket,
            user,
            PermissionDenied,
            exception_message,
        )

    def _when_executed_should_raise_exception(
        self, ticket, user, exception, exception_message
    ):
        expected_exc_detail = f"ReadTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            ReadTicket().execute(user, ticket.id)

    def _assert_ticket_status(self, expected_status, ticket):
        ticket.refresh_from_db()
        self.assertEqual(expected_status, ticket.status)
