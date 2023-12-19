from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestDiaryViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/diaries/"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(giving_user=cls.user, receiving_user=cls.partner)

    def test_list(self):
        """
        Get /api/diaries/?relation={relation_id}
        """
        status_code, body = self._make_get_request(self.user, f"{self.base_path}?relation={self.relation.id}")

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = []
        self.assertListEqual(expected, body["diaries"])
    """
    Utility Functions
    """

    def _make_get_request(self, user, path):
        client = Client()
        client.force_login(user)
        response = client.get(path)
        return (response.status_code, response.json())
