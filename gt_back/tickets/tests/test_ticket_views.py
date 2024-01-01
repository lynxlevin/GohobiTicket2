from datetime import date
from unittest import mock

from django.test import Client, TestCase
from rest_framework import status
from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from gt_back.messages import ErrorMessages


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.giving_relation = UserRelationFactory(giving_user=cls.user)
        cls.receiving_relation = UserRelationFactory(
            receiving_user=cls.user, giving_user=cls.giving_relation.receiving_user
        )

    def test_list__receiving_relation(self):
        """
        Get /api/tickets/?user_relation_id={user_relation_id}
        """
        expected_available_tickets = [
            TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.receiving_relation),
            TicketFactory(status=Ticket.STATUS_READ, user_relation=self.receiving_relation),
            TicketFactory(status=Ticket.STATUS_EDITED, user_relation=self.receiving_relation),
        ]
        expected_used_tickets = [
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.receiving_relation),
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.receiving_relation),
        ]
        _tickets_not_returned = [
            TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.receiving_relation),
            TicketFactory(status=Ticket.STATUS_UNREAD),
        ]

        response = self._send_get_request(self.user, f"/api/tickets/?user_relation_id={self.receiving_relation.id}")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        body = response.json()
        available_tickets = body["available_tickets"]
        for expected, available_ticket in zip(
            sorted(expected_available_tickets, key=lambda ticket: f"{ticket.gift_date}-{ticket.id}", reverse=True),
            available_tickets,
        ):
            self.assertEqual(expected.id, available_ticket["id"])

        used_tickets = body["used_tickets"]
        for expected, used_ticket in zip(
            sorted(expected_used_tickets, key=lambda ticket: f"{ticket.gift_date}-{ticket.id}", reverse=True),
            used_tickets,
        ):
            self.assertEqual(expected.id, used_ticket["id"])

    def test_list__giving_relation(self):
        """
        Get /api/tickets/?user_relation_id={user_relation_id}
        """
        expected_available_tickets = [
            TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.giving_relation),
            TicketFactory(status=Ticket.STATUS_READ, user_relation=self.giving_relation),
            TicketFactory(status=Ticket.STATUS_EDITED, user_relation=self.giving_relation),
            TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=self.giving_relation),
        ]
        expected_used_tickets = [
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.giving_relation),
            UsedTicketFactory(status=Ticket.STATUS_READ, user_relation=self.giving_relation),
        ]
        _tickets_not_returned = [
            TicketFactory(status=Ticket.STATUS_UNREAD),
        ]

        response = self._send_get_request(self.user, f"/api/tickets/?user_relation_id={self.giving_relation.id}")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        body = response.json()
        available_tickets = body["available_tickets"]
        for expected, available_ticket in zip(
            sorted(expected_available_tickets, key=lambda ticket: f"{ticket.gift_date}-{ticket.id}", reverse=True),
            available_tickets,
        ):
            self.assertEqual(expected.id, available_ticket["id"])

        used_tickets = body["used_tickets"]
        for expected, used_ticket in zip(
            sorted(expected_used_tickets, key=lambda ticket: f"{ticket.gift_date}-{ticket.id}", reverse=True),
            used_tickets,
        ):
            self.assertEqual(expected.id, used_ticket["id"])

    def test_create(self):
        """
        Post /api/tickets/
        """
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": self.giving_relation.id,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
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
                "user_relation_id": self.giving_relation.id,
                "status": Ticket.STATUS_DRAFT,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
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
                "user_relation_id": self.giving_relation.id,
                "is_special": True,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
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
            gift_date="2022-08-24", is_special=True, user_relation_id=self.giving_relation.id
        )
        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": self.giving_relation.id,
                "is_special": True,
            }
        }

        response = self._send_post_request(self.user, "/api/tickets/", params)

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        body = response.json()
        ticket = body["ticket"]

        self.assertIsNotNone(ticket["id"])
        self.assertEqual(params["ticket"]["gift_date"], ticket["gift_date"])
        self.assertEqual(params["ticket"]["description"], ticket["description"])
        self.assertEqual(Ticket.STATUS_UNREAD, ticket["status"])
        self.assertFalse(ticket["is_special"])
        self.assertIsNone(ticket.get("use_date"))

    def test_partial_update__description(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.giving_relation)

        uri = f"/api/tickets/{ticket.id}/"
        params = {"ticket": {"description": "updated description"}}

        response = self._send_patch_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(str(ticket.id), response.data["id"])
        self.assertEqual(params["ticket"]["description"], ticket.description)

    def test_partial_update__status(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.giving_relation, status=Ticket.STATUS_UNREAD)

        uri = f"/api/tickets/{ticket.id}/"
        params = {"ticket": {"status": Ticket.STATUS_READ}}

        response = self._send_patch_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(str(ticket.id), response.data["id"])
        self.assertEqual(params["ticket"]["status"], ticket.status)

    def test_destroy(self):
        """
        Delete /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.giving_relation)

        response = self._send_delete_request(self.user, f"/api/tickets/{ticket.id}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

    def test_mark_special(self):
        """
        Put /api/tickets/{ticket_id}/mark_special/
        """
        ticket = TicketFactory(user_relation=self.giving_relation)

        uri = f"/api/tickets/{ticket.id}/mark_special/"

        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(str(ticket.id), response.data["id"])
        self.assertTrue(ticket.is_special)

    def test_mark_special_case_error__multiple_special_tickets_in_month(self):
        gift_date = date(2022, 5, 1)
        _first_special_ticket_in_month = TicketFactory(
            is_special=True, gift_date=gift_date, user_relation=self.giving_relation
        )
        target_ticket = TicketFactory(gift_date=gift_date, user_relation=self.giving_relation)

        uri = f"/api/tickets/{target_ticket.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertEqual(
            ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value,
            response.data["error_message"],
        )
        target_ticket.refresh_from_db()
        self._assert_false__ticket_is_special(target_ticket)

    def test_mark_special_case_error__receiving_relation(self):
        receiving_ticket = TicketFactory(user_relation=self.receiving_relation)

        uri = f"/api/tickets/{receiving_ticket.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertIsNone(response.data)
        self._assert_false__ticket_is_special(receiving_ticket)

    def test_mark_special_case_error__unrelated_relation(self):
        unrelated_ticket = TicketFactory()

        uri = f"/api/tickets/{unrelated_ticket.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertIsNone(response.data)
        self._assert_false__ticket_is_special(unrelated_ticket)

    def test_mark_special_case_error__used_ticket(self):
        used_ticket = UsedTicketFactory(user_relation=self.giving_relation)

        uri = f"/api/tickets/{used_ticket.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertIsNone(response.data)
        self._assert_false__ticket_is_special(used_ticket)

    def test_mark_special_case_error__non_existent_ticket(self):
        non_existent_ticket_id = "-1"

        uri = f"/api/tickets/{non_existent_ticket_id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)
        self.assertIsNone(response.data)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use(self, slack_mock):
        """
        Put /api/tickets/{ticket_id}/use/
        """
        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        ticket = TicketFactory(user_relation=self.receiving_relation)

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }
        uri = f"/api/tickets/{ticket.id}/use/"
        response = self._send_put_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(str(ticket.id), response.data["id"])

    def test_read_ticket(self):
        """
        Put /api/tickets/{ticket_id}/read/
        """
        unread_ticket = TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=self.receiving_relation)

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
