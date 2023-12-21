import uuid
from typing import Optional

from django.db import models
from user_relations.models import UserRelation


class DiaryTagQuerySet(models.QuerySet["DiaryTag"]):
    def get_by_id(self, id) -> Optional["DiaryTag"]:
        try:
            return self.get(id=id)
        except DiaryTag.DoesNotExist:
            return None


class DiaryTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=256)
    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    sort_no = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = (
            models.UniqueConstraint(
                fields=["text", "user_relation"],
                name="unique_text_user_relation",
            ),
            models.UniqueConstraint(
                fields=["sort_no", "user_relation"],
                name="unique_sort_no_user_relation",
            ),
        )

    objects: DiaryTagQuerySet = DiaryTagQuerySet.as_manager()
