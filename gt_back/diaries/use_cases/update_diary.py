import logging
from typing import TYPE_CHECKING, TypedDict

from rest_framework import exceptions

from ..enums import DiaryStatus
from ..models import Diary, DiaryTag

if TYPE_CHECKING:
    from datetime import datetime
    from uuid import UUID

    from users.models import User

    class UpdateDiaryData(TypedDict):
        entry: str
        date: "datetime"
        tag_ids: list["UUID"]


logger = logging.getLogger(__name__)


class UpdateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", id: "UUID", data: "UpdateDiaryData") -> Diary:
        logger.info(self.__class__.__name__, extra={"user": user, "id": id, "data": data})

        entry = data["entry"]
        date = data["date"]
        tag_ids = data["tag_ids"]

        diary = Diary.objects.filter_eq_user_id(user.id).select_user_relation().get_by_id(id)
        if diary is None:
            raise exceptions.NotFound()

        if diary.entry != entry:
            other_user = "user_2" if user == diary.user_relation.user_1 else "user_1"
            if getattr(diary, f"{other_user}_status") == DiaryStatus.STATUS_READ.value:
                setattr(diary, f"{other_user}_status", DiaryStatus.STATUS_EDITED.value)

        diary.entry = entry
        diary.date = date
        diary.save()

        tags = DiaryTag.objects.filter_eq_user_relation_id(diary.user_relation_id).filter_in_tag_ids(tag_ids)
        diary.tags.set(tags)

        this_user = "user_1" if user == diary.user_relation.user_1 else "user_2"
        diary.status = getattr(diary, f"{this_user}_status")

        return diary
