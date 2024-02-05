import uuid

from django.db import models

from .diary import Diary
from .diary_tag import DiaryTag


class DiaryTagRelationQuerySet(models.QuerySet["DiaryTagRelation"]):
    pass


class DiaryTagRelation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tag_master = models.ForeignKey(DiaryTag, on_delete=models.PROTECT)
    diary = models.ForeignKey(Diary, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: DiaryTagRelationQuerySet = DiaryTagRelationQuerySet.as_manager()
