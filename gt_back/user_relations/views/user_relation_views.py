from ..permissions import IsGivingUserOrReceivingUser
from tickets.serializers import TicketSerializer
from user_relations.models.user_relation import UserRelation
from tickets.models.ticket import Ticket
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated, BasePermission
import logging

logger = logging.getLogger(__name__)


class UserRelationViewSet(viewsets.GenericViewSet):
    queryset = UserRelation.objects.all()
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsGivingUserOrReceivingUser]

    def retrieve(self, request, format=None, pk=None):
        logger.info(f"RetrieveUserRelation", extra={
                    "user_relation_id": pk, "user_id": request.user.id})
        tickets = Ticket.objects.filter_eq_user_relation_id(
            pk).order_by("-gift_date", "id")
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)
