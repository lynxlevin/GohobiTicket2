import logging

from rest_framework import exceptions
from tickets.models import Ticket
from users.models import User

logger = logging.getLogger(__name__)


class DestroyTicket:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, ticket_id: str, user: User):
        logger.info(__class__.__name__, extra={"ticket_id": ticket_id, "user": user})

        ticket = Ticket.objects.get_by_id(ticket_id)

        if ticket is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        if ticket.use_date is not None:
            raise exceptions.PermissionDenied(detail=f"{self.exception_log_title}: Used ticket cannot be deleted.")

        user_relation = ticket.user_relation

        if user.id not in (user_relation.user_1_id, user_relation.user_2_id):
            logger.info(f"{__class__.__name__}:delete_request_on_unrelated_ticket.")
            return

        if ticket.giving_user_id != user.id:
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the giving user may delete ticket."
            )

        ticket.delete()
