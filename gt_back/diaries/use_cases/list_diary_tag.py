import logging
from typing import TYPE_CHECKING

from ..models import DiaryTag

if TYPE_CHECKING:
    from users.models import User

    from ..models.diary import DiaryTagQuerySet

logger = logging.getLogger(__name__)


class ListDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", queries: dict) -> "DiaryTagQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        user_relation_id, include_diary_count = queries.values()

        qs = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id)

        if include_diary_count:
            logger.debug("include_diary_count", extra={"include_diary_count": include_diary_count})  # MYMEMO: debug
            qs = qs.annotate_diary_count()

        tags = qs.order_by_sort_no().all()

        return tags
