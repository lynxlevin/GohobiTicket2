import logging
from datetime import date, datetime
from unittest import mock

from django.test import Client, TestCase
from rest_framework import exceptions, status
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket

from gt_back.messages import ErrorMessages


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.user = cls.seeds.users[1]
        cls.giving_relation = cls.user.giving_relations.first()
        cls.receiving_relation = cls.user.receiving_relations.first()

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

    def test_partial_update__description(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = Ticket.objects.filter_eq_user_relation_id(self.giving_relation.id)[0]

        uri = f"/api/tickets/{ticket.id}/"
        params = {"ticket": {"description": "updated description"}}

        response = self._send_patch_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(str(ticket.id), response.data["id"])

    def test_partial_update__status(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = Ticket.objects.filter_eq_user_relation_id(self.giving_relation.id)[1]

        uri = f"/api/tickets/{ticket.id}/"
        params = {"ticket": {"status": Ticket.STATUS_READ}}

        response = self._send_patch_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)
        self.assertEqual(str(ticket.id), response.data["id"])

    def test_destroy(self):
        """
        Delete /api/tickets/{ticket_id}/
        """
        ticket = Ticket.objects.filter_eq_user_relation_id(
            self.giving_relation.id
        ).first()

        response = self._send_delete_request(self.user, f"/api/tickets/{ticket.id}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

    def test_mark_special(self):
        """
        Put /api/tickets/{ticket_id}/mark_special/
        """
        gift_date = datetime.strptime("2022-05-01", "%Y-%m-%d").date()
        ticket = Ticket(
            description="to be special",
            gift_date=gift_date,
            user_relation=self.giving_relation,
            is_special=False,
        )
        ticket.save()

        uri = f"/api/tickets/{ticket.id}/mark_special/"

        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(ticket.id), response.data["id"])

        ticket.refresh_from_db()
        self.assertTrue(ticket.is_special)

    def test_mark_special_case_error__multiple_special_tickets_in_month(self):
        second_special_ticket_in_month = self.seeds.tickets[16]

        uri = f"/api/tickets/{second_special_ticket_in_month.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertEqual(
            ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value,
            response.data["error_message"],
        )
        self._assert_false__ticket_is_special(second_special_ticket_in_month)

    def test_mark_special_case_error__receiving_relation(self):
        receiving_ticket = Ticket.objects.filter_eq_user_relation_id(
            self.receiving_relation.id
        ).first()

        uri = f"/api/tickets/{receiving_ticket.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertIsNone(response.data)
        self._assert_false__ticket_is_special(receiving_ticket)

    def test_mark_special_case_error__unrelated_relation(self):
        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id
        ).first()

        uri = f"/api/tickets/{unrelated_ticket.id}/mark_special/"
        response = self._send_put_request(self.user, uri, {})

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
        self.assertIsNone(response.data)
        self._assert_false__ticket_is_special(unrelated_ticket)

    def test_mark_special_case_error__used_ticket(self):
        used_ticket = Ticket(
            description="used_ticket",
            user_relation=self.giving_relation,
            gift_date=date.today(),
            use_date=date.today(),
        )
        used_ticket.save()

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

        ticket = (
            Ticket.objects.filter_eq_user_relation_id(self.receiving_relation.id)
            .filter(use_date__isnull=True, is_special=False)
            .first()
        )

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }
        uri = f"/api/tickets/{ticket.id}/use/"

        response = self._send_put_request(self.user, uri, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(ticket.id), response.data["id"])

    """
    Utility Functions
    """

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
