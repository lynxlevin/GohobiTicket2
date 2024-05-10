import logging
from datetime import date
from typing import TYPE_CHECKING

from users.models import User

from tickets.utils import SlackMessengerForUseTicket

if TYPE_CHECKING:
    from tickets.models import Ticket
logger = logging.getLogger(__name__)


class UseTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict, ticket: "Ticket"):
        logger.info(
            self.__class__.__name__,
            extra={"data": data, "user": user, "ticket_id": ticket.id},
        )

        ticket.use_description = data["use_description"]
        ticket.use_date = date.today()
        ticket.save(update_fields=["use_date", "use_description", "updated_at"])

        slack_message = SlackMessengerForUseTicket()
        slack_message.generate_message(ticket)
        slack_message.send_message()

        return ticket
