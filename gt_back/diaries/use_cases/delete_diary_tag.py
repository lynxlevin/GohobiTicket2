import logging
from typing import TYPE_CHECKING

from user_relations.models import UserRelation

from ..models import DiaryTag

if TYPE_CHECKING:
    from users.models import User

logger = logging.getLogger(__name__)


class DeleteDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", tag_id: str):
        logger.info(self.__class__.__name__, extra={"user": user, "tag_id": tag_id})

        tag = DiaryTag.objects.get_by_id(tag_id)

        if UserRelation.objects.filter_eq_user_id(user.id).get_by_id(tag.user_relation_id):
            tag.delete()
