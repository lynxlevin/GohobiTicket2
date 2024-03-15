from typing import Optional

from django.db import models
from django.db.models import Q
from users.models import User


class UserRelation2QuerySet(models.QuerySet):
    def get_by_id(self, user_relation_id) -> Optional["UserRelation2"]:
        try:
            return self.get(id=user_relation_id)
        except UserRelation2.DoesNotExist:
            return None

    def filter_eq_user_id(self, user_id) -> "UserRelation2QuerySet":
        return self.filter(Q(user_1_id=user_id) | Q(user_2_id=user_id))

    def select_users(self) -> "UserRelation2QuerySet":
        return self.select_related("user_1").select_related("user_2")

    def order_by_created_at(self, desc=False) -> "UserRelation2QuerySet":
        key = "-created_at" if desc else "created_at"
        return self.order_by(key)


class UserRelation2(models.Model):
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="relations_1")
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="relations_2")
    user_1_giving_ticket_img = models.CharField(max_length=13)
    user_2_giving_ticket_img = models.CharField(max_length=13)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: UserRelation2QuerySet = UserRelation2QuerySet.as_manager()
