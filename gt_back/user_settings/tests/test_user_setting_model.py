from django.test import TestCase
from user_settings.models import UserSetting
from user_settings.tests.user_setting_factory import UserSettingFactory


class TestUserSettingModel(TestCase):
    def test_get_by_user_id(self):
        user_setting = UserSettingFactory()

        result = UserSetting.objects.get_by_user_id(user_setting.user_id)

        self.assertEqual(user_setting, result)
