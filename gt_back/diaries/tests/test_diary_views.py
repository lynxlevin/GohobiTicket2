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
            DiaryFactory(user_relation=self.relation, date=date.today()),
            DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1))),
        ]
        _wrong_relation_entry = DiaryFactory()

        client = self._get_client(self.user)
        response = client.get(f"{self.base_path}?user_relation_id={self.relation.id}")
        (status_code, body) = (response.status_code, response.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [
            {
                "id": str(diary_entries[1].id),
                "entry": diary_entries[1].entry,
                "date": diary_entries[1].date.isoformat(),
                "tags": [],
            },
            {
                "id": str(diary_entries[2].id),
                "entry": diary_entries[2].entry,
                "date": diary_entries[2].date.isoformat(),
                "tags": [],
            },
            {
                "id": str(diary_entries[0].id),
                "entry": diary_entries[0].entry,
                "date": diary_entries[0].date.isoformat(),
                "tags": [],
            },
        ]
        self.assertListEqual(expected, body["diaries"])

    def test_list__404_on_wrong_user_relation_id(self):
        wrong_relation = UserRelationFactory()

        client = self._get_client(self.user)
        response = client.get(f"{self.base_path}?user_relation_id={wrong_relation.id}")

        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

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
        self.assertTrue(tags[0] in associated_tags)
        self.assertTrue(tags[1] in associated_tags)

    def test_create__404_on_wrong_user_relation_id(self):
        """
        Post /api/diaries/
        Wrong user_relation
        """
        wrong_relation = UserRelationFactory()
        params = {
            "user_relation_id": str(wrong_relation.id),
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
        diary = DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1)))
        initial_tag = DiaryTagFactory(user_relation=self.relation, sort_no=2)
        new_tags = [
            DiaryTagFactory(user_relation=self.relation),
            DiaryTagFactory(user_relation=self.relation, sort_no=3),
        ]
        DiaryTagRelation.objects.create(diary=diary, tag_master=initial_tag)

        params = {
            "entry": "Newly updated entry.",
            "date": date.today().isoformat(),
            "tag_ids": [str(tag.id) for tag in new_tags],
        }

        client = self._get_client(self.user)
        response = client.put(f"{self.base_path}{diary.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        diary.refresh_from_db()
        self.assertEqual(params["entry"], diary.entry)
        self.assertEqual(params["date"], diary.date.isoformat())

        associated_tags = diary.tags.order_by_sort_no().all()
        self.assertFalse(initial_tag in associated_tags)
        self.assertTrue(new_tags[0] in associated_tags)
        self.assertTrue(new_tags[1] in associated_tags)

    def test_update__no_tags(self):
        """
        Put /api/diaries/{diary_id}/
        """
        diary = DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1)))
        initial_tag = DiaryTagFactory(user_relation=self.relation, sort_no=2)
        DiaryTagRelation.objects.create(diary=diary, tag_master=initial_tag)

        params = {
            "entry": diary.entry,
            "date": diary.date.isoformat(),
            "tag_ids": [],
        }

        client = self._get_client(self.user)
        response = client.put(f"{self.base_path}{diary.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        diary.refresh_from_db()
        associated_tags = diary.tags.order_by_sort_no().all()
        self.assertFalse(initial_tag in associated_tags)

    def test_update__404_on_wrong_user_relations_diary(self):
        wrong_relation_diary = DiaryFactory(date=(date.today() - timedelta(days=1)))

        params = {
            "entry": wrong_relation_diary.entry,
            "date": wrong_relation_diary.date.isoformat(),
            "tag_ids": [],
        }

        client = self._get_client(self.user)
        response = client.put(f"{self.base_path}{wrong_relation_diary.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    """
    Utility Functions
    """

    def _get_client(self, user) -> Client:
        client = Client()
        client.force_login(user)
        return client
