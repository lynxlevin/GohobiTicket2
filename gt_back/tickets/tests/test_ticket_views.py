import os
from test.support import EnvironmentVarGuard
from unittest import mock
from datetime import date, datetime
from django.test import Client, TestCase
from gt_back.messages import ErrorMessages, SlackMessageTemplates
from rest_framework import status

from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TestTicketViews(TestCase):
    def setUp(self):
        self.env = EnvironmentVarGuard()
        self.env.set("SLACK_API_URL", "https://test_api/")

    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_create(self):
        """
        Post /tickets/
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

        query = Ticket.objects.filter_eq_user_relation_id(giving_relation.id)
        count_before_create = query.count()

        response = client.post("/tickets/", params,
                               content_type="application/json")

        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        count_after_create = query.count()
        self.assertEqual(count_before_create + 1, count_after_create)

        created_ticket = Ticket.objects.get_by_id(response.data["id"])

        expected_date = datetime.strptime(
            params["ticket"]["gift_date"], "%Y-%m-%d").date()
        self.assertEqual(expected_date, created_ticket.gift_date)
        self.assertEqual(params["ticket"]["description"],
                         created_ticket.description)
        self.assertEqual(params["ticket"]["user_relation_id"],
                         created_ticket.user_relation_id)

    def test_create_case_error(self):
        """
        Post /tickets
        error cases
        """

        user = self.seeds.users[1]

        unrelated_relation_id = self.seeds.user_relations[2].id
        receiving_relation_id = user.receiving_relations.first().id

        cases = {
            "unrelated_user": {"id": unrelated_relation_id, "status_code": status.HTTP_403_FORBIDDEN},
            "receiving_relation": {"id": receiving_relation_id, "status_code": status.HTTP_403_FORBIDDEN},
            "non_existent_user_relation": {"id": "-1", "status_code": status.HTTP_404_NOT_FOUND},
        }

        client = Client()
        client.force_login(user)

        for case, condition in cases.items():
            with self.subTest(case=case):
                params = {
                    "ticket": {
                        "gift_date": "2022-08-24",
                        "description": "test_ticket",
                        "user_relation_id": condition["id"],
                    }
                }

                original_ticket_count = Ticket.objects.filter_eq_user_relation_id(
                    condition["id"]).count()

                response = client.post(f"/tickets/", params,
                                       content_type="application/json")
                self.assertEqual(
                    condition["status_code"], response.status_code)

                pro_execution_ticket_count = Ticket.objects.filter_eq_user_relation_id(
                    condition["id"]).count()
                self.assertEqual(original_ticket_count,
                                 pro_execution_ticket_count)

    def test_partial_update(self):
        """
        Patch /tickets/{ticket_id}/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation.id).first()

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "description": "updated description",
            }
        }
        original_updated_at = ticket.updated_at

        response = client.patch(
            f"/tickets/{ticket.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        self.assertEqual(str(ticket.id), response.data["id"])

        ticket.refresh_from_db()
        self.assertEqual(params["ticket"]["description"], ticket.description)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def test_partial_update_case_error(self):
        """
        Patch /tickets/{ticket_id}/
        error cases
        """

        user = self.seeds.users[1]

        receiving_relation_id = user.receiving_relations.first().id
        receiving_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation_id).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        cases = {
            "receiving_relation": {"ticket": receiving_ticket, "status_code": status.HTTP_403_FORBIDDEN},
            "unrelated_ticket": {"ticket": unrelated_ticket, "status_code": status.HTTP_403_FORBIDDEN},
            "non_existent_ticket": {"ticket": non_existent_ticket, "status_code": status.HTTP_404_NOT_FOUND},
        }

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "description": "updated description",
            }
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                response = client.patch(
                    f"/tickets/{condition['ticket'].id}/", params, content_type="application/json")

                self.assertEqual(
                    condition["status_code"], response.status_code)

                if not case in ["non_existent_ticket"]:
                    condition["ticket"].refresh_from_db()
                    self.assertNotEqual(
                        params["ticket"]["description"], condition["ticket"].description)

    def test_destroy(self):
        """
        Delete /tickets/{ticket_id}/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()

        client = Client()
        client.force_login(user)

        query = Ticket.objects.filter_eq_user_relation_id(giving_relation.id)
        ticket = query.first()
        original_ticket_count = query.count()

        response = client.delete(f"/tickets/{ticket.id}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)

        self.assertIsNone(Ticket.objects.get_by_id(ticket.id))
        pro_execution_ticket_count = query.count()
        self.assertEqual(original_ticket_count - 1, pro_execution_ticket_count)

    def test_destroy_case_error(self):
        """
        Delete /tickets/{ticket_id}/
        error case
        """

        user = self.seeds.users[1]

        receiving_relation_id = user.receiving_relations.first().id
        receiving_ticket_id = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation_id).first().id

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket_id = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id).first().id

        giving_relation_id = user.giving_relations.first().id
        used_ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation_id).first()
        used_ticket.use_date = date.today()
        used_ticket.save()

        cases = {
            "receiving_relation": {"ticket_id": receiving_ticket_id, "status_code": status.HTTP_403_FORBIDDEN},
            "unrelated_relation": {"ticket_id": unrelated_ticket_id, "status_code": status.HTTP_403_FORBIDDEN},
            "non_existent_ticket": {"ticket_id": "-1", "status_code": status.HTTP_404_NOT_FOUND},
            "used_ticket": {"ticket_id": used_ticket.id, "status_code": status.HTTP_403_FORBIDDEN},
        }

        client = Client()
        client.force_login(user)

        for case, condition in cases.items():
            with self.subTest(case=case):
                response = client.delete(f"/tickets/{condition['ticket_id']}/")

                self.assertEqual(
                    condition["status_code"], response.status_code)

                if not case in ["non_existent_ticket"]:
                    self.assertIsNotNone(
                        Ticket.objects.get_by_id(condition["ticket_id"]))

    def test_mark_special(self):
        """
        Put /tickets/{ticket_id}/mark_special/
        """

        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        gift_date = datetime.strptime("2022-05-01", "%Y-%m-%d").date()
        ticket = Ticket(description="to be special", gift_date=gift_date,
                        user_relation=giving_relation, is_special=False)
        ticket.save()

        client = Client()
        client.force_login(user)

        original_updated_at = ticket.updated_at

        response = client.put(
            f"/tickets/{ticket.id}/mark_special/", {}, content_type="application/json")

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
            receiving_relation_id).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        giving_relation = user.giving_relations.first()
        used_ticket = Ticket(description="used_ticket", user_relation=giving_relation,
                             gift_date=date.today(), use_date=date.today())
        used_ticket.save()

        cases = {
            "multiple_special_tickets_in_month": {
                "ticket": second_special_ticket_in_month,
                "status_code": status.HTTP_403_FORBIDDEN,
                "response_data": {"error_message": ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value},
            },
            "receiving_relation": {"ticket": receiving_ticket, "status_code": status.HTTP_403_FORBIDDEN, "response_data": None},
            "unrelated_relation": {"ticket": unrelated_ticket, "status_code": status.HTTP_403_FORBIDDEN, "response_data": None},
            "non_existent_ticket": {"ticket": non_existent_ticket, "status_code": status.HTTP_404_NOT_FOUND, "response_data": None},
            "used_ticket": {"ticket": used_ticket, "status_code": status.HTTP_403_FORBIDDEN, "response_data": None},
        }

        client = Client()
        client.force_login(user)

        for case, condition in cases.items():
            with self.subTest(case):
                response = client.put(
                    f"/tickets/{condition['ticket'].id}/mark_special/", {}, content_type="application/json")

                self.assertEqual(
                    condition["status_code"], response.status_code)

                self.assertEqual(condition["response_data"], response.data)

                if not case in ["non_existent_ticket"]:
                    condition["ticket"].refresh_from_db()
                    self.assertFalse(condition["ticket"].is_special)

    @mock.patch("requests.post")
    def test_use(self, requests_mock):
        """
        Put /tickets/{ticket_id}/use/
        """

        user = self.seeds.users[1]
        receiving_relation = user.receiving_relations.first()
        normal_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation.id).filter(use_date__isnull=True, is_special=False).first()

        special_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation.id).filter(use_date__isnull=True, is_special=True).first()

        params = {
            "ticket": {
                "use_description": "test_use_ticket",
            }
        }

        cases = {
            "normal_ticket": {"ticket": normal_ticket, "supposed_message_method": "get_message"},
            "special_ticket": {"ticket": special_ticket, "supposed_message_method": "get_special_message"},
        }

        client = Client()
        client.force_login(user)

        for case, condition in cases.items():
            with self.subTest(case=case):
                ticket = condition["ticket"]
                requests_mock.reset_mock()

                original_updated_at = ticket.updated_at

                response = client.put(
                    f"/tickets/{ticket.id}/use/", params, content_type="application/json")

                self.assertEqual(status.HTTP_202_ACCEPTED,
                                 response.status_code)

                self.assertEqual(str(ticket.id), response.data["id"])

                ticket.refresh_from_db()
                self.assertEqual(date.today(), ticket.use_date)
                self.assertEqual(params["ticket"]["use_description"],
                                 ticket.use_description)
                self.assertNotEqual(original_updated_at, ticket.updated_at)

                url = os.getenv("SLACK_API_URL")
                slack_message = SlackMessageTemplates()
                message = getattr(slack_message, condition["supposed_message_method"])(
                    ticket_user_name=user.username,
                    ticket_gifter_name=ticket.user_relation.giving_user.username,
                    use_description=params["ticket"]["use_description"],
                    description=ticket.description,
                )
                header = {"Content-type": "application/json"}

                requests_mock.assert_called_once_with(
                    url, data=message, headers=header, timeout=(5.0, 30.0))

    def test_use_case_error(self):
        user = self.seeds.users[1]

        params = {"ticket": {"use_description": "test_use_case_error"}}

        giving_relation_id = user.giving_relations.first().id
        giving_ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation_id).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        receiving_relation = user.receiving_relations.first()
        used_ticket = Ticket(description="used_ticket", user_relation=receiving_relation,
                             gift_date=date.today(), use_date=date.today())
        used_ticket.save()

        cases = {
            "giving_relation": {"ticket": giving_ticket, "status_code": status.HTTP_403_FORBIDDEN},
            "unrelated_relation": {"ticket": unrelated_ticket, "status_code": status.HTTP_403_FORBIDDEN},
            "non_existent_ticket": {"ticket": non_existent_ticket, "status_code": status.HTTP_404_NOT_FOUND},
            "used_ticket": {"ticket": used_ticket, "status_code": status.HTTP_403_FORBIDDEN},
        }

        client = Client()
        client.force_login(user)

        for case, condition in cases.items():
            with self.subTest(case):
                response = client.put(
                    f"/tickets/{condition['ticket'].id}/use/", params, content_type="application/json")

                self.assertEqual(
                    condition["status_code"], response.status_code)

                if not case in ["non_existent_ticket", "used_ticket"]:
                    condition["ticket"].refresh_from_db()
                    self.assertIsNone(condition["ticket"].use_date)
                    self.assertEqual("", condition["ticket"].use_description)

    # MYMEMO: use (use_date, use_description, send_slack)
    # MYMEMO: DRAFTS
    # MYMEMO: create (normal_create, status="draft") maybe change default to draft and use make_official
    # MYMEMO: update (error_when_not_draft, normal_partial_update) maybe normal partial_update suffices
    # MYMEMO: post -> make_official (error_when_not_draft, status="unread", normal_partial_update)
