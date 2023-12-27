import logging

from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
)
from tickets.models.ticket import Ticket
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
from tickets.utils import _is_none, _is_not_giving_user, _is_used

from gt_back.exception_handler import exception_handler_with_logging
from gt_back.messages import ErrorMessages

logger = logging.getLogger(__name__)


class TicketViewSet(viewsets.GenericViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListTicket(), format=None):
        try:
            serializer = ListTicketQuerySerializer(data=request.GET.dict())
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            tickets = use_case.execute(user=request.user, queries={"user_relation_id": data["user_relation_id"]})

            serializer = ListTicketSerializer(tickets)
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

            serializer = TicketPartialUpdateSerializer({"id": ticket.id})

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
    def mark_special(self, request, format=None, pk=None):
        logger.info("MarkSpecialTicket", extra={"pk": pk})

        ticket = Ticket.objects.get_by_id(pk)

        if _is_none(ticket):
            return Response(status=HTTP_404_NOT_FOUND)

        if _is_used(ticket):
            return Response(status=HTTP_403_FORBIDDEN)

        user = request.user
        user_relation = ticket.user_relation

        if _is_not_giving_user(user, user_relation):
            return Response(status=HTTP_403_FORBIDDEN)

        has_other_special_tickets_in_month = (
            Ticket.objects.filter_eq_user_relation_id(user_relation.id).filter_special_tickets(ticket.gift_date).count()
            != 0
        )

        if has_other_special_tickets_in_month:
            # MYMEMO: use_case にしたいけど、このメッセージのハンドリング、テストが大変そう
            data = {"error_message": ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value}
            return Response(data, status=HTTP_403_FORBIDDEN)

        ticket.is_special = True
        ticket.save(update_fields=["is_special"])

        serializer = TicketIdResponseSerializer({"id": ticket.id})
        return Response(serializer.data, status=HTTP_202_ACCEPTED)

    @action(detail=True, methods=["put"])
    def use(self, request, use_case=UseTicket(), format=None, pk=None):
        try:
            serializer = TicketUseSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]

            ticket = use_case.execute(user=request.user, data=data, ticket_id=pk)

            serializer = TicketUseSerializer({"id": ticket.id})

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
