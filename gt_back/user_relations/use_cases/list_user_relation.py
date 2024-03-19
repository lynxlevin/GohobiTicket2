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

        user_relations = UserRelation.objects.select_users().filter_eq_user_id(user_id).order_by_created_at()

        if not user_relations.exists():
            raise exceptions.NotFound()

        return [
            {
                "id": str(relation.id),
                "related_username": relation.get_related_user(user_id).username,
                "giving_ticket_img": relation.user_1_giving_ticket_img
                if relation.user_1_id == user_id
                else relation.user_2_giving_ticket_img,
                "receiving_ticket_img": relation.user_2_giving_ticket_img
                if relation.user_1_id == user_id
                else relation.user_1_giving_ticket_img,
            }
            for relation in user_relations
        ]
