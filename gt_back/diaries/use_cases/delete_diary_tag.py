import logging
from typing import TYPE_CHECKING

from ..models import DiaryTag

if TYPE_CHECKING:
    from users.models import User

logger = logging.getLogger(__name__)


class DeleteDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", tag_id: str):
        logger.info(self.__class__.__name__, extra={"user": user, "tag_id": tag_id})

        tag = DiaryTag.objects.filter_by_permitted_user_id(user.id).get_by_id(tag_id)

        if tag is not None:
            tag.delete()
