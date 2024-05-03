import logging

from rest_framework import exceptions
from users.models import User

from tickets.models import Ticket

logger = logging.getLogger(__name__)


class DestroyTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, ticket_id: str, user: User):
        logger.info(__class__.__name__, extra={"ticket_id": ticket_id, "user": user})

        ticket = Ticket.objects.filter_eq_user_id(user.id).get_by_id(ticket_id)
        if ticket is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        if ticket.giving_user_id != user.id:
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the giving user may delete ticket."
            )

        if ticket.use_date is not None:
            raise exceptions.PermissionDenied(detail=f"{self.exception_log_title}: Used ticket cannot be deleted.")

        ticket.delete()
