import logging
from typing import Set

from rest_framework import exceptions
from tickets.enums import TicketStatus
from tickets.models import Ticket
from users.models import User

logger = logging.getLogger(__name__)


class PartialUpdateTicket:
    ticket: Ticket
    update_fields: Set

    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"
        self.update_fields = set(["updated_at"])

    def execute(self, user: User, data: dict, ticket_id: str):
        logger.info(
            self.__class__.__name__,
            extra={"data": data, "user": user, "ticket_id": ticket_id},
        )

        self.ticket = Ticket.objects.get_by_id(ticket_id)

        if self.ticket is None:
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        user_relation = self.ticket.user_relation

        if user.id not in (user_relation.user_1_id, user_relation.user_2_id):
            raise exceptions.NotFound(detail=f"{self.exception_log_title}: Ticket not found.")

        if self.ticket.giving_user_id != user.id:
            raise exceptions.PermissionDenied(
                detail=f"{self.exception_log_title}: Only the giving user may update ticket."
            )

        status_to_be = data.get("status")
        if status_to_be:
            self._check_legitimacy_of_status(status_to_be)
            self._update_status(status_to_be)

        description_to_be = data.get("description")
        if description_to_be:
            self._update_description(description_to_be)
            self._change_to_edited_if_read()

        self.ticket.save(update_fields=self.update_fields)

        return self.ticket

    """
    Util Functions
    """

    def _check_legitimacy_of_status(self, status_to_be: str):
        if status_to_be == TicketStatus.STATUS_DRAFT.value:
            raise exceptions.PermissionDenied(detail=f"{self.exception_log_title}: Tickets cannot be updated to draft.")

    def _update_status(self, status_to_be: str):
        self.ticket.status = status_to_be
        self.update_fields.add("status")

    def _update_description(self, description_to_be: str):
        self.ticket.description = description_to_be
        self.update_fields.add("description")

    def _change_to_edited_if_read(self):
        if self.ticket.status == TicketStatus.STATUS_READ.value:
            self.ticket.status = TicketStatus.STATUS_EDITED.value
            self.update_fields.add("status")
