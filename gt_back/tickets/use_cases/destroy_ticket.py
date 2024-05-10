import logging
from typing import TYPE_CHECKING

from users.models import User

if TYPE_CHECKING:
    from tickets.models import Ticket

logger = logging.getLogger(__name__)


class DestroyTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, ticket: "Ticket", user: User):
        logger.info(__class__.__name__, extra={"ticket_id": ticket.id, "user": user})

        ticket.delete()
