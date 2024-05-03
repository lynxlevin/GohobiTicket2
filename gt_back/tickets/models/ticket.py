from calendar import monthrange
from datetime import date
from typing import Optional

from django.db import models
from django.db.models import Q
from user_relations.models import UserRelation
from users.models import User

from ..enums import TicketStatus


class TicketQuerySet(models.QuerySet):
    def get_by_id(self, ticket_id) -> Optional["Ticket"]:
        try:
            return self.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return None

    def filter_eq_user_relation_id(self, user_relation_id: str) -> "TicketQuerySet":
        return self.filter(user_relation__id=user_relation_id)

    def filter_eq_user_id(self, user_id: int) -> "TicketQuerySet":
        return self.filter(Q(user_relation__user_1_id=user_id) | Q(user_relation__user_2_id=user_id))

    def filter_eq_giving_user_id(self, user_id: str) -> "TicketQuerySet":
        return self.filter(giving_user_id=user_id)

    def exclude_eq_giving_user_id(self, user_id: str) -> "TicketQuerySet":
        return self.exclude(giving_user_id=user_id)

    def filter_unused_tickets(self) -> "TicketQuerySet":
        return self.filter(use_date=None).order_by("-gift_date", "-id")

    def filter_used_tickets(self) -> "TicketQuerySet":
        return self.exclude(use_date=None).order_by("-use_date", "-id")

    def filter_special_tickets(self, target_date: date) -> "TicketQuerySet":
        start_of_month = date(target_date.year, target_date.month, 1)
        end_of_month = date(
            target_date.year,
            target_date.month,
            monthrange(target_date.year, target_date.month)[1],
        )
        return self.filter(is_special=True, gift_date__gte=start_of_month, gift_date__lte=end_of_month)

    def exclude_eq_status(self, status) -> "TicketQuerySet":
        return self.exclude(status=status)


class Ticket(models.Model):
    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    giving_user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(default="", blank=True)
    gift_date = models.DateField()
    use_description = models.TextField(default="", blank=True)
    use_date = models.DateField(null=True)
    status = models.CharField(
        max_length=8, choices=TicketStatus.choices_for_model(), default=TicketStatus.STATUS_UNREAD.value
    )
    is_special = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects: TicketQuerySet = TicketQuerySet.as_manager()

    def __repr__(self):
        return f"<Ticket({str(self.id)})>"

    @property
    def receiving_user(self) -> User:
        relation = self.user_relation
        related_users = [relation.user_1, relation.user_2]
        for user in related_users:
            if user != self.giving_user:
                return user
