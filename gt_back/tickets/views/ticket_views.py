from datetime import date
import requests
from gt_back.messages import ErrorMessages, SlackMessageTemplates
from user_relations.models import UserRelation
from ..serializers import *
from tickets.serializers import TicketSerializer
from tickets.models.ticket import Ticket
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
import logging
import os

logger = logging.getLogger(__name__)


class TicketViewSet(viewsets.GenericViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, format=None):
        logger.info("CreateTicket", extra={"request.data": request.data})

        serializer = TicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data["ticket"]

        user = request.user
        user_relation = UserRelation.objects.get_by_id(
            data["user_relation_id"])

        # MYMEMO: raise して except したほうが読みやすいかも
        if user_relation is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if user != user_relation.giving_user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        ticket = Ticket(gift_date=data["gift_date"], description=data["description"],
                        user_relation_id=data["user_relation_id"])
        ticket.save()

        serializer = TicketCreateSerializer({"id": ticket.id})

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, format=None, pk=None):
        logger.info("PatialUpdateTicket", extra={
                    "request.data": request.data, "pk": pk})

        serializer = TicketPartialUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data["ticket"]

        ticket = Ticket.objects.get_by_id(pk)

        if ticket is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        user = request.user
        user_relation = ticket.user_relation

        if user != user_relation.giving_user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        ticket.description = data["description"]
        ticket.save(update_fields=["description", "updated_at"])

        serializer = TicketPartialUpdateSerializer({"id": ticket.id})

        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, format=None, pk=None):
        logger.info("DestroyTicket", extra={
                    "request.data": request.data, "pk": pk})

        ticket = Ticket.objects.get_by_id(pk)

        if ticket is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if ticket.use_date is not None:
            return Response(status=status.HTTP_403_FORBIDDEN)

        user = request.user
        user_relation = ticket.user_relation

        if user != user_relation.giving_user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        ticket.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["put"])
    def mark_special(self, request, format=None, pk=None):
        logger.info("MarkSpecialTicket", extra={
                    "request.data": request.data, "pk": pk})

        ticket = Ticket.objects.get_by_id(pk)

        if ticket is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if ticket.use_date is not None:
            return Response(status=status.HTTP_403_FORBIDDEN)

        # MYMEMO: 共通化したい
        user = request.user
        user_relation = ticket.user_relation

        if user != user_relation.giving_user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        has_other_special_tickets_in_month = Ticket.objects.filter_eq_user_relation_id(user_relation.id).filter_special_tickets(
            ticket.gift_date).count() != 0

        if has_other_special_tickets_in_month:
            return Response({"error_message": ErrorMessages.SPECIAL_TICKET_LIMIT_VIOLATION.value}, status=status.HTTP_403_FORBIDDEN)

        ticket.is_special = True
        ticket.save()

        serializer = TicketIdResponseSerializer({"id": ticket.id})
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["put"])
    def use(self, request, format=None, pk=None):
        logger.info("UseTicket", extra={
                    "request.data": request.data, "pk": pk})

        serializer = TicketUseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data["ticket"]

        ticket = Ticket.objects.get_by_id(pk)

        if ticket is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if ticket.use_date is not None:
            return Response(status=status.HTTP_403_FORBIDDEN)

        user = request.user
        user_relation = ticket.user_relation

        if user != user_relation.receiving_user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        ticket.use_description = data["use_description"]
        ticket.use_date = date.today()
        ticket.save(update_fields=["use_date",
                    "use_description", "updated_at"])

        try:
            # MYMEMO: メッセージ送るところまで別クラスにする
            url = os.getenv("SLACK_API_URL")
            slack_message = SlackMessageTemplates()
            message_method = "get_special_message" if ticket.is_special else "get_message"
            logger.info(message_method)
            message = getattr(slack_message, message_method)(
                ticket_user_name=user.username,
                ticket_gifter_name=ticket.user_relation.giving_user.username,
                use_description=data["use_description"],
                description=ticket.description,
            )
            header = {"Content-type": "application/json"}
            connect_timeout = 5.0
            read_timeout = 30.0
            response = requests.post(url, data=message, headers=header,
                                     timeout=(connect_timeout, read_timeout))
            response.raise_for_status()
            logger.info("Successfully sent message to Slack",
                        extra={"slack_message": message})

        except Exception as exc:
            logger.error("Slack message error", extra={
                         "response_text": exc.response.text, "response_status_code": exc.response.status_code})

        serializer = TicketUseSerializer({"id": ticket.id})

        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
