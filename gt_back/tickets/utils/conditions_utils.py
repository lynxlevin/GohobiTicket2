from tickets.models import Ticket


def _is_used(ticket: Ticket) -> bool:
    return ticket.use_date is not None
