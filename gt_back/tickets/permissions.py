from typing import TYPE_CHECKING

from rest_framework.permissions import BasePermission

if TYPE_CHECKING:
    from tickets.models import Ticket


class IsGivingUser(BasePermission):
    def has_object_permission(self, request, view, obj: "Ticket"):
        return obj.giving_user_id == request.user.id


class IsReceivingUser(BasePermission):
    def has_object_permission(self, request, view, obj: "Ticket"):
        return obj.giving_user_id != request.user.id


class IsUnusedTicket(BasePermission):
    def has_object_permission(self, request, view, obj: "Ticket"):
        return obj.use_date is None
