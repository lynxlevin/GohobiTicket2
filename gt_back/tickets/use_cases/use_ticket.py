import logging
from datetime import date

from rest_framework import exceptions
from tickets.models import Ticket
from tickets.utils import (
    SlackMessengerForUseTicket,
    _is_none,
    _is_not_receiving_user,
    _is_used,
)
from users.models import User

logger = logging.getLogger(__name__)


class UseTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict, ticket_id: str):
        logger.info(
            self.__class__.__name__,
            extra={"data": data, "user": user, "ticket_id": ticket_id},
        )

        ticket = Ticket.objects.get_by_id(ticket_id)

        if _is_none(ticket):
            raise exceptions.NotFound(
                detail=f"{self.exception_log_title}: Ticket not found."
            )

        if _is_used(ticket):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: This ticket is already used."
            )

        user_relation = ticket.user_relation

        if _is_not_receiving_user(user, user_relation):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the receiving user may use ticket."
            )

        ticket.use_description = data["use_description"]
        ticket.use_date = date.today()
        ticket.save(update_fields=["use_date", "use_description", "updated_at"])

        slack_message = SlackMessengerForUseTicket()
        slack_message.generate_message(ticket)
        slack_message.send_message()

        return ticket
