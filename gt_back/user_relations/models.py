from django.db import models
from django.contrib.auth.models import User


class UserRelation(models.Model):
    # MYMEMO: constantsに移したい
    DEFAULT_BACKGROUND = "rgb(250, 255, 255)"

    giving_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="giving_user")
    receiving_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="receiving_user")
    ticket_img = models.CharField(max_length=13)
    background_color = models.CharField(
        max_length=18, default=DEFAULT_BACKGROUND)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # MYMEMO: correspondent_relationを取得するクエリを作る
