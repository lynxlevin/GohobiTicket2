from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.enums import TicketStatus
from tickets.tests.ticket_factory import TicketFactory


class TestReadTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_read_ticket(self):
        """
        Put /api/tickets/{ticket_id}/read/
        """
        unread_ticket = TicketFactory(
            status=TicketStatus.STATUS_UNREAD.value, user_relation=self.relation, giving_user=self.partner
        )

        response = self._send_put_request(self.user, unread_ticket.id, {})

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(unread_ticket.id), response.data["id"])

        unread_ticket.refresh_from_db()
        self.assertEqual(TicketStatus.STATUS_READ.value, unread_ticket.status)

    def test_read__bad_ticket(self):
        giving_ticket = TicketFactory(
            status=TicketStatus.STATUS_UNREAD.value, user_relation=self.relation, giving_user=self.user
        )
        draft_ticket = TicketFactory(
            status=TicketStatus.STATUS_DRAFT.value, user_relation=self.relation, giving_user=self.partner
        )
        unrelated_ticket = TicketFactory(status=TicketStatus.STATUS_UNREAD.value)

        cases = [
            {"name": "giving_ticket", "ticket_id": giving_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
            {"name": "draft_ticket", "ticket_id": draft_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
            {"name": "unrelated_ticket", "ticket_id": unrelated_ticket.id, "http_status": status.HTTP_404_NOT_FOUND},
            {"name": "non_existent_ticket", "ticket_id": -1, "http_status": status.HTTP_404_NOT_FOUND},
        ]

        for case in cases:
            with self.subTest(case=case["name"]):
                response = self._send_put_request(self.user, case["ticket_id"], {})
                self.assertEqual(case["http_status"], response.status_code)

    """
    Utility Functions
    """

    def _send_put_request(self, user, ticket_id, params):
        client = Client()
        client.force_login(user)
        uri = f"/api/tickets/{ticket_id}/read/"
        response = client.put(uri, params, content_type="application/json")
        return response
