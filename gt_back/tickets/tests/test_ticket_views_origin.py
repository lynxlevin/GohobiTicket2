from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.enums import TicketStatus
from tickets.tests.ticket_factory import TicketFactory


class TestTicketViews(TestCase):
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

        uri = f"/api/tickets/{unread_ticket.id}/read/"

        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(unread_ticket.id), response.data["id"])

        unread_ticket.refresh_from_db()
        self.assertEqual(TicketStatus.STATUS_READ.value, unread_ticket.status)

    """
    Utility Functions
    """

    def _send_get_request(self, user, uri):
        client = Client()
        client.force_login(user)
        response = client.get(uri)
        return response

    def _send_post_request(self, user, uri, params):
        client = Client()
        client.force_login(user)
        response = client.post(uri, params, content_type="application/json")
        return response

    def _send_patch_request(self, user, uri, params):
        client = Client()
        client.force_login(user)
        response = client.patch(uri, params, content_type="application/json")
        return response

    def _send_put_request(self, user, uri, params):
        client = Client()
        client.force_login(user)
        response = client.put(uri, params, content_type="application/json")
        return response

    def _send_delete_request(self, user, uri):
        client = Client()
        client.force_login(user)
        response = client.delete(uri)
        return response

    def _assert_false__ticket_is_special(self, ticket):
        ticket.refresh_from_db()
        self.assertFalse(ticket.is_special)
