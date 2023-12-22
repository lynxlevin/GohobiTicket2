import logging
from typing import TYPE_CHECKING

from users.models import User

from ..models import Diary, DiaryTag

if TYPE_CHECKING:
    from uuid import UUID

logger = logging.getLogger(__name__)


class UpdateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, id: "UUID", data: dict) -> Diary:
        logger.info(self.__class__.__name__, extra={"user": user, "id": id, "data": data})

        entry, date, tag_ids = data.values()

        diary = Diary.objects.get_by_id(id)

        diary.entry = entry
        diary.date = date
        diary.save()

        if len(tag_ids) > 0:
            tags = DiaryTag.objects.filter_eq_user_relation_id(diary.user_relation_id).filter_in_tag_ids(tag_ids)
            diary.tags.set(tags)
        else:
            diary.tags.clear()

        return diary
