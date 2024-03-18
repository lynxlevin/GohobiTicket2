from django.test import TestCase
from rest_framework.exceptions import NotFound, PermissionDenied
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
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_read(self):
        unread_ticket = TicketFactory(
            status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.partner
        )

        ReadTicket().execute(self.user, unread_ticket.id)

        self._assert_ticket_status(Ticket.STATUS_READ, unread_ticket)

    def test_read__giving_user(self):
        unread_ticket = TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.user)

        self._when_executed_should_raise_exception(
            unread_ticket,
            exception=PermissionDenied,
            exception_message="Only receiving user can perform this action.",
        )

        self._assert_ticket_status(Ticket.STATUS_UNREAD, unread_ticket)

    def test_read__draft_ticket(self):
        draft_ticket = TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.relation, giving_user=self.partner)

        self._when_executed_should_raise_exception(
            draft_ticket,
            exception=PermissionDenied,
            exception_message="Draft tickets cannot be read.",
        )

        self._assert_ticket_status(Ticket.STATUS_DRAFT, draft_ticket)

    def test_read__unrelated_ticket(self):
        unrelated_ticket = TicketFactory(status=Ticket.STATUS_UNREAD)

        self._when_executed_should_raise_exception(
            unrelated_ticket,
            exception=NotFound,
            exception_message="Ticket not found.",
        )

        self._assert_ticket_status(Ticket.STATUS_UNREAD, unrelated_ticket)

    """
    Util Functions
    """

    def _when_executed_should_raise_exception(self, ticket, exception, exception_message):
        expected_exc_detail = f"ReadTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            ReadTicket().execute(self.user, ticket.id)

    def _assert_ticket_status(self, expected_status, ticket):
        ticket.refresh_from_db()
        self.assertEqual(expected_status, ticket.status)
        self.assertEqual(expected_status, ticket.status)
        self.assertEqual(expected_status, ticket.status)
