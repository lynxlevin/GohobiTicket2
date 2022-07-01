from django.db import models
from django.contrib.auth.models import User


class UserSetting(models.Model):
    # MYMEMO: 他のモデルでもon_deleteを設定、試してみる
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # MYMEMO: default_pageにはバリデーションとか、自分のリレーションかどうかの確認とかできるか？
    default_page = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
