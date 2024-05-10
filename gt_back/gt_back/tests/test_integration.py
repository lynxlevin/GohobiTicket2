"""
NOTE: integration の流れ
login
create ticket
user_relations.retrieve
partial update ticket
    read にする
partial update ticket
    description を変える
user_relations.retrieve
    edited になっていること
partial update ticket
    read にする
use ticket
user_relations.retrieve
    use_date が入っていること
"""
from datetime import date
from unittest import mock

from django.test import Client, TestCase
from rest_framework import status
from tickets.enums import TicketStatus
from tickets.models import Ticket
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket
from user_relations.models import UserRelation
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.giving_user = UserFactory()
        cls.receiving_user = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.giving_user, user_2=cls.receiving_user, use_slack=True)

    def test_integration(self):
        giving_client = Client()
        giving_client.force_login(self.giving_user)

        receiving_client = Client()
        receiving_client.force_login(self.receiving_user)

        ticket_id = self._create_ticket_and_return_id(giving_client, self.relation)

        ticket = Ticket.objects.get_by_id(ticket_id)
        self._make_ticket_read(giving_client, ticket)
        self._use_ticket(receiving_client, ticket)

    def _create_ticket_and_return_id(self, client: Client, giving_relation: UserRelation):
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": giving_relation.id,
            }
        }

        response = client.post("/api/tickets/", params, content_type="application/json")
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
        self.assertEqual(params["ticket"]["description"], ticket["description"])
        self.assertEqual(params["ticket"]["gift_date"], ticket["gift_date"])
        self.assertEqual(TicketStatus.STATUS_UNREAD.value, ticket["status"])
        self.assertFalse(ticket["is_special"])
        self.assertIsNone(ticket.get("use_date"))

        return ticket["id"]

    def _make_ticket_read(self, client: Client, ticket: Ticket):
        params = {
            "ticket": {
                "status": TicketStatus.STATUS_READ.value,
            }
        }

        response = client.patch(f"/api/tickets/{ticket.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(TicketStatus.STATUS_READ.value, ticket.status)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def _use_ticket(self, client: Client, ticket: Ticket, slack_mock):
        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }

        response = client.put(f"/api/tickets/{ticket.id}/use/", params, content_type="application/json")

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(ticket.id, response.data["id"])

        self._then_ticket_should_be(ticket)
        self._then_slack_message_is_sent(ticket, slack_instance_mock)
        self._then_slack_message_is_sent(ticket, slack_instance_mock)

    """
    Util methods
    """

    def _then_ticket_should_be(self, ticket: Ticket):
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()

        self.assertEqual(date.today(), ticket.use_date)
        self.assertEqual("test_use_ticket", ticket.use_description)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def _then_slack_message_is_sent(self, ticket: Ticket, slack_instance_mock: mock.Mock):
        slack_instance_mock.generate_message.assert_called_once_with(ticket)
        slack_instance_mock.send_message.assert_called_once()
