from calendar import monthrange
from datetime import date
from typing import Optional

from django.db import models
from user_relations.models import UserRelation


class TicketQuerySet(models.QuerySet):
    def get_by_id(self, ticket_id) -> Optional["Ticket"]:
        try:
            return self.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return None

    def filter_eq_user_relation_id(self, user_relation_id: str) -> "TicketQuerySet":
        return Ticket.objects.filter(user_relation__id=user_relation_id)

    def filter_unused_tickets(self) -> "TicketQuerySet":
        return self.filter(use_date=None).order_by("-gift_date").order_by("-id")

    def filter_unused_complete_tickets(self) -> "TicketQuerySet":
        return (
            self.filter(use_date=None)
            .exclude(status="draft")
            .order_by("-gift_date")
            .order_by("-id")
        )

    def filter_used_tickets(self) -> "TicketQuerySet":
        return self.exclude(use_date=None).order_by("-use_date").order_by("-id")

    def filter_special_tickets(self, target_date: date) -> "TicketQuerySet":
        start_of_month = date(target_date.year, target_date.month, 1)
        end_of_month = date(
            target_date.year,
            target_date.month,
            monthrange(target_date.year, target_date.month)[1],
        )
        return self.filter(
            is_special=True, gift_date__gte=start_of_month, gift_date__lte=end_of_month
        )


class Ticket(models.Model):
    STATUS_UNREAD = "unread"
    STATUS_READ = "read"
    STATUS_EDITED = "edited"
    STATUS_DRAFT = "draft"

    STATUS_CHOICES = (
        (STATUS_UNREAD, STATUS_UNREAD),
        (STATUS_READ, STATUS_READ),
        (STATUS_EDITED, STATUS_EDITED),
        (STATUS_DRAFT, STATUS_DRAFT),
    )

    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    description = models.TextField(default="", blank=True)
    gift_date = models.DateField()
    use_description = models.TextField(default="", blank=True)
    use_date = models.DateField(null=True)
    status = models.CharField(
        max_length=8, choices=STATUS_CHOICES, default=STATUS_UNREAD
    )
    is_special = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: TicketQuerySet = TicketQuerySet.as_manager()

    def __repr__(self):
        return f"<Ticket({str(self.id)})>"
