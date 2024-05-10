import logging
from typing import TYPE_CHECKING, Set

from users.models import User

from tickets import permissions_util
from tickets.enums import TicketStatus

if TYPE_CHECKING:
    from tickets.models import Ticket

logger = logging.getLogger(__name__)


class PartialUpdateTicket:
    ticket: "Ticket"
    update_fields: Set

    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"
        self.update_fields = set(["updated_at"])

    def execute(self, user: User, data: dict, ticket: "Ticket"):
        logger.info(
            self.__class__.__name__,
            extra={"data": data, "user": user, "ticket_id": ticket.id},
        )

        self.ticket = ticket

        status_to_be = data.get("status")
        if status_to_be:
            permissions_util.raise_cannot_change_back_to_draft_exc(self.ticket, status_to_be)
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
