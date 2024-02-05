import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user_relations.models import UserRelation
from user_relations.serializers import ListUserRelationSerializer
from user_relations.use_cases import ListUserRelation, SpecialTicketAvailability

from gt_back.exception_handler import exception_handler_with_logging

logger = logging.getLogger(__name__)


class UserRelationViewSet(viewsets.GenericViewSet):
    queryset = UserRelation.objects.all()
    serializer_class = ListUserRelationSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListUserRelation(), format=None):
        try:
            user_relations = use_case.execute(request.user.id)
            serializer = ListUserRelationSerializer({"user_relations": user_relations})
            return Response(serializer.data)
        except Exception as exc:
            return exception_handler_with_logging(exc)

    @action(detail=True, methods=["get"])
    def special_ticket_availability(self, request, use_case=SpecialTicketAvailability(), pk=None):
        try:
            result = use_case.execute(pk, request.user.id, request.query_params)
            return Response(result)
        except Exception as exc:
            return exception_handler_with_logging(exc)
