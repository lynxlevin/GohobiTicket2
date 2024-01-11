from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..models import DiaryTag
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
            for tag in sorted(diary_tags, key=lambda tag: tag.sort_no)
        ]
        self.assertListEqual(expected, body["diary_tags"])

    # def test_list__404_on_wrong_user_relation_id(self):

    def test_create(self):
        """
        Post /api/diary_tags/
        """
        _diary_tags = [
            DiaryTagFactory(user_relation=self.relation, sort_no=3),
            DiaryTagFactory(user_relation=self.relation, sort_no=1),
            DiaryTagFactory(user_relation=self.relation, sort_no=2),
        ]

        params = {
            "user_relation_id": str(self.relation.id),
            "text": "Newly created tag",
        }

        status_code, body = self._make_post_request(self.user, self.base_path, params)

        self.assertEqual(status.HTTP_201_CREATED, status_code)

        created_tag = DiaryTag.objects.get_by_id(body["id"])
        self.assertEqual(params["user_relation_id"], str(created_tag.user_relation.id))
        self.assertEqual(params["text"], created_tag.text)
        self.assertEqual(4, created_tag.sort_no)

    # def test_create__400_on_wrong_user_relation_id(self):

    def test_bulk_update(self):
        """
        Post /api/diary_tags/bulk_update/
        全部送るタイプにする。追加も削除も。最初にバリデーションをかける。sort_no 1~len && 重複なし。DBと付き合わせて変更分だけ反映。全部返す。
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

        status_code, body = self._make_post_request(self.user, f"{self.base_path}bulk_update/", params)

        self.assertEqual(status.HTTP_200_OK, status_code)

        tags = body["diary_tags"]
        expected = [
            *params["diary_tags"],
            {"id": str(existing_tags[3].id), "text": existing_tags[3].text, "sort_no": 5},
        ]
        self.assertEqual(len(expected), len(tags))
        for param_tag, tag in zip(sorted(expected, key=lambda t: t["sort_no"]), tags):
            if param_tag["id"]:
                self.assertEqual(param_tag["id"], tag["id"])
            self.assertEqual(param_tag["text"], tag["text"])
            self.assertEqual(param_tag["sort_no"], tag["sort_no"])

    # def test_bulk_update__404_on_wrong_user_relations_diary(self):

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

        status_code, _ = self._make_post_request(self.user, f"{self.base_path}bulk_update/", params)

        self.assertEqual(status.HTTP_400_BAD_REQUEST, status_code)

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
