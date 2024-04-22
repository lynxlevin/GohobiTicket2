import uuid
from typing import Optional

from django.db import models
from django.db.models import Q
from user_relations.models import UserRelation


class DiaryTagQuerySet(models.QuerySet["DiaryTag"]):
    def get_by_id(self, id: uuid.UUID) -> Optional["DiaryTag"]:
        try:
            return self.get(id=id)
        except DiaryTag.DoesNotExist:
            return None

    def filter_eq_user_relation_id(self, user_relation_id: int) -> "DiaryTagQuerySet":
        return self.filter(user_relation__id=user_relation_id)

    def filter_eq_user_id(self, user_id: int) -> "DiaryTagQuerySet":
        return self.filter(Q(user_relation__user_1_id=user_id) | Q(user_relation__user_2_id=user_id))

    def filter_in_tag_ids(self, tag_ids: list[uuid.UUID]) -> "DiaryTagQuerySet":
        return self.filter(id__in=tag_ids)

    def order_by_sort_no(self, desc: bool = False) -> "DiaryTagQuerySet":
        key = "-sort_no" if desc else "sort_no"
        return self.order_by(key)

    def annotate_diary_count(self) -> "DiaryTagQuerySet":
        return self.annotate(diary_count=models.Count("diary"))


class DiaryTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=256)
    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    sort_no = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: DiaryTagQuerySet = DiaryTagQuerySet.as_manager()
