import logging
from datetime import date

from users.models import User

from tickets import permissions_util
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

        ticket = Ticket.objects.filter_by_permitted_user_id(user.id).get_by_id(ticket_id)
        permissions_util.raise_ticket_not_found_exc(ticket)
        permissions_util.raise_not_receiving_user_exc(ticket, user.id)
        permissions_util.raise_not_unused_ticket_exc(ticket)

        ticket.use_description = data["use_description"]
        ticket.use_date = date.today()
        ticket.save(update_fields=["use_date", "use_description", "updated_at"])

        slack_message = SlackMessengerForUseTicket()
        slack_message.generate_message(ticket)
        slack_message.send_message()

        return ticket
