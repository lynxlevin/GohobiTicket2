import logging
from typing import TYPE_CHECKING

from rest_framework import exceptions

from ..enums import DiaryStatus
from ..models import Diary

if TYPE_CHECKING:
    from uuid import UUID

    from users.models import User


logger = logging.getLogger(__name__)


class MarkDiaryRead:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", id: "UUID") -> None:
        logger.info(self.__class__.__name__, extra={"user": user, "id": id})

        diary = Diary.objects.filter_by_permitted_user_id(user.id).select_user_relation().get_by_id(id)
        if diary is None:
            raise exceptions.NotFound()

        this_user = "user_1" if user == diary.user_relation.user_1 else "user_2"
        setattr(diary, f"{this_user}_status", DiaryStatus.STATUS_READ.value)

        diary.save()

        return
