from tickets.serializers import TicketSerializer
from tickets.models.ticket import Ticket
from rest_framework import viewsets, permissions


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-gift_date')
    serializer_class = TicketSerializer
    # permission_class = [permissions.isAuthenticated]
