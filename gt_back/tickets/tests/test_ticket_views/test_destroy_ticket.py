from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_destroy(self):
        """
        Delete /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)

        response = self._send_delete_request(self.user, ticket.id)

        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

    def test_destroy__bad_ticket(self):
        receiving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)
        used_ticket = UsedTicketFactory(user_relation=self.relation, giving_user=self.user)
        cases = [
            {"name": "receiving_ticket", "ticket_id": receiving_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
            {"name": "un_related_ticket", "ticket_id": TicketFactory().id, "http_status": status.HTTP_404_NOT_FOUND},
            {"name": "non_existent_ticket", "ticket_id": -1, "http_status": status.HTTP_404_NOT_FOUND},
            {"name": "used_ticket", "ticket_id": used_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
        ]

        for case in cases:
            with self.subTest(case=case["name"]):
                response = self._send_delete_request(self.user, case["ticket_id"])
                self.assertEqual(case["http_status"], response.status_code)

    """
    Utility Functions
    """

    def _send_delete_request(self, user, ticket_id):
        client = Client()
        client.force_login(user)
        uri = f"/api/tickets/{ticket_id}/"
        response = client.delete(uri)
        return response
