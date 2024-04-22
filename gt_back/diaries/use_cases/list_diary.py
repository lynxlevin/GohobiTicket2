import logging
from typing import TYPE_CHECKING, TypedDict

from rest_framework import exceptions
from user_relations.models import UserRelation

from ..models import Diary

if TYPE_CHECKING:
    from users.models import User

    from ..models.diary import DiaryQuerySet

    class ListDiaryQuery(TypedDict):
        user_relation_id: int


logger = logging.getLogger(__name__)


class ListDiary:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", queries: "ListDiaryQuery") -> "DiaryQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        user_relation_id = queries["user_relation_id"]

        user_relation = UserRelation.objects.filter_eq_user_id(user.id).get_by_id(user_relation_id)
        if user_relation is None:
            raise exceptions.NotFound()

        qs = Diary.objects.prefetch_tags().filter_eq_user_relation_id(user_relation_id)

        diaries = qs.order_by_created_at(desc=True).order_by_date(desc=True).all()

        return diaries
