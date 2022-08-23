from datetime import date
from django.test import Client, TestCase
from rest_framework import status

from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TestUserRelationViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_retrieve(self):
        """
        Get /user_relations/{id}
        """

        user = self.seeds.users[0]
        user_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data

        tickets = Ticket.objects.filter_eq_user_relation_id(
            user_relation.id).order_by("-gift_date", "id")
        self.assertEqual(len(list(tickets)), len(data))

        expected_first = {
            "user_relation": user_relation.id,
            "description": tickets[0].description,
            "gift_date": tickets[0].gift_date.strftime("%Y-%m-%d") if tickets[0].gift_date is not None else None,
            "use_description": tickets[0].use_description,
            "use_date": tickets[0].use_date.strftime("%Y-%m-%d") if tickets[0].use_date is not None else None,
            "status": tickets[0].status,
            "is_special": tickets[0].is_special,
        }
        self.assertDictEqual(expected_first, data[0])

        expected_last = {
            "user_relation": user_relation.id,
            "description": tickets.last().description,
            "gift_date": tickets.last().gift_date.strftime("%Y-%m-%d") if tickets.last().gift_date is not None else None,
            "use_description": tickets.last().use_description,
            "use_date": tickets.last().use_date.strftime("%Y-%m-%d") if tickets.last().use_date is not None else None,
            "status": tickets.last().status,
            "is_special": tickets.last().is_special,
        }
        self.assertDictEqual(expected_last, data[-1])

        # assert order: -gift_date
        self.assertTrue(data[0]["gift_date"] > data[-1]["gift_date"])

        # assert filter: only this user_relation
        all_tickets = Ticket.objects.all()
        self.assertNotEqual(len(all_tickets), len(data))

    def test_retrieve_not_authenticated(self):
        """
        Get /user_relations/{id}
        403 Forbidden: when not logged in
        """

        user_relation = self.seeds.user_relations[2]

        client = Client()
        response = client.get(f"/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_retrieve_non_related_user(self):
        """
        Get /user_relations/{id}
        403 Forbidden: when wrong login
        """

        user = self.seeds.users[2]
        _user_relation = self.seeds.user_relations[2]

        other_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/user_relations/{other_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
