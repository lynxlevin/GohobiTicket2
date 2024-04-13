import logging
from typing import TYPE_CHECKING

from ..models import Diary

if TYPE_CHECKING:
    from users.models import User

    from ..models.diary import DiaryQuerySet

logger = logging.getLogger(__name__)


class ListDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", queries: dict) -> "DiaryQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        (user_relation_id,) = queries.values()

        qs = Diary.objects.prefetch_tags().filter_eq_user_relation_id(user_relation_id)

        # MYMEMO: add prefetch_tags
        diaries = qs.order_by_created_at(desc=True).order_by_date(desc=True).all()

        return diaries
