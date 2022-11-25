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

    def test_create(self):
        """
        Post /api/tickets/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": giving_relation.id,
            }
        }

        response = client.post("/api/tickets/", params, content_type="application/json")

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        ticket_id = response.json()["id"]
        self.assertIsNotNone(ticket_id)

    def test_create_draft(self):
        """
        Post /api/tickets/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": giving_relation.id,
                "status": Ticket.STATUS_DRAFT,
            }
        }

        response = client.post("/api/tickets/", params, content_type="application/json")

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        ticket_id = response.json()["id"]
        self.assertIsNotNone(ticket_id)

        ticket = Ticket.objects.get_by_id(ticket_id)
        self.assertEqual(Ticket.STATUS_DRAFT, ticket.status)

    @mock.patch("tickets.use_cases.create_ticket.CreateTicket.execute")
    def test_create_case_error(self, use_case_mock):
        """
        Post /api/tickets
        error cases
        """
        test_log = "test_exception_log"
        use_case_mock.side_effect = exceptions.APIException(detail=test_log)

        user = self.seeds.users[1]

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": "1",
            }
        }

        logger = logging.getLogger("gt_back.exception_handler")

        with self.assertLogs(logger=logger, level=logging.WARN) as cm:
            response = client.post(
                f"/api/tickets/", params, content_type="application/json"
            )

        expected_params = {
            **params["ticket"],
            "gift_date": datetime.strptime(
                params["ticket"]["gift_date"], "%Y-%m-%d"
            ).date(),
        }
        use_case_mock.assert_called_once_with(user=user, data=expected_params)

        self.assertEqual(status.HTTP_500_INTERNAL_SERVER_ERROR, response.status_code)

        expected_log = [f"WARNING:gt_back.exception_handler:{test_log}"]
        self.assertEqual(expected_log, cm.output)

    def test_partial_update(self):
        """
        Patch /api/tickets/{ticket_id}/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        tickets = Ticket.objects.filter_eq_user_relation_id(giving_relation.id)

        client = Client()
        client.force_login(user)

        cases = {
            "update_description": {
                "ticket": tickets[0],
                "params": {"ticket": {"description": "updated description"}},
            },
            "update_status": {
                "ticket": tickets[1],
                "params": {"ticket": {"status": Ticket.STATUS_READ}},
            },
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                response = client.patch(
                    f"/api/tickets/{condition['ticket'].id}/",
                    condition["params"],
                    content_type="application/json",
                )

                self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

                self.assertEqual(str(condition["ticket"].id), response.data["id"])

    @mock.patch("tickets.use_cases.partial_update_ticket.PartialUpdateTicket.execute")
    def test_partial_update_case_error(self, use_case_mock):
        """
        Patch /api/tickets/{ticket_id}/
        error cases
        """
        test_log = "test_exception_log"
        use_case_mock.side_effect = exceptions.APIException(detail=test_log)

        user = self.seeds.users[1]

        ticket_id = "1"

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "description": "updated description",
            }
        }

        logger = logging.getLogger("gt_back.exception_handler")

        with self.assertLogs(logger=logger, level=logging.WARN) as cm:
            response = client.patch(
                f"/api/tickets/{ticket_id}/", params, content_type="application/json"
            )

        use_case_mock.assert_called_once_with(
            user=user, data=params["ticket"], ticket_id=ticket_id
        )

        self.assertEqual(status.HTTP_500_INTERNAL_SERVER_ERROR, response.status_code)

        expected_log = [f"WARNING:gt_back.exception_handler:{test_log}"]
        self.assertEqual(expected_log, cm.output)

    def test_destroy(self):
        """
        Delete /api/tickets/{ticket_id}/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()

        client = Client()
        client.force_login(user)

        ticket = Ticket.objects.filter_eq_user_relation_id(giving_relation.id).first()

        response = client.delete(f"/api/tickets/{ticket.id}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

    @mock.patch("tickets.use_cases.destroy_ticket.DestroyTicket.execute")
    def test_destroy_case_error(self, use_case_mock):
        """
        Delete /api/tickets/{ticket_id}/
        error case
        """
        test_log = "test_exception_log"
        use_case_mock.side_effect = exceptions.APIException(detail=test_log)

        user = self.seeds.users[1]

        ticket_id = "1"

        client = Client()
        client.force_login(user)

        logger = logging.getLogger("gt_back.exception_handler")

        with self.assertLogs(logger=logger, level=logging.WARN) as cm:
            response = client.delete(f"/api/tickets/{ticket_id}/")

        use_case_mock.assert_called_once_with(user=user, ticket_id=ticket_id)

        self.assertEqual(status.HTTP_500_INTERNAL_SERVER_ERROR, response.status_code)

        expected_log = [f"WARNING:gt_back.exception_handler:{test_log}"]
        self.assertEqual(expected_log, cm.output)

    def test_mark_special(self):
        """
        Put /api/tickets/{ticket_id}/mark_special/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        gift_date = datetime.strptime("2022-05-01", "%Y-%m-%d").date()
        ticket = Ticket(
            description="to be special",
            gift_date=gift_date,
            user_relation=giving_relation,
            is_special=False,
        )
        ticket.save()

        client = Client()
        client.force_login(user)

        original_updated_at = ticket.updated_at

        response = client.put(
            f"/api/tickets/{ticket.id}/mark_special/",
            {},
            content_type="application/json",
        )

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(ticket.id), response.data["id"])

        ticket.refresh_from_db()
        self.assertTrue(ticket.is_special)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def test_mark_special_case_error(self):
        user = self.seeds.users[1]

        second_special_ticket_in_month = self.seeds.tickets[16]

        receiving_relation_id = user.receiving_relations.first().id
        receiving_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation_id
        ).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id
        ).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        giving_relation = user.giving_relations.first()
        used_ticket = Ticket(
            description="used_ticket",
            user_relation=giving_relation,
            gift_date=date.today(),
            use_date=date.today(),
        )
        used_ticket.save()

        cases = {
            "multiple_special_tickets_in_month": {
                "ticket": second_special_ticket_in_month,
                "status_code": status.HTTP_403_FORBIDDEN,
                "response_data": {
                    "error_message": ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value
                },
            },
            "receiving_relation": {
                "ticket": receiving_ticket,
                "status_code": status.HTTP_403_FORBIDDEN,
                "response_data": None,
            },
            "unrelated_relation": {
                "ticket": unrelated_ticket,
                "status_code": status.HTTP_403_FORBIDDEN,
                "response_data": None,
            },
            "non_existent_ticket": {
                "ticket": non_existent_ticket,
                "status_code": status.HTTP_404_NOT_FOUND,
                "response_data": None,
            },
            "used_ticket": {
                "ticket": used_ticket,
                "status_code": status.HTTP_403_FORBIDDEN,
                "response_data": None,
            },
        }

        client = Client()
        client.force_login(user)

        for case, condition in cases.items():
            with self.subTest(case):
                response = client.put(
                    f"/api/tickets/{condition['ticket'].id}/mark_special/",
                    {},
                    content_type="application/json",
                )

                self.assertEqual(condition["status_code"], response.status_code)

                self.assertEqual(condition["response_data"], response.data)

                if not case in ["non_existent_ticket"]:
                    condition["ticket"].refresh_from_db()
                    self.assertFalse(condition["ticket"].is_special)

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_use(self, slack_mock):
        """
        Put /api/tickets/{ticket_id}/use/
        """

        user = self.seeds.users[1]
        receiving_relation = user.receiving_relations.first()
        ticket = (
            Ticket.objects.filter_eq_user_relation_id(receiving_relation.id)
            .filter(use_date__isnull=True, is_special=False)
            .first()
        )

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }

        client = Client()
        client.force_login(user)

        slack_instance_mock = mock.Mock()
        slack_mock.return_value = slack_instance_mock

        response = client.put(
            f"/api/tickets/{ticket.id}/use/", params, content_type="application/json"
        )

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(ticket.id), response.data["id"])

    @mock.patch("tickets.use_cases.use_ticket.UseTicket.execute")
    def test_use_case_error(self, use_case_mock):
        """
        Put /api/tickets/{ticket_id}/use/
        error case
        """

        test_log = "test_exception_log"
        use_case_mock.side_effect = exceptions.APIException(detail=test_log)

        user = self.seeds.users[1]

        params = {"ticket": {"use_description": "test_use_case_error"}}

        ticket_id = "1"

        client = Client()
        client.force_login(user)

        logger = logging.getLogger("gt_back.exception_handler")

        with self.assertLogs(logger=logger, level=logging.WARN) as cm:
            response = client.put(
                f"/api/tickets/{ticket_id}/use/",
                params,
                content_type="application/json",
            )

        self.assertEqual(status.HTTP_500_INTERNAL_SERVER_ERROR, response.status_code)

        expected_log = [f"WARNING:gt_back.exception_handler:{test_log}"]
        self.assertEqual(expected_log, cm.output)
