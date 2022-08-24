from datetime import datetime
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
        Get /tickets
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
        Post /tickets
        """

        user = self.seeds.users[0]
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

        response = client.post(f"/tickets/", params,
                               content_type="application/json")
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)

        count_after_create = query.count()
        self.assertEqual(count_before_create + 1, count_after_create)

        created_ticket = Ticket.objects.get_by_id(response.data["ticket_id"])

        expected_date = datetime.strptime(
            params["ticket"]["gift_date"], "%Y-%m-%d").date()
        self.assertEqual(expected_date,
                         created_ticket.gift_date)
        self.assertEqual(params["ticket"]["description"],
                         created_ticket.description)
        self.assertEqual(params["ticket"]["user_relation_id"],
                         created_ticket.user_relation_id)

    def test_create_case_error_wrong_user(self):
        """
        Post /tickets
        receiving_user cannot create
        """

        user = self.seeds.users[0]
        receiving_relation = user.receiving_relations.first()

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": receiving_relation.id,
            }
        }

        response = client.post(f"/tickets/", params,
                               content_type="application/json")
        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_create_case_error_non_existent_user_relation(self):
        """
        Post /tickets
        404 on non existent user_relation
        """

        user = self.seeds.users[0]
        non_existent_user_relation_id = "-1"

        client = Client()
        client.force_login(user)

        params = {
            "ticket": {
                "gift_date": "2022-08-24",
                "description": "test_ticket",
                "user_relation_id": non_existent_user_relation_id,
            }
        }

        response = client.post(f"/tickets/", params,
                               content_type="application/json")
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)
