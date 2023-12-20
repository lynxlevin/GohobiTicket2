import logging
from typing import TYPE_CHECKING

from users.models import User

from ..models import Diary

if TYPE_CHECKING:
    from uuid import UUID

logger = logging.getLogger(__name__)


class UpdateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, id: "UUID", data: dict) -> Diary:
        logger.info(self.__class__.__name__, extra={"user": user, "id": id, "data": data})

        diary = Diary.objects.get_by_id(id)

        diary.entry = data["entry"]
        diary.date = data["date"]
        diary.save()

        return diary
