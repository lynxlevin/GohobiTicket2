from datetime import date, timedelta

from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..models import Diary
from .diary_factory import DiaryTagFactory


class TestDiaryTagViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/diary_tags/"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(giving_user=cls.user, receiving_user=cls.partner)

    def test_list(self):
        """
        Get /api/diary_tags/?user_relation_ids={relation_id}
        """
        diary_tags = [
            DiaryTagFactory(user_relation=self.relation, sort_no=3),
            DiaryTagFactory(user_relation=self.relation, sort_no=1),
            DiaryTagFactory(user_relation=self.relation, sort_no=2),
        ]
        _another_relation_entry = DiaryTagFactory()

        status_code, body = self._make_get_request(self.user, f"{self.base_path}?user_relation_id={self.relation.id}")

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [
            {"id": str(tag.id), "text": tag.text, "sort_no": tag.sort_no}
            for tag
            in sorted(diary_tags, key=lambda tag: tag.sort_no)
        ]
        self.assertListEqual(expected, body["diary_tags"])

    # def test_list__404_on_wrong_user_relation_id(self):

    # def test_create(self):
    #     """
    #     Post /api/diaries/
    #     """
    #     params = {
    #         "user_relation_id": str(self.relation.id),
    #         "entry": "Newly created entry.",
    #         "date": date.today().isoformat(),
    #     }

    #     status_code, body = self._make_post_request(self.user, self.base_path, params)

    #     self.assertEqual(status.HTTP_201_CREATED, status_code)

    #     created_diary = Diary.objects.get_by_id(body["id"])
    #     self.assertEqual(params["user_relation_id"], str(created_diary.user_relation.id))
    #     self.assertEqual(params["entry"], created_diary.entry)
    #     self.assertEqual(params["date"], created_diary.date.isoformat())

    # def test_create__400_on_wrong_user_relation_id(self):

    # def test_update(self):
    #     """
    #     Put /api/diaries/{diary_id}/
    #     """
    #     diary = DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1)))
    #     params = {
    #         "entry": "Newly updated entry.",
    #         "date": date.today().isoformat(),
    #     }

    #     status_code, body = self._make_put_request(self.user, f"{self.base_path}{diary.id}/", params)

    #     self.assertEqual(status.HTTP_200_OK, status_code)

    #     diary.refresh_from_db()
    #     self.assertEqual(str(self.relation.id), str(diary.user_relation.id))
    #     self.assertEqual(params["entry"], diary.entry)
    #     self.assertEqual(params["date"], diary.date.isoformat())

    # def test_update__404_on_wrong_user_relations_diary(self):


    """
    Utility Functions
    """

    def _make_get_request(self, user, path):
        client = Client()
        client.force_login(user)
        response = client.get(path)
        return (response.status_code, response.json())

    def _make_post_request(self, user, path, params):
        client = Client()
        client.force_login(user)
        response = client.post(path, params, content_type="application/json")
        return (response.status_code, response.json())

    def _make_put_request(self, user, path, params):
        client = Client()
        client.force_login(user)
        response = client.put(path, params, content_type="application/json")
        return (response.status_code, response.json())
