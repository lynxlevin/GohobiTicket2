from datetime import date, timedelta

from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from .diary_factory import DiaryFactory


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
        diary_entries = [
            DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=2))),
            DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1))),
            DiaryFactory(user_relation=self.relation, date=date.today()),
        ]


        status_code, body = self._make_get_request(self.user, f"{self.base_path}?relation={self.relation.id}")

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [{"id": str(entry.id), "entry": entry.entry, "date": entry.date.isoformat()} for entry in sorted(diary_entries, key=lambda entry: entry.date, reverse=True)]
        self.assertListEqual(expected, body["diaries"])


    """
    Utility Functions
    """

    def _make_get_request(self, user, path):
        client = Client()
        client.force_login(user)
        response = client.get(path)
        return (response.status_code, response.json())
