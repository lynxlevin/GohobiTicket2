import logging

from users.models import User

from ..models import DiaryTag

logger = logging.getLogger(__name__)


class CreateDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict) -> DiaryTag:
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        text = data["text"]
        user_relation_id = data["user_relation_id"]

        existing_tags_count = DiaryTag.objects.filter_eq_user_relation_id(user_relation_id).count()

        tag = DiaryTag(
            text=text,
            sort_no=existing_tags_count + 1,
            user_relation_id=user_relation_id,
        )
        tag.save()

        return tag
