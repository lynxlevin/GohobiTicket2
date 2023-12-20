import logging

from users.models import User

from ..models import Diary

logger = logging.getLogger(__name__)


class CreateDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict) -> Diary:
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        diary = Diary(
            entry=data["entry"],
            date=data["date"],
            user_relation_id=data["user_relation_id"],
        )
        diary.save()

        return diary
