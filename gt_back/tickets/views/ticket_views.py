import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_202_ACCEPTED, HTTP_204_NO_CONTENT
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

from gt_back.exception_handler import exception_handler_with_logging

logger = logging.getLogger(__name__)


class TicketViewSet(viewsets.GenericViewSet):
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListTicket(), format=None):
        try:
            serializer = ListTicketQuerySerializer(data=request.GET.dict())
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            tickets = use_case.execute(user=request.user, queries=data)

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

            ticket = use_case.execute(user=request.user, ticket_id=pk, data=data)

            serializer = TicketSerializer(ticket)

            return Response(serializer.data, status=HTTP_202_ACCEPTED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def destroy(self, request, use_case=DestroyTicket(), format=None, pk=None):
        try:
            use_case.execute(ticket_id=pk, user=request.user)

            return Response(status=HTTP_204_NO_CONTENT)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    @action(detail=True, methods=["put"])
    def use(self, request, use_case=UseTicket(), format=None, pk=None):
        try:
            serializer = TicketUseSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]

            ticket = use_case.execute(user=request.user, data=data, ticket_id=pk)

            serializer = TicketSerializer(ticket)

            return Response(serializer.data, status=HTTP_202_ACCEPTED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    @action(detail=True, methods=["put"])
    def read(self, request, use_case=ReadTicket(), format=None, pk=None):
        try:
            ticket = use_case.execute(request.user, pk)

            serializer = TicketIdResponseSerializer({"id": ticket.id})
            return Response(serializer.data, status=HTTP_202_ACCEPTED)
        except Exception as exc:
            return exception_handler_with_logging(exc)
