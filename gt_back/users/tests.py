from django.test import TestCase
from tickets.test_utils.test_seeds import TestSeed

from users.models import User


class UserModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        user = self.seeds.users[0]

        result = User.objects.get_by_id(user.id)

        self.assertEqual(result, user)
