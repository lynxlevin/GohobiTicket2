import logging

from rest_framework import exceptions
from tickets.models import Ticket
from tickets.utils import (
    _is_none,
    _is_not_receiving_user,
)
from users.models import User

logger = logging.getLogger(__name__)


class ReadTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, ticket_id: str):
        logger.info("ReadTicket", extra={"user_id": user.id, "ticket_id": ticket_id})

        ticket = Ticket.objects.get_by_id(ticket_id)

        if _is_none(ticket):
            raise exceptions.NotFound(
                detail=f"{self.exception_log_title}: Ticket not found."
            )

        user_relation = ticket.user_relation
        if _is_not_receiving_user(user, user_relation):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only receiving user can perform this action."
            )

        if ticket.status == Ticket.STATUS_DRAFT:
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Draft tickets cannot be read."
            )

        ticket.status = Ticket.STATUS_READ
        ticket.save(update_fields=["status", "updated_at"])

        return ticket
