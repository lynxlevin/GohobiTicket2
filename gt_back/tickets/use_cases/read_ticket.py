import logging

from rest_framework import exceptions
from users.models import User

from tickets.enums import TicketStatus
from tickets.models import Ticket

logger = logging.getLogger(__name__)


class ReadTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, ticket_id: str):
        logger.info("ReadTicket", extra={"user_id": user.id, "ticket_id": ticket_id})

        ticket = Ticket.objects.get_by_id(ticket_id)

        if ticket is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        user_relation = ticket.user_relation

        if user.id not in (user_relation.user_1_id, user_relation.user_2_id):
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        if ticket.giving_user_id == user.id:
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only receiving user can perform this action."
            )

        if ticket.status == TicketStatus.STATUS_DRAFT.value:
            raise exceptions.PermissionDenied(detail=f"{self.exception_log_title}: Draft tickets cannot be read.")

        ticket.status = TicketStatus.STATUS_READ.value
        ticket.save(update_fields=["status", "updated_at"])

        return ticket
