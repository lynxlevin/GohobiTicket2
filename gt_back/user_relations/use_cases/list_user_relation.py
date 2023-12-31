import logging

from rest_framework import exceptions
from user_relations.models import UserRelation

logger = logging.getLogger(__name__)


class ListUserRelation:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user_id: str):
        logger.info(
            self.__class__.__name__,
            extra={"user_id": user_id},
        )

        user_relations = (
            UserRelation.objects.select_giving_user()
            .select_receiving_user()
            .filter_eq_user_id(user_id)
            .order_by_created_at()
        )

        if not user_relations.exists():
            raise exceptions.NotFound()

        return [
            {
                "id": str(relation.id),
                "related_username": relation.receiving_user.username
                if relation.giving_user_id == user_id
                else relation.giving_user.username,
                "is_giving_relation": relation.giving_user_id == user_id,
                "ticket_image": relation.ticket_img,
                "corresponding_relation_id": str(relation.corresponding_relation.id),
            }
            for relation in user_relations
        ]
