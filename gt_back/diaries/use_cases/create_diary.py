import logging
from typing import TYPE_CHECKING

from rest_framework import exceptions
from user_relations.models import UserRelation

from ..models import Diary, DiaryTag

if TYPE_CHECKING:
    from users.models import User

logger = logging.getLogger(__name__)


class CreateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", data: dict) -> Diary:
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
        diary.save()

        tags = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id).filter_in_tag_ids(tag_ids)
        diary.tags.set(tags)

        return diary
