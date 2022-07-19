from typing import Optional
from django.db import models
from users.models import User


class UserSettingQuerySet(models.QuerySet):
    def get_by_user_id(self, user_id) -> Optional["UserSetting"]:
        try:
            return self.get(user__id=user_id)
        except UserSetting.DoesNotExist:
            return None


class UserSetting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # MYMEMO: default_pageにはバリデーションとか、自分のリレーションかどうかの確認とかできるか？
    default_page = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: UserSettingQuerySet = UserSettingQuerySet.as_manager()
