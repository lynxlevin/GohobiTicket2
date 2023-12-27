import logging

from rest_framework import exceptions
from tickets.models import Ticket
from user_relations.models import UserRelation
from users.models import User

logger = logging.getLogger(__name__)


class ListTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(
        self,
        user: User,
        queries: dict,
    ):
        logger.info(self.__class__.__name__, extra={"queries": queries, "user": user})

        user_relation = UserRelation.objects.get_by_id(queries["user_relation_id"])

        if user_relation is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: UserRelation not found.")

        if user not in [user_relation.giving_user, user_relation.receiving_user]:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: UserRelation not found.")

        is_giving_relation = user_relation.giving_user == user

        available_tickets = self._get_available_tickets(user_relation.id, is_giving_relation)
        used_tickets = self._get_used_tickets(user_relation.id)

        return {"available_tickets": available_tickets, "used_tickets": used_tickets}

    def _get_available_tickets(self, user_relation_id: str, is_giving_relation: bool) -> list[Ticket]:
        qs = Ticket.objects.filter_eq_user_relation_id(user_relation_id).filter_unused_tickets()

        if not is_giving_relation:
            qs = qs.exclude_eq_status(Ticket.STATUS_DRAFT)

        available_tickets = list(qs.order_by("-gift_date", "-id").all())
        return available_tickets

    def _get_used_tickets(self, user_reltaion_id: str) -> list[Ticket]:
        used_tickets = list(
            Ticket.objects.filter_eq_user_relation_id(user_reltaion_id)
            .filter_used_tickets()
            .order_by("-gift_date", "-id")
            .all()
        )
        return used_tickets
