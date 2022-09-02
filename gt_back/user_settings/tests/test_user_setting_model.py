from django.test import TestCase
from tickets.test_utils.test_seeds import TestSeed
from user_settings.models import UserSetting


class TestUserSettingModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_user_id(self):
        user = self.seeds.users[0]

        result = UserSetting.objects.get_by_user_id(user.id)

        self.assertEqual(result.user, user)
