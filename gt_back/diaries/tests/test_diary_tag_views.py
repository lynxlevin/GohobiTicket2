from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..models import DiaryTag
from .diary_factory import DiaryFactory, DiaryTagFactory


class TestDiaryTagViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.base_path = "/api/diary_tags/"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_list(self):
        """
        Get /api/diary_tags/?user_relation_id={relation_id}
        """
        diary_tags = [
            DiaryTagFactory(user_relation=self.relation, sort_no=3),
            DiaryTagFactory(user_relation=self.relation, sort_no=1),
            DiaryTagFactory(user_relation=self.relation, sort_no=2),
        ]
        wrong_relation_entry = DiaryTagFactory()

        client = self._get_client(self.user)
        res = client.get(f"{self.base_path}?user_relation_id={self.relation.id}")
        (status_code, body) = (res.status_code, res.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = [
            {"id": str(diary_tags[1].id), "text": diary_tags[1].text, "sort_no": diary_tags[1].sort_no},
            {"id": str(diary_tags[2].id), "text": diary_tags[2].text, "sort_no": diary_tags[2].sort_no},
            {"id": str(diary_tags[0].id), "text": diary_tags[0].text, "sort_no": diary_tags[0].sort_no},
        ]
        self.assertListEqual(expected, body["diary_tags"])
        self.assertNotIn(str(wrong_relation_entry.id), [tag["id"] for tag in body["diary_tags"]])

    def test_list__empty_on_wrong_user_relation_id(self):
        """
        Get /api/diary_tags/?user_relation_id={relation_id}
        """
        wrong_relation = UserRelationFactory()
        _wrong_relation_tags = [
            DiaryTagFactory(user_relation=wrong_relation, sort_no=3),
            DiaryTagFactory(user_relation=wrong_relation, sort_no=1),
            DiaryTagFactory(user_relation=wrong_relation, sort_no=2),
        ]

        client = self._get_client(self.user)
        res = client.get(f"{self.base_path}?user_relation_id={wrong_relation.id}")
        (status_code, body) = (res.status_code, res.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        self.assertEqual(0, len(body["diary_tags"]))

    def test_get(self):
        """
        Get /api/diary_tags/{tag_id}/
        """
        diary_tag = DiaryTagFactory(user_relation=self.relation, sort_no=1)
        diary_for_showing_count = DiaryFactory(user_relation=self.relation)
        diary_for_showing_count.tags.set([diary_tag])

        client = self._get_client(self.user)
        res = client.get(f"{self.base_path}{diary_tag.id}/")
        (status_code, body) = (res.status_code, res.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        expected = {"id": str(diary_tag.id), "text": diary_tag.text, "sort_no": diary_tag.sort_no, "diary_count": 1}
        self.assertDictEqual(expected, body)

    def test_get__404_on_wrong_user_relations_tag(self):
        wrong_relation_diary_tag = DiaryTagFactory(sort_no=1)

        client = self._get_client(self.user)
        res = client.get(f"{self.base_path}{wrong_relation_diary_tag.id}/")

        self.assertEqual(status.HTTP_404_NOT_FOUND, res.status_code)

    def test_bulk_update(self):
        """
        Post /api/diary_tags/bulk_update/
        """
        existing_tags = [
            DiaryTagFactory(user_relation=self.relation, sort_no=1, text="tag_1"),
            DiaryTagFactory(user_relation=self.relation, sort_no=2, text="tag_2"),
            DiaryTagFactory(user_relation=self.relation, sort_no=3, text="tag_3"),
            DiaryTagFactory(user_relation=self.relation, sort_no=4, text="tag_4"),
        ]

        params = {
            "diary_tags": [
                {"id": str(existing_tags[0].id), "text": "tag_1->1", "sort_no": 1},
                {"id": str(existing_tags[1].id), "text": "tag_2->4", "sort_no": 4},
                {"id": str(existing_tags[2].id), "text": "tag_3->2", "sort_no": 2},
                {"id": None, "text": "new_tag", "sort_no": 3},
            ],
            "user_relation_id": str(self.relation.id),
        }

        client = self._get_client(self.user)
        res = client.post(f"{self.base_path}bulk_update/", params, content_type="application/json")
        status_code, body = (res.status_code, res.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        tags = body["diary_tags"]
        expected = [
            *sorted(params["diary_tags"], key=lambda t: t["sort_no"]),
            {"id": str(existing_tags[3].id), "text": existing_tags[3].text, "sort_no": 5},
        ]
        self.assertEqual(len(expected), len(tags))
        for param_tag, tag in zip(expected, tags):
            if param_tag["id"]:
                self.assertEqual(param_tag["id"], tag["id"])
            self.assertEqual(param_tag["text"], tag["text"])
            self.assertEqual(param_tag["sort_no"], tag["sort_no"])

        tags_in_db = DiaryTag.objects.filter(id__in=(t["id"] for t in tags)).order_by_sort_no()
        self.assertEqual(len(expected), len(tags_in_db))
        for param_tag, tag_in_db in zip(expected, tags_in_db):
            if param_tag["id"]:
                self.assertEqual(param_tag["id"], str(tag_in_db.id))
            self.assertEqual(param_tag["text"], tag_in_db.text)
            self.assertEqual(param_tag["sort_no"], tag_in_db.sort_no)

    def test_bulk_update__create_new_if_other_relation_tag(self):
        """
        Post /api/diary_tags/bulk_update/
        In case when one of the ids in the body references a tag for wrong relation.
        Just ignore the id and treat the same way as when id=None.
        """
        existing_tag = DiaryTagFactory(user_relation=self.relation, sort_no=1, text="tag_1")
        other_relation_tag = DiaryTagFactory(sort_no=2, text="other_relation_tag")

        params = {
            "diary_tags": [
                {"id": str(existing_tag.id), "text": existing_tag.text, "sort_no": existing_tag.sort_no},
                {
                    "id": str(other_relation_tag.id),
                    "text": "originally other relation",
                    "sort_no": other_relation_tag.sort_no,
                },
            ],
            "user_relation_id": str(self.relation.id),
        }

        client = self._get_client(self.user)
        res = client.post(f"{self.base_path}bulk_update/", params, content_type="application/json")
        status_code, body = (res.status_code, res.json())

        self.assertEqual(status.HTTP_200_OK, status_code)

        # "originally other relation" tag is newly created.
        tags = body["diary_tags"]
        self.assertNotEqual(params["diary_tags"][1]["id"], tags[1]["id"])
        self.assertEqual("originally other relation", tags[1]["text"])

        # Other_relation_tag should not change at all.
        other_relation_tag.refresh_from_db()
        self.assertEqual(params["diary_tags"][1]["id"], str(other_relation_tag.id))
        self.assertEqual("other_relation_tag", other_relation_tag.text)

    def test_bulk_update__validation_error_on_duplicate_sort_nos(self):
        """
        Post /api/diary_tags/bulk_update/
        """
        params = {
            "diary_tags": [
                {"id": None, "text": "new_tag_1", "sort_no": 1},
                {"id": None, "text": "new_tag_2", "sort_no": 1},
            ],
            "user_relation_id": str(self.relation.id),
        }

        client = self._get_client(self.user)
        res = client.post(f"{self.base_path}bulk_update/", params, content_type="application/json")

        self.assertEqual(status.HTTP_400_BAD_REQUEST, res.status_code)

    def test_delete(self):
        """
        Delete /api/diary_tags/{tag_id}/
        """
        tag_to_delete = DiaryTagFactory(user_relation=self.relation, sort_no=1, text="tag_1")
        tag_to_remain = DiaryTagFactory(user_relation=self.relation, sort_no=2, text="tag_2")

        client = self._get_client(self.user)
        res = client.delete(f"{self.base_path}{str(tag_to_delete.id)}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, res.status_code)

        diary_tags = list(DiaryTag.objects.all())
        self.assertEqual(1, len(diary_tags))
        self.assertEqual(tag_to_remain.id, diary_tags[0].id)

    def test_delete_204_on_different_user(self):
        """
        Delete /api/diary_tags/{tag_id}/
        """
        tag_to_delete_different_user = DiaryTagFactory(sort_no=1, text="tag_1")
        tag_to_remain = DiaryTagFactory(user_relation=self.relation, sort_no=1, text="tag_1_mine")

        client = self._get_client(self.user)
        res = client.delete(f"{self.base_path}{str(tag_to_delete_different_user.id)}/")

        self.assertEqual(status.HTTP_204_NO_CONTENT, res.status_code)

        diary_tags = list(DiaryTag.objects.all())
        self.assertEqual(2, len(diary_tags))
        self.assertEqual(tag_to_delete_different_user.id, diary_tags[0].id)
        self.assertEqual(tag_to_remain.id, diary_tags[1].id)

    """
    Utility Functions
    """

    def _get_client(self, user) -> Client:
        client = Client()
        client.force_login(user)
        return client
