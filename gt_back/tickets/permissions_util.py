from typing import TYPE_CHECKING

from rest_framework.exceptions import PermissionDenied

from tickets.enums import TicketStatus

if TYPE_CHECKING:
    from tickets.models import Ticket


def raise_cannot_change_back_to_draft_exc(ticket: "Ticket", status_to_be: str):
    if status_to_be == TicketStatus.STATUS_DRAFT.value and ticket.status != TicketStatus.STATUS_DRAFT.value:
        raise PermissionDenied(detail="Tickets cannot be changed back to draft.")


def raise_cannot_read_draft_ticket_exc(ticket: "Ticket"):
    if ticket.status == TicketStatus.STATUS_DRAFT.value:
        raise PermissionDenied(detail="Draft tickets cannot be read.")
