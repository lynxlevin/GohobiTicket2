import logging
from typing import TYPE_CHECKING

from users.models import User

from tickets.enums import TicketStatus

if TYPE_CHECKING:
    from tickets.models.ticket import TicketQuerySet

logger = logging.getLogger(__name__)


class ListTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(
        self,
        user: User,
        queries: dict,
        queryset: "TicketQuerySet",
    ):
        logger.info(self.__class__.__name__, extra={"queries": queries, "user": user})

        is_giving = queries["is_giving"]
        is_receiving = queries["is_receiving"]
        if not any([is_giving, is_receiving]):
            is_giving = True

        if is_giving:
            queryset = queryset.filter_eq_giving_user_id(user.id)

        if is_receiving:
            # MYMEMO: givingもreceivingもTrueの時、なにも帰らないので変な感じ
            queryset = queryset.exclude_eq_giving_user_id(user.id).exclude_eq_status(TicketStatus.STATUS_DRAFT.value)

        tickets = list(queryset.order_by("-gift_date", "-id").all())
        return tickets
