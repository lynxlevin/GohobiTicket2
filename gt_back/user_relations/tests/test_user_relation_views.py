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

    # MYMEMO: 内容ごとに user_relations/id/tickets とかに分けるのが REST かも
    def test_retrieve(self):
        """
        Get /api/user_relations/{id}
        """

        user = self.seeds.users[0]
        user_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data
        self.assertNotEqual(0, len(data))

    def test_retrieve_not_authenticated(self):
        """
        Get /api/user_relations/{id}
        403 Forbidden: when not logged in
        """

        user_relation = self.seeds.user_relations[2]

        client = Client()
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_retrieve_non_related_user(self):
        """
        Get /api/user_relations/{id}
        403 Forbidden: when wrong login
        """

        user = self.seeds.users[2]
        _user_relation = self.seeds.user_relations[2]

        other_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/api/user_relations/{other_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)
