from tickets.models.ticket import Ticket
from rest_framework import serializers


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['user_relation', 'description', 'gift_date',
                  'use_description', 'use_date', 'status', 'is_special']
