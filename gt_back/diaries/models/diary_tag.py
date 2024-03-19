import uuid
from typing import Optional

from django.db import models
from user_relations.models import UserRelation, UserRelationOld


class DiaryTagQuerySet(models.QuerySet["DiaryTag"]):
    def get_by_id(self, id: uuid.UUID) -> Optional["DiaryTag"]:
        try:
            return self.get(id=id)
        except DiaryTag.DoesNotExist:
            return None

    def filter_eq_user_relation_id(self, user_relation_id: str, use_old=False) -> "DiaryTagQuerySet":
        if use_old:
            return self.filter(user_relation_old__id=user_relation_id)
        return self.filter(user_relation__id=user_relation_id)

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
    user_relation_old = models.ForeignKey(UserRelationOld, on_delete=models.CASCADE, blank=True, null=True)
    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE, blank=True, null=True)
    sort_no = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: DiaryTagQuerySet = DiaryTagQuerySet.as_manager()
