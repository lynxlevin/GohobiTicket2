from django.test import TestCase
from user_relations.tests.user_relation_factory import UserRelationFactory
from user_settings.tests.user_setting_factory import UserSettingFactory

from ..tests.user_factory import UserFactory


class TestUserModel(TestCase):
    # sample for record fetching
    def test_user_setting(self):
        expected = UserSettingFactory()
        user = expected.user

        result = user.usersetting

        self.assertEqual(expected, result)

    # sample for record fetching
    def test_giving_relation(self):
        user = UserFactory()
        expected = UserRelationFactory(giving_user=user)

        result = user.giving_relations.first()

        self.assertEqual(expected, result)

    # sample for record fetching
    def test_receiving_relation(self):
        user = UserFactory()
        expected = UserRelationFactory(receiving_user=user)

        result = user.receiving_relations.first()

        self.assertEqual(expected, result)
