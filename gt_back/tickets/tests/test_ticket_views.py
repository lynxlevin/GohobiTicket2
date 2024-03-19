from unittest import mock

from django.test import Client, TestCase
from rest_framework import status
from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_list__receiving_relation(self):
        """
        Get /api/tickets/?user_relation_id={user_relation_id}&is_receiving
        """
        expected_available_tickets = [
            TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.partner),
            TicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.partner),
            TicketFactory(status=Ticket.STATUS_EDITED, user_relation=self.relation, giving_user=self.partner),
        ]
        expected_used_tickets = [
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.partner),
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.partner),
        ]
        _tickets_not_returned = [
            TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.relation, giving_user=self.partner),
            TicketFactory(status=Ticket.STATUS_UNREAD),
        ]

        response = self._send_get_request(self.user, f"/api/tickets/?user_relation_id={self.relation.id}&is_receiving")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        body = response.json()
        tickets = body["tickets"]
        for expected, ticket in zip(
            sorted(
                [*expected_available_tickets, *expected_used_tickets],
                key=lambda ticket: f"{ticket.gift_date}-{ticket.id}",
                reverse=True,
            ),
            tickets,
        ):
            self.assertEqual(expected.id, ticket["id"])

    def test_list__giving_relation(self):
        """
        Get /api/tickets/?user_relation_id={user_relation_id}&is_giving
        """
        expected_available_tickets = [
            TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.user),
            TicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.user),
            TicketFactory(status=Ticket.STATUS_EDITED, user_relation=self.relation, giving_user=self.user),
            TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.relation, giving_user=self.user),
        ]
        expected_used_tickets = [
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.user),
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.relation, giving_user=self.user),
        ]
        _tickets_not_returned = [
            TicketFactory(status=Ticket.STATUS_UNREAD),
        ]

        response = self._send_get_request(self.user, f"/api/tickets/?user_relation_id={self.relation.id}&is_giving")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        body = response.json()
        tickets = body["tickets"]
        for expected, ticket in zip(
            sorted(
                [*expected_available_tickets, *expected_used_tickets],
                key=lambda ticket: f"{ticket.gift_date}-{ticket.id}",
                reverse=True,
            ),
            tickets,
        ):
            self.assertEqual(expected.id, ticket["id"])

    def test_create(self):
        """
        Post /api/tickets/
        """
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": self.relation.id,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
        self.assertEqual(self.user.id, ticket["giving_user_id"])
        self.assertEqual(params["ticket"]["gift_date"], ticket["gift_date"])
        self.assertEqual(params["ticket"]["description"], ticket["description"])
        self.assertEqual(Ticket.STATUS_UNREAD, ticket["status"])
        self.assertFalse(ticket["is_special"])
        self.assertIsNone(ticket.get("use_date"))

    def test_create_draft(self):
        """
        Post /api/tickets/
        """
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": self.relation.id,
                "status": Ticket.STATUS_DRAFT,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
        self.assertEqual(self.user.id, ticket["giving_user_id"])
        self.assertEqual(params["ticket"]["gift_date"], ticket["gift_date"])
        self.assertEqual(params["ticket"]["description"], ticket["description"])
        self.assertEqual(Ticket.STATUS_DRAFT, ticket["status"])
        self.assertFalse(ticket["is_special"])
        self.assertIsNone(ticket.get("use_date"))

    def test_create_special(self):
        """
        Post /api/tickets/
        """
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": self.relation.id,
                "is_special": True,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
        self.assertEqual(self.user.id, ticket["giving_user_id"])
        self.assertEqual(params["ticket"]["gift_date"], ticket["gift_date"])
        self.assertEqual(params["ticket"]["description"], ticket["description"])
        self.assertEqual(Ticket.STATUS_UNREAD, ticket["status"])
        self.assertTrue(ticket["is_special"])
        self.assertIsNone(ticket.get("use_date"))

    def test_create_special__already_exists(self):
        """
        Post /api/tickets/
        """
        _existingSpecialTicket = TicketFactory(
            gift_date="2022-08-24", is_special=True, user_relation_id=self.relation.id, giving_user=self.user
        )
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": self.relation.id,
                "is_special": True,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        # Non special ticket will be created
        self.assertFalse(ticket["is_special"])
        self.assertIsNotNone(ticket["id"])
        self.assertEqual(params["ticket"]["gift_date"], ticket["gift_date"])
        self.assertEqual(params["ticket"]["description"], ticket["description"])
        self.assertEqual(Ticket.STATUS_UNREAD, ticket["status"])
        self.assertIsNone(ticket.get("use_date"))

    def test_partial_update__description(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)

        uri = f"/api/tickets/{ticket.id}/"
        params = {"ticket": {"description": "updated description"}}

        response = self._send_patch_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(ticket.id, response.data["id"])
        self.assertEqual(params["ticket"]["description"], ticket.description)

    def test_partial_update__status(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.relation, giving_user=self.user, status=Ticket.STATUS_UNREAD)

        uri = f"/api/tickets/{ticket.id}/"
        params = {"ticket": {"status": Ticket.STATUS_READ}}

        response = self._send_patch_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(ticket.id, response.data["id"])
        self.assertEqual(params["ticket"]["status"], ticket.status)

    def test_destroy(self):
        """
        Delete /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)

        response = self._send_delete_request(self.user, f"/api/tickets/{ticket.id}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use(self, slack_mock):
        """
        Put /api/tickets/{ticket_id}/use/
        """
        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }
        uri = f"/api/tickets/{ticket.id}/use/"
        response = self._send_put_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(ticket.id, response.data["id"])

    def test_read_ticket(self):
        """
        Put /api/tickets/{ticket_id}/read/
        """
        unread_ticket = TicketFactory(
            status=Ticket.STATUS_UNREAD, user_relation=self.relation, giving_user=self.partner
        )

        uri = f"/api/tickets/{unread_ticket.id}/read/"

        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(unread_ticket.id), response.data["id"])

        unread_ticket.refresh_from_db()
        self.assertEqual(Ticket.STATUS_READ, unread_ticket.status)

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
