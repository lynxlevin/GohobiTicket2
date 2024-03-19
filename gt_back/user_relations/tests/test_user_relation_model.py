from django.test import TestCase
from user_relations.models import UserRelation

from .user_relation_factory import UserRelationFactory


class TestUserRelationModel(TestCase):
    def test_get_by_id(self):
        expected = UserRelationFactory()

        result = UserRelation.objects.get_by_id(expected.id)
        self.assertEqual(expected, result)

    def test_filter_eq_user_id(self):
        expected = UserRelationFactory()

        result_1 = UserRelation.objects.filter_eq_user_id(expected.user_1.id)
        self.assertEqual(1, result_1.count())
        self.assertEqual(expected, result_1.first())

        result_2 = UserRelation.objects.filter_eq_user_id(expected.user_2.id)
        self.assertEqual(1, result_2.count())
        self.assertEqual(expected, result_2.first())

    def test_get_related_user(self):
        relation = UserRelationFactory()

        result_1 = relation.get_related_user(relation.user_1.id)
        self.assertEqual(relation.user_2.id, result_1.id)

        result_2 = relation.get_related_user(relation.user_2.id)
        self.assertEqual(relation.user_1.id, result_2.id)
