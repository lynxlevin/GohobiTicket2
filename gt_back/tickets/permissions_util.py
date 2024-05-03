from typing import TYPE_CHECKING

from rest_framework.exceptions import NotFound, PermissionDenied

from tickets.enums import TicketStatus

if TYPE_CHECKING:
    from tickets.models import Ticket


def raise_ticket_not_found_exc(ticket: "Ticket"):
    if ticket is None:
        raise NotFound(detail="Ticket not found.")


def raise_not_giving_user_exc(ticket: "Ticket", user_id: int):
    if ticket.giving_user_id != user_id:
        raise PermissionDenied(detail="Not giving user.")


def raise_not_receiving_user_exc(ticket: "Ticket", user_id: int):
    if ticket.giving_user_id == user_id:
        raise PermissionDenied(detail="Not receiving user.")


def raise_not_unused_ticket_exc(ticket: "Ticket"):
    if ticket.use_date is not None:
        raise PermissionDenied(detail="Not unused ticket.")


def raise_cannot_change_back_to_draft_exc(ticket: "Ticket", status_to_be: str):
    if status_to_be == TicketStatus.STATUS_DRAFT.value and ticket.status != TicketStatus.STATUS_DRAFT.value:
        raise PermissionDenied(detail="Tickets cannot be changed back to draft.")


def raise_cannot_read_draft_ticket_exc(ticket: "Ticket"):
    if ticket.status == TicketStatus.STATUS_DRAFT.value:
        raise PermissionDenied(detail="Draft tickets cannot be read.")
