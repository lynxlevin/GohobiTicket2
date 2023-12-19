from typing import Optional

from django.db import models
from user_relations.models import UserRelation


class DiaryQuerySet(models.QuerySet):
    def get_by_id(self, id) -> Optional["Diary"]:
        try:
            return self.get(id=id)
        except Diary.DoesNotExist:
            return None

    def filter_eq_user_relation_id(self, user_relation_id: str) -> "DiaryQuerySet":
        return Diary.objects.filter(user_relation__id=user_relation_id)


class Diary(models.Model):
    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    entry = models.TextField(default="", blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: DiaryQuerySet = DiaryQuerySet.as_manager()

    def __repr__(self):
        return f"<Diary({str(self.id)})>"
