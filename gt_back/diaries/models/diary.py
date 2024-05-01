import uuid
from typing import Optional

from django.db import models
from django.db.models import F, Q
from user_relations.models import UserRelation

from ..enums import DiaryStatus


class DiaryQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["Diary"]:
        try:
            return self.get(id=id)
        except Diary.DoesNotExist:
            return None

    def filter_eq_user_relation_id(self, user_relation_id: int) -> "DiaryQuerySet":
        return self.filter(user_relation__id=user_relation_id)

    def filter_eq_user_id(self, user_id: int) -> "DiaryQuerySet":
        return self.filter(Q(user_relation__user_1_id=user_id) | Q(user_relation__user_2_id=user_id))

    def prefetch_tags(self) -> "DiaryQuerySet":
        return self.prefetch_related("tags")

    def select_user_relation(self) -> "DiaryQuerySet":
        return self.select_related("user_relation")

    def annotate_status(self, user_relation: UserRelation, user_id: int) -> "DiaryQuerySet":
        if user_relation.user_1_id == user_id:
            return self.annotate(status=F("user_1_status"))
        if user_relation.user_2_id == user_id:
            return self.annotate(status=F("user_2_status"))

    def order_by_date(self, desc: bool = False) -> "DiaryQuerySet":
        key = "-date" if desc else "date"
        return self.order_by(key)

    def order_by_created_at(self, desc: bool = False) -> "DiaryQuerySet":
        key = "-created_at" if desc else "created_at"
        return self.order_by(key)


class Diary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    entry = models.TextField(default="", blank=True)
    date = models.DateField()
    tags = models.ManyToManyField("DiaryTag", through="DiaryTagRelation")
    user_1_status = models.CharField(
        max_length=8, choices=DiaryStatus.choices_for_model(), default=DiaryStatus.STATUS_UNREAD.value
    )
    user_2_status = models.CharField(
        max_length=8, choices=DiaryStatus.choices_for_model(), default=DiaryStatus.STATUS_UNREAD.value
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: DiaryQuerySet = DiaryQuerySet.as_manager()

    def __repr__(self):
        return f"<Diary({str(self.id)})>"
