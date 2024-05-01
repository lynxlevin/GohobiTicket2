import logging
from typing import TYPE_CHECKING, TypedDict

from rest_framework import exceptions
from user_relations.models import UserRelation

from ..enums import DiaryStatus
from ..models import Diary, DiaryTag

if TYPE_CHECKING:
    from datetime import datetime
    from uuid import UUID

    from users.models import User

    class CreateDiaryData(TypedDict):
        entry: str
        date: "datetime"
        user_relation_id: int
        tag_ids: list["UUID"]


logger = logging.getLogger(__name__)


class CreateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", data: "CreateDiaryData") -> Diary:
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        entry = data["entry"]
        date = data["date"]
        user_relation_id = data["user_relation_id"]
        tag_ids = data["tag_ids"]

        user_relation = UserRelation.objects.filter_eq_user_id(user.id).get_by_id(user_relation_id)
        if user_relation is None:
            raise exceptions.NotFound()

        diary = Diary(
            entry=entry,
            date=date,
            user_relation_id=user_relation_id,
        )

        this_user = "user_1" if user == user_relation.user_1 else "user_2"
        setattr(diary, f"{this_user}_status", DiaryStatus.STATUS_READ.value)

        diary.save()

        tags = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id).filter_in_tag_ids(tag_ids)
        diary.tags.set(tags)

        return diary
