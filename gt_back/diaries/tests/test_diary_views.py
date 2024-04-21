from datetime import date, timedelta

from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..models import Diary, DiaryTagRelation
from .diary_factory import DiaryFactory, DiaryTagFactory


class TestDiaryViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/diaries/"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_list(self):
        """
        Get /api/diaries/?user_relation_id={relation_id}
        """
        diary_entries = [
            DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=2))),
            DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1))),
            DiaryFactory(user_relation=self.relation, date=date.today()),
        ]
        _another_relation_entry = DiaryFactory()

        client = self._get_client(self.user)
        response = client.get(f"{self.base_path}?user_relation_id={self.relation.id}")
        (status_code, body) = (response.status_code, response.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [
            {"id": str(entry.id), "entry": entry.entry, "date": entry.date.isoformat(), "tags": []}
            for entry in sorted(diary_entries, key=lambda entry: entry.date, reverse=True)
        ]
        self.assertListEqual(expected, body["diaries"])

    # def test_list__404_on_wrong_user_relation_id(self):

    def test_create(self):
        """
        Post /api/diaries/
        """
        tags = [
            DiaryTagFactory(user_relation=self.relation),
            DiaryTagFactory(user_relation=self.relation, sort_no=2),
        ]
        params = {
            "user_relation_id": str(self.relation.id),
            "entry": "Newly created entry.",
            "date": date.today().isoformat(),
            "tag_ids": [str(tag.id) for tag in tags],
        }

        client = self._get_client(self.user)
        response = client.post(self.base_path, params, content_type="application/json")
        (status_code, body) = (response.status_code, response.json())

        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_diary = Diary.objects.get_by_id(body["id"])
        self.assertEqual(params["user_relation_id"], str(created_diary.user_relation.id))
        self.assertEqual(params["entry"], created_diary.entry)
        self.assertEqual(params["date"], created_diary.date.isoformat())
        associated_tags = created_diary.tags.order_by_sort_no().all()
        self.assertEqual(tags[0].id, associated_tags[0].id)
        self.assertEqual(tags[1].id, associated_tags[1].id)

    def test_create__404_on_wrong_user_relation_id(self):
        """
        Post /api/diaries/
        Wrong user_relation
        """
        other_relation = UserRelationFactory()
        params = {
            "user_relation_id": str(other_relation.id),
            "entry": "Newly created entry.",
            "date": date.today().isoformat(),
            "tag_ids": [],
        }

        client = self._get_client(self.user)
        response = client.post(self.base_path, params, content_type="application/json")

        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_update(self):
        """
        Put /api/diaries/{diary_id}/
        """
        tags = [
            DiaryTagFactory(user_relation=self.relation),
            DiaryTagFactory(user_relation=self.relation, sort_no=2),
            DiaryTagFactory(user_relation=self.relation, sort_no=3),
        ]
        diary = DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1)))
        DiaryTagRelation.objects.create(diary=diary, tag_master=tags[1])

        params = {
            "entry": "Newly updated entry.",
            "date": date.today().isoformat(),
            "tag_ids": [str(tags[0].id), str(tags[2].id)],
        }

        client = self._get_client(self.user)
        response = client.put(f"{self.base_path}{diary.id}/", params, content_type="application/json")
        (status_code, body) = (response.status_code, response.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        diary.refresh_from_db()
        self.assertEqual(str(self.relation.id), str(diary.user_relation.id))
        self.assertEqual(params["entry"], diary.entry)
        self.assertEqual(params["date"], diary.date.isoformat())

        associated_tags = diary.tags.order_by_sort_no().all()
        self.assertEqual(tags[0].id, associated_tags[0].id)
        self.assertEqual(tags[2].id, associated_tags[1].id)

    # def test_update__404_on_wrong_user_relations_diary(self):

    """
    Utility Functions
    """

    def _get_client(self, user) -> Client:
        client = Client()
        client.force_login(user)
        return client
