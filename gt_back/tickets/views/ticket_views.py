from user_relations.models import UserRelation
from ..serializers import TicketCreateSerializer, TicketPartialUpdateSerializer
from tickets.serializers import TicketSerializer
from tickets.models.ticket import Ticket
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated


class TicketViewSet(viewsets.GenericViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    # MYMEMO: いらないはずなので、後で消す
    def list(self, request, format=None):
        tickets = Ticket.objects.order_by("-gift_date")
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

    def create(self, request, format=None):
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
