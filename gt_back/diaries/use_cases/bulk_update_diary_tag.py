import logging
from typing import TYPE_CHECKING, Optional, TypedDict

from rest_framework import exceptions
from user_relations.models import UserRelation

from ..models import DiaryTag

if TYPE_CHECKING:
    from users.models import User

    class BulkUpdateDiaryTagItem(TypedDict):
        id: Optional[int]
        text: str
        sort_no: int

    class BulkUpdateDiaryTagData(TypedDict):
        user_relation_id: int
        diary_tags: list["BulkUpdateDiaryTagItem"]


logger = logging.getLogger(__name__)


class BulkUpdateDiaryTag:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: "User", data: "BulkUpdateDiaryTagData") -> DiaryTag:
        logger.info(self.__class__.__name__, extra={"user": user, "data": data})

        user_relation_id = data["user_relation_id"]
        req_tags = data["diary_tags"]

        if UserRelation.objects.filter_eq_user_id(user.id).get_by_id(user_relation_id) is None:
            raise exceptions.NotFound()

        existing_tags = list(DiaryTag.objects.filter_eq_user_relation_id(user_relation_id).order_by_sort_no())

        new_tags = []
        updated_tags = []
        for req_tag in req_tags:
            tag = next((t for t in existing_tags if t.id == req_tag.get("id")), None)
            if tag:
                tag.text = req_tag["text"]
                tag.sort_no = req_tag["sort_no"]
                updated_tags.append(tag)
            else:
                req_tag.pop("id")  # Remove id in case this tag belongs to other relations.
                new_tags.append(DiaryTag(**req_tag, user_relation_id=user_relation_id))

        untouched_tags = [t for t in existing_tags if t.id not in (t.id for t in updated_tags)]
        max_sort_no = len(new_tags) + len(updated_tags)
        for untouched_tag in untouched_tags:
            max_sort_no += 1
            untouched_tag.sort_no = max_sort_no

        DiaryTag.objects.bulk_update(updated_tags + untouched_tags, fields=["text", "sort_no", "updated_at"])
        DiaryTag.objects.bulk_create(new_tags)

        return sorted(new_tags + updated_tags + untouched_tags, key=lambda t: t.sort_no)
