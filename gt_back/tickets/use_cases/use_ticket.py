import logging
from datetime import date

from rest_framework import exceptions
from users.models import User

from tickets.models import Ticket
from tickets.utils import SlackMessengerForUseTicket

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

        if ticket is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        user_relation = ticket.user_relation

        if user.id not in (user_relation.user_1_id, user_relation.user_2_id):
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        if ticket.giving_user_id == user.id:
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the receiving user may use ticket."
            )

        if ticket.use_date is not None:
            raise exceptions.PermissionDenied(detail=f"{self.exception_log_title}: This ticket is already used.")

        ticket.use_description = data["use_description"]
        ticket.use_date = date.today()
        ticket.save(update_fields=["use_date", "use_description", "updated_at"])

        slack_message = SlackMessengerForUseTicket()
        slack_message.generate_message(ticket)
        slack_message.send_message()

        return ticket
