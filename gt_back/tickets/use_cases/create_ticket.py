import logging

from rest_framework import exceptions
from tickets.models import Ticket
from tickets.utils import _is_none, _is_not_giving_user
from user_relations.models import UserRelation
from users.models import User

logger = logging.getLogger(__name__)


class CreateTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(
        self,
        user: User,
        data: dict,
    ):
        logger.info(self.__class__.__name__, extra={"data": data, "user": user})

        user_relation = UserRelation.objects.get_by_id(data["user_relation_id"])

        if _is_none(user_relation):
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: UserRelation not found.")

        if _is_not_giving_user(user, user_relation):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the giving user may create ticket."
            )

        if is_special := data.get("is_special", False):
            has_other_special_tickets_in_month = (
                Ticket.objects.filter_eq_user_relation_id(user_relation.id)
                .filter_special_tickets(data["gift_date"])
                .count()
                != 0
            )
            if has_other_special_tickets_in_month:
                is_special = False

        ticket = Ticket(
            gift_date=data["gift_date"],
            description=data["description"],
            user_relation_id=data["user_relation_id"],
            status=data.get("status", Ticket.STATUS_UNREAD),
            is_special=is_special,
        )
        ticket.save()

        return ticket
