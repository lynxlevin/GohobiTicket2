import logging

from users.models import User

from tickets import permissions_util
from tickets.enums import TicketStatus
from tickets.models import Ticket

logger = logging.getLogger(__name__)


class ReadTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, ticket_id: str):
        logger.info("ReadTicket", extra={"user_id": user.id, "ticket_id": ticket_id})

        ticket = Ticket.objects.filter_eq_user_id(user.id).get_by_id(ticket_id)
        permissions_util.raise_ticket_not_found_exc(ticket)
        permissions_util.raise_not_receiving_user_exc(ticket, user.id)
        permissions_util.raise_cannot_read_draft_ticket_exc(ticket)

        ticket.status = TicketStatus.STATUS_READ.value
        ticket.save(update_fields=["status", "updated_at"])

        return ticket
