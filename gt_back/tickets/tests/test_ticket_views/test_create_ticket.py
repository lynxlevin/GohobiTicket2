from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.enums import TicketStatus
from tickets.tests.ticket_factory import TicketFactory


class TestCreateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user)

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
        self.assertEqual(TicketStatus.STATUS_UNREAD.value, ticket["status"])
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
                "status": TicketStatus.STATUS_DRAFT.value,
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
        self.assertEqual(TicketStatus.STATUS_DRAFT.value, ticket["status"])
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
        self.assertEqual(TicketStatus.STATUS_UNREAD.value, ticket["status"])
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
        self.assertEqual(TicketStatus.STATUS_UNREAD.value, ticket["status"])
        self.assertIsNone(ticket.get("use_date"))

    def test_create_404_on_bad_relation(self):
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket_to_raise_exception",
            }
        }

        cases = [
            {"name": "unrelated_relation", "user_relation_id": UserRelationFactory().id},
            {"name": "non_existent_relation", "user_relation_id": -1},
        ]

        for case in cases:
            with self.subTest(case=case["name"]):
                params["ticket"]["user_relation_id"] = case["user_relation_id"]
                response = self._send_post_request(self.user, "/api/tickets/", params)
                self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    """
    Utility Functions
    """

    def _send_post_request(self, user, uri, params):
        client = Client()
        client.force_login(user)
        response = client.post(uri, params, content_type="application/json")
        return response
