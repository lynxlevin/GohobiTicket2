from datetime import date
from gt_back.exception_handler import exception_handler_with_logging
from gt_back.messages import ErrorMessages
from tickets.use_cases import CreateTicket, DestroyTicket, PartialUpdateTicket
from tickets.utils import SlackMessengerForUseTicket
from tickets.serializers import *
from tickets.models.ticket import Ticket
from tickets.utils import _is_none, _is_used, _is_not_giving_user, _is_not_receiving_user
from rest_framework import viewsets
from rest_framework.status import HTTP_201_CREATED, HTTP_202_ACCEPTED, HTTP_204_NO_CONTENT, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
import logging

logger = logging.getLogger(__name__)


class TicketViewSet(viewsets.GenericViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, use_case=CreateTicket(), format=None):
        try:
            serializer = TicketCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]
            ticket = use_case.execute(user=request.user, data=data)

            serializer = TicketCreateSerializer({"id": ticket.id})
            return Response(serializer.data, status=HTTP_201_CREATED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def partial_update(self, request, use_case=PartialUpdateTicket(), format=None, pk=None):
        try:
            serializer = TicketPartialUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data["ticket"]

            ticket = use_case.execute(
                user=request.user, ticket_id=pk, data=data)

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
        logger.info("MarkSpecialTicket", extra={
                    "request.data": request.data, "pk": pk})

        ticket = Ticket.objects.get_by_id(pk)

        if _is_none(ticket):
            return Response(status=HTTP_404_NOT_FOUND)

        if _is_used(ticket):
            return Response(status=HTTP_403_FORBIDDEN)

        user = request.user
        user_relation = ticket.user_relation

        if _is_not_giving_user(user, user_relation):
            return Response(status=HTTP_403_FORBIDDEN)

        has_other_special_tickets_in_month = Ticket.objects.filter_eq_user_relation_id(
            user_relation.id).filter_special_tickets(ticket.gift_date).count() != 0

        if has_other_special_tickets_in_month:
            data = {
                "error_message": ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value}
            return Response(data, status=HTTP_403_FORBIDDEN)

        ticket.is_special = True
        ticket.save()

        serializer = TicketIdResponseSerializer({"id": ticket.id})
        return Response(serializer.data, status=HTTP_202_ACCEPTED)

    @action(detail=True, methods=["put"])
    def use(self, request, format=None, pk=None):
        logger.info("UseTicket", extra={
                    "request.data": request.data, "pk": pk})

        serializer = TicketUseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data["ticket"]

        ticket = Ticket.objects.get_by_id(pk)

        if _is_none(ticket):
            return Response(status=HTTP_404_NOT_FOUND)

        if _is_used(ticket):
            return Response(status=HTTP_403_FORBIDDEN)

        user = request.user
        user_relation = ticket.user_relation

        if _is_not_receiving_user(user, user_relation):
            return Response(status=HTTP_403_FORBIDDEN)

        ticket.use_description = data["use_description"]
        ticket.use_date = date.today()
        ticket.save(update_fields=["use_date",
                    "use_description", "updated_at"])

        slack_message = SlackMessengerForUseTicket()
        slack_message.generate_message(ticket)
        slack_message.send_message()

        serializer = TicketUseSerializer({"id": ticket.id})

        return Response(serializer.data, status=HTTP_202_ACCEPTED)
