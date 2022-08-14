from tickets.serializers import TicketSerializer
from tickets.models.ticket import Ticket
from rest_framework import viewsets, permissions, views, authentication
from rest_framework.response import Response


class TicketViewSet(viewsets.GenericViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    # authentication_classes = [authentication.TokenAuthentication]
    # permission_classes = [permissions.IsAuthenticated] # MYMEMO: APIViewでは効かないらしい？https://stackoverflow.com/questions/57302570/detail-method-get-not-allowed-django-rest-framework#answer-57302953

    # MYMEMO: いらないはずなので、後で消す
    def list(self, request, format=None):
        tickets = Ticket.objects.order_by("-gift_date")
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)
