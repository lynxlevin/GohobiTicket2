import logging

from rest_framework import exceptions
from user_relations.models import UserRelation
from users.models import User

from tickets.enums import TicketStatus
from tickets.models import Ticket

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

        user_relation_id = queries["user_relation_id"]
        is_giving = queries["is_giving"]
        is_receiving = queries["is_receiving"]
        if not any([is_giving, is_receiving]):
            is_giving = True

        if UserRelation.objects.filter_eq_user_id(user.id).get_by_id(user_relation_id) is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: UserRelation not found.")

        tickets = self._get_tickets(user_relation_id, user.id, is_giving, is_receiving)

        return tickets

    def _get_tickets(self, user_relation_id: str, user_id: str, is_giving: bool, is_receiving: bool) -> list[Ticket]:
        qs = Ticket.objects.filter_eq_user_relation_id(user_relation_id)

        if is_giving:
            qs = qs.filter_eq_giving_user_id(user_id)

        if is_receiving:
            # MYMEMO: givingもreceivingもTrueの時、なにも帰らないので変な感じ
            qs = qs.exclude_eq_giving_user_id(user_id).exclude_eq_status(TicketStatus.STATUS_DRAFT.value)

        all_tickets = list(qs.order_by("-gift_date", "-id").all())
        return all_tickets
