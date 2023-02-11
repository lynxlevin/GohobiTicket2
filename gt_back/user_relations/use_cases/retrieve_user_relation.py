import logging

from rest_framework import exceptions
from tickets.models import Ticket
from tickets.utils import _is_none, _is_not_giving_user
from user_relations.models import UserRelation
from users.models import User

logger = logging.getLogger(__name__)


class RetrieveUserRelation:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(
        self,
        user_relation_id: str,
        user_id: str,
    ):
        logger.info(
            self.__class__.__name__,
            extra={"user_relation_id": user_relation_id, "user_id": user_id},
        )

        # MYMEMO: resolve n + 1
        user_relation = UserRelation.objects.get_by_id(user_relation_id)

        if not user_relation:
            raise exceptions.NotFound()

        if not user_id in [
            user_relation.giving_user.id,
            user_relation.receiving_user.id,
        ]:
            raise exceptions.PermissionDenied()

        user_relation_info = self._get_user_relation_info(user_relation, user_id)
        other_receiving_relations = self._get_other_receiving_relations(
            user_relation, user_id
        )
        available_tickets = self._get_available_tickets(user_relation_id)
        used_tickets = self._get_used_tickets(user_relation_id)

        return {
            "user_relation_info": user_relation_info,
            "other_receiving_relations": other_receiving_relations,
            # MYMEMO: 以下はlist_tickets にした方がよさそう
            "all_ticket_count": len(available_tickets) + len(used_tickets),
            "available_ticket_count": len(available_tickets),
            "available_tickets": available_tickets,
            "used_tickets": used_tickets,
        }

    def _get_user_relation_info(
        self, user_relation: UserRelation, user_id: str
    ) -> dict:
        is_giving_relation = user_relation.giving_user.id == user_id
        related_user = (
            user_relation.receiving_user
            if is_giving_relation
            else user_relation.giving_user
        )
        user_relation_info = {
            "id": user_relation.id,
            "related_user_nickname": related_user.username,
            "is_giving_relation": is_giving_relation,
            "ticket_image": user_relation.ticket_img,
            "background_color": user_relation.background_color,
            "corresponding_relation_id": user_relation.corresponding_relation.id,
        }

        return user_relation_info

    def _get_other_receiving_relations(
        self, user_relation: UserRelation, user_id: str
    ) -> list[dict]:
        # MYMEMO: resolve n + 1
        other_receiving_relations = list(
            UserRelation.objects.filter_by_receiving_user_id(user_id)
            .exclude(id=user_relation.id)
            .all()
        )
        return [
            {"id": relation.id, "related_user_nickname": relation.giving_user.username}
            for relation in other_receiving_relations
        ]

    def _get_available_tickets(self, user_relation_id: str) -> list[Ticket]:
        available_tickets = list(
            Ticket.objects.filter_eq_user_relation_id(user_relation_id)
            .filter_unused_tickets()
            .order_by("-gift_date", "-id")
            .all()
        )
        return available_tickets

    def _get_used_tickets(self, user_reltaion_id: str) -> list[Ticket]:
        used_tickets = list(
            Ticket.objects.filter_eq_user_relation_id(user_reltaion_id)
            .filter_used_tickets()
            .order_by("-gift_date", "-id")
            .all()
        )
        return used_tickets
