import logging
from typing import TYPE_CHECKING

from rest_framework import exceptions

from ..models import DiaryTag

if TYPE_CHECKING:
    from uuid import UUID

    from users.models import User

logger = logging.getLogger(__name__)


class GetDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", tag_id: "UUID") -> DiaryTag:
        logger.info(self.__class__.__name__, extra={"user": user, "tag_id": tag_id})

        tag = DiaryTag.objects.filter_by_permitted_user_id(user.id).annotate_diary_count().get_by_id(tag_id)
        if tag is None:
            raise exceptions.NotFound

        return tag
