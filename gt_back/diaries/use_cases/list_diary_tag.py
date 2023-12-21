import logging
from typing import TYPE_CHECKING

from users.models import User

from ..models import DiaryTag

if TYPE_CHECKING:
    from ..models.diary import DiaryTagQuerySet

logger = logging.getLogger(__name__)


class ListDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, queries: dict) -> "DiaryTagQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        user_relation_id = queries["user_relation_id"]

        qs = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id)

        tags = qs.order_by_sort_no().all()

        return tags
