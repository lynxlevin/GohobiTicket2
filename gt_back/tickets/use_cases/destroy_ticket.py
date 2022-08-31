from tickets.models import Ticket
from users.models import User
from tickets.utils import _is_none, _is_used, _is_not_giving_user, _is_not_receiving_user
from rest_framework import exceptions
from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


class DestroyTicket():
    def __init__(self):
        self.exception_log_title = "DestroyTicket_exception"

    def execute(self, ticket_id: str, user: User):
        logger.info("DestroyTicket", extra={
                    "ticket_id": ticket_id, "user": user})

        ticket = Ticket.objects.get_by_id(ticket_id)

        if _is_none(ticket):
            raise exceptions.NotFound(
                detail=f"{self.exception_log_title}: Ticket not found.")

        if _is_used(ticket):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Used ticket cannot be deleted.")

        user_relation = ticket.user_relation

        if _is_not_giving_user(user, user_relation):
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the giving user may delete ticket.")

        ticket.delete()
