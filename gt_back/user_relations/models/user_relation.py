from typing import Optional

from django.db import models
from django.db.models import Q
from users.models import User


class UserRelationQuerySet(models.QuerySet):
    def get_by_id(self, user_relation_id) -> Optional["UserRelation"]:
        try:
            return self.get(id=user_relation_id)
        except UserRelation.DoesNotExist:
            return None

    def filter_eq_user_id(self, user_id) -> "UserRelationQuerySet":
        return self.filter(Q(user_1_id=user_id) | Q(user_2_id=user_id))

    def select_users(self) -> "UserRelationQuerySet":
        return self.select_related("user_1").select_related("user_2")

    def order_by_created_at(self, desc=False) -> "UserRelationQuerySet":
        key = "-created_at" if desc else "created_at"
        return self.order_by(key)


class UserRelation(models.Model):
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="relations_1")
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="relations_2")
    user_1_giving_ticket_img = models.CharField(max_length=13, null=True)
    user_2_giving_ticket_img = models.CharField(max_length=13, null=True)
    use_slack = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: UserRelationQuerySet = UserRelationQuerySet.as_manager()

    class Meta:
        db_table = "user_relations_userrelation"

    def get_related_user(self, user_id: str) -> Optional[User]:
        if user_id == self.user_1_id:
            return self.user_2
        if user_id == self.user_2_id:
            return self.user_1
        return None
