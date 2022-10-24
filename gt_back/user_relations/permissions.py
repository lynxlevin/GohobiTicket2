import logging

from rest_framework.permissions import BasePermission
from user_relations.models.user_relation import UserRelation

logger = logging.getLogger(__name__)


class IsGivingUserOrReceivingUser(BasePermission):
    message = "Wrong user_relation accessed"

    # MYMEMO: use_case 内でやるべきかも
    def has_permission(self, request, view):
        user = request.user
        user_relation_id = request.parser_context["kwargs"]["pk"]
        user_relation = UserRelation.objects.get_by_id(user_relation_id)
        if user_relation.giving_user == user:
            return True
        elif user_relation.receiving_user == user:
            return True
        else:
            logger.info("IsGivingUserOrReceivingUser_False", extra={"user_id": user.id})
            return False
