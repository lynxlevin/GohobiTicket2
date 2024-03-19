import logging

from rest_framework import exceptions
from tickets.models import Ticket
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

        user_relation = UserRelation.objects.filter_eq_user_id(user.id).get_by_id(data["user_relation_id"])

        if user_relation is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: UserRelation not found.")

        if is_special := data.get("is_special", False):
            has_other_special_tickets_in_month = (
                Ticket.objects.filter_eq_user_relation_id(user_relation.id)
                .filter_eq_giving_user_id(user.id)
                .filter_special_tickets(data["gift_date"])
                .count()
                != 0
            )
            if has_other_special_tickets_in_month:
                is_special = False

        ticket = Ticket(
            giving_user=user,
            gift_date=data["gift_date"],
            description=data["description"],
            user_relation_id=data["user_relation_id"],
            status=data.get("status", Ticket.STATUS_UNREAD),
            is_special=is_special,
        )
        ticket.save()

        return ticket
