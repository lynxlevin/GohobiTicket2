import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_202_ACCEPTED, HTTP_204_NO_CONTENT

from gt_back.exception_handler import exception_handler_with_logging
from gt_back.view_set_mixins import PermissionByActionMixin
from tickets.models import Ticket
from tickets.permissions import IsGivingUser, IsReceivingUser, IsUnusedTicket
from tickets.serializers import (
    ListTicketQuerySerializer,
    ListTicketSerializer,
    TicketCreateSerializer,
    TicketIdResponseSerializer,
    TicketPartialUpdateSerializer,
    TicketSerializer,
    TicketUseSerializer,
)
from tickets.use_cases import CreateTicket, DestroyTicket, ListTicket, PartialUpdateTicket, ReadTicket, UseTicket

logger = logging.getLogger(__name__)


class TicketViewSet(PermissionByActionMixin, viewsets.GenericViewSet):
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    common_permission_classes = [IsAuthenticated]
    permission_classes_by_action = {
        "partial_update": [IsGivingUser],
        "destroy": [IsGivingUser, IsUnusedTicket],
        "read": [IsReceivingUser],
        "use": [IsReceivingUser, IsUnusedTicket],
    }

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.filter_by_permitted_user_id(user.id)

        if user_relation_id := self.request.GET.dict().get("user_relation_id"):
            return queryset.filter_eq_user_relation_id(user_relation_id)

        return queryset

    def get_object_or_404(self):
        queryset = self.get_queryset()
        if ticket_id := self.kwargs.get("pk"):
            ticket = queryset.get_by_id(ticket_id)
            if ticket is None:
                raise NotFound(detail="Ticket not found.")

            self.check_object_permissions(self.request, ticket)
            return ticket

    def list(self, request, use_case=ListTicket(), format=None):
        try:
            serializer = ListTicketQuerySerializer(data=request.GET.dict())
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data

            queryset = self.get_queryset()
            tickets = use_case.execute(user=request.user, queries=data, queryset=queryset)

            serializer = ListTicketSerializer({"tickets": tickets})
            return Response(serializer.data)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def create(self, request, use_case=CreateTicket(), format=None):
        try:
            serializer = TicketCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]
            ticket = use_case.execute(user=request.user, data=data)

            serializer = self.get_serializer(ticket)
            return Response({"ticket": serializer.data}, status=HTTP_201_CREATED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def partial_update(self, request, use_case=PartialUpdateTicket(), format=None, pk=None):
        try:
            serializer = TicketPartialUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]

            ticket = self.get_object_or_404()
            ticket = use_case.execute(user=request.user, ticket=ticket, data=data)

            serializer = TicketSerializer(ticket)

            return Response(serializer.data, status=HTTP_202_ACCEPTED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def destroy(self, request, use_case=DestroyTicket(), format=None, pk=None):
        try:
            ticket = self.get_object_or_404()
            use_case.execute(ticket=ticket, user=request.user)

            return Response(status=HTTP_204_NO_CONTENT)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    @action(detail=True, methods=["put"])
    def use(self, request, use_case=UseTicket(), format=None, pk=None):
        try:
            serializer = TicketUseSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]

            ticket = self.get_object_or_404()
            ticket = use_case.execute(user=request.user, data=data, ticket=ticket)

            serializer = TicketSerializer(ticket)

            return Response(serializer.data, status=HTTP_202_ACCEPTED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    @action(detail=True, methods=["put"])
    def read(self, request, use_case=ReadTicket(), format=None, pk=None):
        try:
            ticket = self.get_object_or_404()
            ticket = use_case.execute(request.user, ticket)

            serializer = TicketIdResponseSerializer({"id": ticket.id})
            return Response(serializer.data, status=HTTP_202_ACCEPTED)
        except Exception as exc:
            return exception_handler_with_logging(exc)
