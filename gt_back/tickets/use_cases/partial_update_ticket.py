from tickets.models import Ticket
from users.models import User
from tickets.utils import _is_none, _is_not_giving_user
from rest_framework import exceptions
import logging

logger = logging.getLogger(__name__)


class PartialUpdateTicket():
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(self, user: User, data: dict, ticket_id: str):
        logger.info(__class__.__name__, extra={
                    "data": data, "user": user, "ticket_id": ticket_id})

        ticket = Ticket.objects.get_by_id(ticket_id)

        if _is_none(ticket):
            raise exceptions.NotFound(
                detail=f"{self.exception_log_title}: Ticket not found.")

        user_relation = ticket.user_relation

        if _is_not_giving_user(user, user_relation):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the giving user may update ticket.")

        ticket.description = data["description"]
        ticket.save(update_fields=["description", "updated_at"])

        return ticket
