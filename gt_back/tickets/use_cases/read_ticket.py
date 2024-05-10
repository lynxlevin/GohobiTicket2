import logging
from typing import TYPE_CHECKING

from rest_framework.exceptions import PermissionDenied
from users.models import User

from tickets.enums import TicketStatus

if TYPE_CHECKING:
    from tickets.models import Ticket

logger = logging.getLogger(__name__)


class ReadTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, ticket: "Ticket"):
        logger.info("ReadTicket", extra={"user_id": user.id, "ticket_id": ticket.id})

        if ticket.status == TicketStatus.STATUS_DRAFT.value:
            raise PermissionDenied(detail="Draft tickets cannot be read.")

        ticket.status = TicketStatus.STATUS_READ.value
        ticket.save(update_fields=["status", "updated_at"])

        return ticket
