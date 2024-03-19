from typing import Optional

from django.db import models
from django.db.models import Q
from users.models import User


class UserRelationOldQuerySet(models.QuerySet):
    def get_by_id(self, user_relation_id) -> Optional["UserRelationOld"]:
        try:
            return self.get(id=user_relation_id)
        except UserRelationOld.DoesNotExist:
            return None

    def filter_by_receiving_user_id(self, user_id) -> "UserRelationOldQuerySet":
        return self.filter(receiving_user__id=user_id)

    def filter_by_giving_user_id(self, user_id) -> "UserRelationOldQuerySet":
        return self.filter(giving_user__id=user_id)

    def filter_eq_user_id(self, user_id) -> "UserRelationOldQuerySet":
        return self.filter(Q(giving_user_id=user_id) | Q(receiving_user_id=user_id))

    def select_giving_user(self) -> "UserRelationOldQuerySet":
        return self.select_related("giving_user")

    def select_receiving_user(self) -> "UserRelationOldQuerySet":
        return self.select_related("receiving_user")

    def order_by_created_at(self, desc=False) -> "UserRelationOldQuerySet":
        key = "-created_at" if desc else "created_at"
        return self.order_by(key)


class UserRelationOld(models.Model):
    # MYMEMO: constantsに移したい
    DEFAULT_BACKGROUND = "rgb(250, 255, 255)"

    giving_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="giving_relations")
    receiving_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiving_relations")
    ticket_img = models.CharField(max_length=13)
    background_color = models.CharField(max_length=18, default=DEFAULT_BACKGROUND)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: UserRelationOldQuerySet = UserRelationOldQuerySet.as_manager()

    class Meta:
        db_table = "user_relations_userrelation_old"

    @property
    def corresponding_relation(self):
        return (
            UserRelationOld.objects.filter_by_receiving_user_id(self.giving_user.id)
            .filter_by_giving_user_id(self.receiving_user.id)
            .first()
        )
