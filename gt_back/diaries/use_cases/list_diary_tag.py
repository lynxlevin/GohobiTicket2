import logging
from typing import TYPE_CHECKING, TypedDict

from rest_framework import exceptions
from user_relations.models import UserRelation

from ..models import DiaryTag

if TYPE_CHECKING:
    from users.models import User

    from ..models.diary import DiaryTagQuerySet

    class ListDiaryTagQuery(TypedDict):
        user_relation_id: int


logger = logging.getLogger(__name__)


class ListDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", queries: "ListDiaryTagQuery") -> "DiaryTagQuerySet":
        logger.info(self.__class__.__name__, extra={"user": user, "queries": queries})

        user_relation_id = queries["user_relation_id"]

        if UserRelation.objects.filter_eq_user_id(user.id).get_by_id(user_relation_id) is None:
            raise exceptions.NotFound()

        qs = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id)

        tags = qs.order_by_sort_no().all()

        return tags
