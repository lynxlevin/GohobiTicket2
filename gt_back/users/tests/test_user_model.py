from django.test import TestCase
from tickets.test_utils.test_seeds import TestSeed

from users.models import User


class TestUserModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        user = self.seeds.users[0]

        result = User.objects.get_by_id(user.id)

        self.assertEqual(result, user)

    # sample for record fetching
    def test_user_setting(self):
        user = self.seeds.users[0]
        expected = self.seeds.user_settings[0]

        result = user.usersetting_set.first()

        self.assertEqual(result, expected)

    # sample for record fetching
    def test_giving_relation(self):
        user = self.seeds.users[0]
        expected = self.seeds.user_relations[0]

        result = user.giving_relations.first()

        self.assertEqual(result, expected)

    # sample for record fetching
    def test_receiving_relation(self):
        user = self.seeds.users[0]
        expected = self.seeds.user_relations[1]

        result = user.receiving_relations.first()

        self.assertEqual(result, expected)
