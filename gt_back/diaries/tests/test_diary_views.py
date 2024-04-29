from datetime import date, timedelta

from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..enums import DiaryStatus
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
            DiaryFactory(
                user_relation=self.relation,
                date=(date.today() - timedelta(days=2)),
                user_1_status=DiaryStatus.STATUS_READ.value,
            ),
            DiaryFactory(user_relation=self.relation, date=date.today()),
            DiaryFactory(user_relation=self.relation, date=(date.today() - timedelta(days=1))),
        ]
        wrong_relation_entry = DiaryFactory()

        client = self._get_client(self.user)
        res = client.get(f"{self.base_path}?user_relation_id={self.relation.id}")
        (status_code, body) = (res.status_code, res.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [
            {
                "id": str(diary_entries[1].id),
                "entry": diary_entries[1].entry,
                "date": diary_entries[1].date.isoformat(),
                "tags": [],
                "status": diary_entries[1].user_1_status,
            },
            {
                "id": str(diary_entries[2].id),
                "entry": diary_entries[2].entry,
                "date": diary_entries[2].date.isoformat(),
                "tags": [],
                "status": diary_entries[2].user_1_status,
            },
            {
                "id": str(diary_entries[0].id),
                "entry": diary_entries[0].entry,
                "date": diary_entries[0].date.isoformat(),
                "tags": [],
                "status": diary_entries[0].user_1_status,
            },
        ]
        self.assertListEqual(expected, body["diaries"])
        self.assertNotIn(str(wrong_relation_entry.id), [diary["id"] for diary in body["diaries"]])

    def test_list__404_on_wrong_user_relation_id(self):
        wrong_relation = UserRelationFactory()

        client = self._get_client(self.user)
        res = client.get(f"{self.base_path}?user_relation_id={wrong_relation.id}")

        self.assertEqual(status.HTTP_404_NOT_FOUND, res.status_code)

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
        res = client.post(self.base_path, params, content_type="application/json")
        (status_code, body) = (res.status_code, res.json())

        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_diary = Diary.objects.get_by_id(body["id"])
        self.assertEqual(params["user_relation_id"], str(created_diary.user_relation.id))
        self.assertEqual(params["entry"], created_diary.entry)
        self.assertEqual(params["date"], created_diary.date.isoformat())
        self.assertEqual(DiaryStatus.STATUS_READ.value, created_diary.user_1_status)
        self.assertEqual(DiaryStatus.STATUS_UNREAD.value, created_diary.user_2_status)

        associated_tags = created_diary.tags.order_by_sort_no().all()
        self.assertIn(tags[0], associated_tags)
        self.assertIn(tags[1], associated_tags)

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
        res = client.post(self.base_path, params, content_type="application/json")

        self.assertEqual(status.HTTP_404_NOT_FOUND, res.status_code)

    def test_update(self):
        """
        Put /api/diaries/{diary_id}/
        """
        diary = DiaryFactory(
            user_relation=self.relation,
            date=(date.today() - timedelta(days=1)),
            user_1_status=DiaryStatus.STATUS_READ.value,
        )
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
        res = client.put(f"{self.base_path}{diary.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_200_OK, res.status_code)

        diary.refresh_from_db()
        self.assertEqual(params["entry"], diary.entry)
        self.assertEqual(params["date"], diary.date.isoformat())
        self.assertEqual(DiaryStatus.STATUS_READ.value, diary.user_1_status)
        self.assertEqual(DiaryStatus.STATUS_UNREAD.value, diary.user_2_status)

        associated_tags = diary.tags.order_by_sort_no().all()
        self.assertIn(new_tags[0], associated_tags)
        self.assertIn(new_tags[1], associated_tags)
        self.assertNotIn(initial_tag, associated_tags)

    def test_update__no_tags(self):
        """
        Put /api/diaries/{diary_id}/
        """
        diary = DiaryFactory(user_relation=self.relation)
        initial_tag = DiaryTagFactory(user_relation=self.relation, sort_no=2)
        DiaryTagRelation.objects.create(diary=diary, tag_master=initial_tag)

        params = {
            "entry": diary.entry,
            "date": diary.date.isoformat(),
            "tag_ids": [],
        }

        client = self._get_client(self.user)
        res = client.put(f"{self.base_path}{diary.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_200_OK, res.status_code)

        diary.refresh_from_db()
        associated_tags = diary.tags.order_by_sort_no().all()
        self.assertNotIn(initial_tag, associated_tags)

    def test_update__status_changes(self):
        """
        Put /api/diaries/{diary_id}/
        """
        diary = DiaryFactory(user_relation=self.relation, user_1_status=DiaryStatus.STATUS_READ.value)

        params = {
            "entry": diary.entry,
            "date": date.today().isoformat(),
            "tag_ids": [],
        }

        client = self._get_client(self.user)

        cases = [
            {"original": DiaryStatus.STATUS_UNREAD.value, "expected": DiaryStatus.STATUS_UNREAD.value},
            {"original": DiaryStatus.STATUS_READ.value, "expected": DiaryStatus.STATUS_EDITED.value},
            {"original": DiaryStatus.STATUS_EDITED.value, "expected": DiaryStatus.STATUS_EDITED.value},
        ]

        for case in cases:
            with self.subTest(
                case=f"If user_2_status is originally {case['original']}, expected to be {case['expected']}"
            ):
                diary.user_2_status = case["original"]
                diary.save()

                res = client.put(f"{self.base_path}{diary.id}/", params, content_type="application/json")

                self.assertEqual(status.HTTP_200_OK, res.status_code)

                diary.refresh_from_db()
                self.assertEqual(DiaryStatus.STATUS_READ.value, diary.user_1_status)
                self.assertEqual(case["expected"], diary.user_2_status)

    def test_update__404_on_wrong_user_relations_diary(self):
        wrong_relation_diary = DiaryFactory(date=(date.today() - timedelta(days=1)))

        params = {
            "entry": wrong_relation_diary.entry,
            "date": wrong_relation_diary.date.isoformat(),
            "tag_ids": [],
        }

        client = self._get_client(self.user)
        res = client.put(f"{self.base_path}{wrong_relation_diary.id}/", params, content_type="application/json")

        self.assertEqual(status.HTTP_404_NOT_FOUND, res.status_code)

    """
    Utility Functions
    """

    def _get_client(self, user) -> Client:
        client = Client()
        client.force_login(user)
        return client
