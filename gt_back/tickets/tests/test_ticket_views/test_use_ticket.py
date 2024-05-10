from datetime import date
from unittest import mock

from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket


class TestUseTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use(self, slack_mock):
        """
        Put /api/tickets/{ticket_id}/use/
        """
        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)

        params = {"ticket": {"use_description": "test_use_ticket"}}

        response = self._send_put_request(self.user, ticket.id, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(ticket.id, response.data["id"])

        ticket.refresh_from_db()

        self.assertEqual(date.today(), ticket.use_date)
        self.assertEqual("test_use_ticket", ticket.use_description)

        slack_instance_mock.generate_message.assert_called_once_with(ticket)
        slack_instance_mock.send_message.assert_called_once()

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use__bad_ticket(self, slack_mock):
        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        giving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)
        unrelated_ticket = TicketFactory()
        used_ticket = UsedTicketFactory(user_relation=self.relation, giving_user=self.partner)

        params = {"ticket": {"use_description": "test_use_ticket"}}

        cases = [
            {"name": "giving_ticket", "ticket_id": giving_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
            {"name": "unrelated_ticket", "ticket_id": unrelated_ticket.id, "http_status": status.HTTP_404_NOT_FOUND},
            {"name": "non_existent_ticket", "ticket_id": -1, "http_status": status.HTTP_404_NOT_FOUND},
            {"name": "used_ticket", "ticket_id": used_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
        ]

        for case in cases:
            with self.subTest(case=case["name"]):
                response = self._send_put_request(self.user, case["ticket_id"], params)
                self.assertEqual(case["http_status"], response.status_code)

    """
    Utility Functions
    """

    def _send_put_request(self, user, ticket_id, params):
        client = Client()
        client.force_login(user)
        uri = f"/api/tickets/{ticket_id}/use/"
        response = client.put(uri, params, content_type="application/json")
        return response
