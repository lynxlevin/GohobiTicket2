from tickets.models.ticket import Ticket
from rest_framework import serializers


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['user_relation', 'description', 'gift_date',
                  'use_description', 'use_date', 'status', 'is_special']


class TicketCreateSerializer(serializers.Serializer):
    class TicketCreateRequestSerializer(serializers.Serializer):
        gift_date = serializers.DateField()
        description = serializers.CharField()
        user_relation_id = serializers.CharField()

    id = serializers.CharField(read_only=True)
    ticket = TicketCreateRequestSerializer(write_only=True)


class TicketPartialUpdateSerializer(serializers.Serializer):
    class TicketPartialUpdateRequestSerializer(serializers.Serializer):
        description = serializers.CharField()

    id = serializers.CharField(read_only=True)
    ticket = TicketPartialUpdateRequestSerializer(write_only=True)
