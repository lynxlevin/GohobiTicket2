from django.test import TestCase
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..models import Diary
from .diary_factory import DiaryFactory


class TestUserRelationModel(TestCase):
    def test_get_by_id(self):
        expected = DiaryFactory()

        result = Diary.objects.get_by_id(expected.id)

        self.assertEqual(expected, result)

    def test_filter_eq_user_relation_id(self):
        relation = UserRelationFactory()
        expected = [
            DiaryFactory(user_relation=relation),
            DiaryFactory(user_relation=relation),
        ]
        non_expected = DiaryFactory()

        result = Diary.objects.filter_eq_user_relation_id(relation.id).all()

        self.assertTrue(expected[0] in result)
        self.assertTrue(expected[1] in result)
        self.assertFalse(non_expected in result)

    def test_filter_eq_user_id(self):
        relation = UserRelationFactory()
        expected = [
            DiaryFactory(user_relation=relation),
            DiaryFactory(user_relation=relation),
        ]
        non_related_user = UserFactory()

        result_1 = Diary.objects.filter_eq_user_id(relation.user_1_id).all()
        self.assertTrue(expected[0] in result_1)
        self.assertTrue(expected[1] in result_1)

        result_2 = Diary.objects.filter_eq_user_id(relation.user_2_id).all()
        self.assertTrue(expected[0] in result_2)
        self.assertTrue(expected[1] in result_2)

        result_none = Diary.objects.filter_eq_user_id(non_related_user.id).all()
        self.assertEqual(0, len(result_none))
