from django.core.management.base import BaseCommand
from tickets.models import Ticket
from datetime import datetime
import json

FILE_DIR = "tickets/fixtures"


class Command(BaseCommand):
    def handle(self, *args, **options):
        tickets = Ticket.objects.all()

        fixture = []

        for ticket in tickets:
            record = {
                "model": "tickets.ticket",
                "pk": ticket.id,
                "fields": {
                    "gift_date": str(ticket.gift_date),
                    "use_date": str(ticket.use_date),
                    "description": ticket.description,
                    "created_at": str(ticket.created_at),
                    "updated_at": str(ticket.updated_at),
                    "user_relation_id": ticket.user_relation_id,
                    "use_description": ticket.use_description,
                    "status": ticket.status,
                    "is_special": ticket.is_special,
                },
            }
            fixture.append(record)

        file_name = (
            f"{FILE_DIR}/tickets{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        )

        with open(file_name, "w", encoding="utf_8") as f:
            json.dump(fixture, f, ensure_ascii=False, indent=4)
