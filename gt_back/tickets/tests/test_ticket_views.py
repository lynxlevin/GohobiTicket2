from datetime import date, datetime
from django.test import Client, TestCase
from rest_framework import status

from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_list(self):
        """
        Get /tickets/
        """

        user = self.seeds.users[0]

        client = Client()
        client.force_login(user)
        response = client.get("/tickets/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data

        self.assertEqual(len(self.seeds.tickets), len(data))

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

        cases = [
            {"name": "unrelated_user", "id": unrelated_relation_id,
                "status_code": status.HTTP_403_FORBIDDEN},
            {"name": "receiving_relation", "id": receiving_relation_id,
                "status_code": status.HTTP_403_FORBIDDEN},
            {"name": "non_existent_user_relation", "id": "-1",
                "status_code": status.HTTP_404_NOT_FOUND},
        ]

        client = Client()
        client.force_login(user)

        for case in cases:
            with self.subTest(case=case["name"]):
                params = {
                    "ticket": {
                        "gift_date": "2022-08-24",
                        "description": "test_ticket",
                        "user_relation_id": case["id"],
                    }
                }

                original_ticket_count = Ticket.objects.filter_eq_user_relation_id(
                    case["id"]).count()

                response = client.post(f"/tickets/", params,
                                       content_type="application/json")
                self.assertEqual(case["status_code"], response.status_code)

                pro_execution_ticket_count = Ticket.objects.filter_eq_user_relation_id(
                    case["id"]).count()
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

        cases = [
            {"name": "receiving_relation", "ticket": receiving_ticket,
                "status_code": status.HTTP_403_FORBIDDEN},
            {"name": "unrelated_ticket", "ticket": unrelated_ticket,
                "status_code": status.HTTP_403_FORBIDDEN},
            {"name": "non_existent_ticket", "ticket": non_existent_ticket,
                "status_code": status.HTTP_404_NOT_FOUND},
        ]

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "description": "updated description",
            }
        }

        for case in cases:
            with self.subTest(case=case["name"]):
                response = client.patch(
                    f"/tickets/{case['ticket'].id}/", params, content_type="application/json")

                self.assertEqual(case["status_code"], response.status_code)

                if not case["name"] in ["non_existent_ticket"]:
                    case["ticket"].refresh_from_db()
                    self.assertNotEqual(
                        params["ticket"]["description"], case["ticket"].description)

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

        cases = [
            {"name": "receiving_relation", "ticket_id": receiving_ticket_id,
                "status_code": status.HTTP_403_FORBIDDEN},
            {"name": "unrelated_relation", "ticket_id": unrelated_ticket_id,
                "status_code": status.HTTP_403_FORBIDDEN},
            {"name": "non_existent_ticket", "ticket_id": "-1",
                "status_code": status.HTTP_404_NOT_FOUND},
            {"name": "used_ticket", "ticket_id": used_ticket.id,
                "status_code": status.HTTP_403_FORBIDDEN},
        ]

        client = Client()
        client.force_login(user)

        for case in cases:
            with self.subTest(case=case["name"]):
                response = client.delete(f"/tickets/{case['ticket_id']}/")

                self.assertEqual(case["status_code"], response.status_code)

                if not case["name"] in ["non_existent_ticket"]:
                    self.assertIsNotNone(
                        Ticket.objects.get_by_id(case["ticket_id"]))
