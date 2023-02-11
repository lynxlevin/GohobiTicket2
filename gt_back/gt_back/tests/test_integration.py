"""
MYMEMO: integration の流れ
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
from unittest import mock
from django.test import Client, TestCase
from rest_framework import status
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.tests.use_cases import TestCreateTicket, TestUseTicket
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket
from user_relations.models import UserRelation


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUpUsers()
        cls.seeds.setUpUserRelations()
        cls.seeds.setUpUserSettings()

    def test_integration(self):
        giving_user = self.seeds.users[1]
        giving_relation = giving_user.giving_relations.first()
        receiving_user = giving_relation.receiving_user

        giving_client = Client()
        # MYMEMO: test login
        giving_client.force_login(giving_user)

        receiving_client = Client()
        # MYMEMO: test login
        receiving_client.force_login(receiving_user)

        ticket_id = self._create_ticket_and_return_id(giving_client, giving_relation)

        ticket = Ticket.objects.get_by_id(ticket_id)
        # MYMEMO: API じゃ無くした
        # self._list_tickets(giving_client, giving_relation, ticket)
        self._make_ticket_read(giving_client, ticket)
        self._use_ticket(receiving_client, ticket)

    def _create_ticket_and_return_id(
        self, client: Client, giving_relation: UserRelation
    ):
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
        self.assertEqual(Ticket.STATUS_UNREAD, ticket["status"])
        self.assertFalse(ticket["is_special"])
        self.assertIsNone(ticket.get("use_date"))

        return ticket["id"]

    def _list_tickets(
        self, client: Client, user_relation: UserRelation, expected_ticket: Ticket
    ):
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        expected_dict = {
            "user_relation": user_relation.id,
            "description": expected_ticket.description,
            "gift_date": expected_ticket.gift_date.strftime("%Y-%m-%d")
            if expected_ticket.gift_date is not None
            else None,
            "use_description": expected_ticket.use_description,
            "use_date": expected_ticket.use_date.strftime("%Y-%m-%d")
            if expected_ticket.use_date is not None
            else None,
            "status": expected_ticket.status,
            "is_special": expected_ticket.is_special,
        }

        self.assertDictEqual(response.data[0], expected_dict)

    def _make_ticket_read(self, client: Client, ticket: Ticket):
        params = {
            "ticket": {
                "status": Ticket.STATUS_READ,
            }
        }

        response = client.patch(
            f"/api/tickets/{ticket.id}/", params, content_type="application/json"
        )

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(Ticket.STATUS_READ, ticket.status)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def _use_ticket(self, client: Client, ticket: Ticket, slack_mock):
        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }

        response = client.put(
            f"/api/tickets/{ticket.id}/use/", params, content_type="application/json"
        )

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(str(ticket.id), response.data["id"])

        TestUseTicket()._then_ticket_should_be(ticket)
        TestUseTicket()._then_slack_message_is_sent(ticket, slack_instance_mock)
