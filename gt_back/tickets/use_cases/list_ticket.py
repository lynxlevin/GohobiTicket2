import logging

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

        qs = Ticket.objects.filter_by_permitted_user_id(user.id).filter_eq_user_relation_id(user_relation_id)

        if is_giving:
            qs = qs.filter_eq_giving_user_id(user.id)

        if is_receiving:
            # MYMEMO: givingもreceivingもTrueの時、なにも帰らないので変な感じ
            qs = qs.exclude_eq_giving_user_id(user.id).exclude_eq_status(TicketStatus.STATUS_DRAFT.value)

        tickets = list(qs.order_by("-gift_date", "-id").all())
        return tickets
