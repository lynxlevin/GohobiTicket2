import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from user_relations.models import UserRelation
from user_relations.use_cases import RetrieveUserRelation, SpecialTicketAvailability
from user_relations.serializers import UserRelationRetrieveSerializer
from gt_back.exception_handler import exception_handler_with_logging

logger = logging.getLogger(__name__)


class UserRelationViewSet(viewsets.GenericViewSet):
    queryset = UserRelation.objects.all()
    serializer_class = UserRelationRetrieveSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, use_case=RetrieveUserRelation(), format=None, pk=None):
        try:
            tickets = use_case.execute(pk, request.user.id)
            serializer = self.get_serializer(tickets)
            return Response(serializer.data)
        except Exception as exc:
            return exception_handler_with_logging(exc)

    @action(detail=True, methods=["get"])
    def special_ticket_availability(
        self, request, use_case=SpecialTicketAvailability(), pk=None
    ):
        try:
            result = use_case.execute(pk, request.user.id, request.query_params)
            return Response(result)
        except Exception as exc:
            return exception_handler_with_logging(exc)
