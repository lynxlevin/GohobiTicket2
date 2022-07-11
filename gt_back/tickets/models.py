from typing import Optional
from django.db import models

from user_relations.models import UserRelation


class TicketQuerySet(models.QuerySet):
    # sample method
    def get_by_id(self, ticket_id) -> Optional["Ticket"]:
        try:
            return self.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return None

    def get_unused_tickets(self, user_relation_id) -> "TicketQuerySet":
        return self.filter(user_relation__id=user_relation_id).filter(use_date=None).order_by("-gift_date").order_by("-id")

    def get_unused_complete_tickets(self, user_relation_id) -> "TicketQuerySet":
        return self.filter(user_relation__id=user_relation_id).filter(use_date=None).exclude(status="draft").order_by("-gift_date").order_by("-id")

    def get_used_tickets(self, user_relation_id) -> "TicketQuerySet":
        return self.filter(user_relation__id=user_relation_id).exclude(use_date=None).order_by("-use_date").order_by("-id")


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
    status = models.CharField(max_length=8, choices=STATUS_CHOICES)
    is_special = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: TicketQuerySet = TicketQuerySet.as_manager()

    def __repr__(self):
        return f"<Ticket({str(self.id)})>"
