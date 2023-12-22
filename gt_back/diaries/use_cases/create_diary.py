import logging
from typing import TYPE_CHECKING

from ..models import Diary, DiaryTag

if TYPE_CHECKING:
    from users.models import User

logger = logging.getLogger(__name__)


class CreateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", data: dict) -> Diary:
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        entry, date, user_relation_id, tag_ids = data.values()

        diary = Diary(
            entry=entry,
            date=date,
            user_relation_id=user_relation_id,
        )
        diary.save()

        tags = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id).filter_in_tag_ids(tag_ids)
        diary.tags.set(tags)

        return diary
