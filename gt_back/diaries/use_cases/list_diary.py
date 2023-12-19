import logging
from typing import TYPE_CHECKING

from users.models import User

from ..models import Diary

if TYPE_CHECKING:
    from ..models.diary import DiaryQuerySet

logger = logging.getLogger(__name__)


class ListDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, queries: dict) -> "DiaryQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        # qs = Diary.objects.all()

        diaries = Diary.objects.order_by_date_desc().all()

        return diaries
