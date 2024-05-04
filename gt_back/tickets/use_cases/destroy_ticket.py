import logging

from users.models import User

from tickets import permissions_util
from tickets.models import Ticket

logger = logging.getLogger(__name__)


class DestroyTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, ticket_id: str, user: User):
        logger.info(__class__.__name__, extra={"ticket_id": ticket_id, "user": user})

        ticket = Ticket.objects.filter_by_permitted_user_id(user.id).get_by_id(ticket_id)

        permissions_util.raise_ticket_not_found_exc(ticket)
        permissions_util.raise_not_giving_user_exc(ticket, user.id)
        permissions_util.raise_not_unused_ticket_exc(ticket)

        ticket.delete()
