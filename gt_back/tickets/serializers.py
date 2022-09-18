from rest_framework import serializers
from tickets.models.ticket import Ticket


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "user_relation",
            "description",
            "gift_date",
            "use_description",
            "use_date",
            "status",
            "is_special",
        ]


class TicketCreateSerializer(serializers.Serializer):
    class TicketCreateRequestSerializer(serializers.Serializer):
        gift_date = serializers.DateField()
        description = serializers.CharField()
        user_relation_id = serializers.CharField()
        status = serializers.ChoiceField(choices=Ticket.STATUS_CHOICES, required=False)

    id = serializers.CharField(read_only=True)
    ticket = TicketCreateRequestSerializer(write_only=True)


class TicketPartialUpdateSerializer(serializers.Serializer):
    class TicketPartialUpdateRequestSerializer(serializers.Serializer):
        description = serializers.CharField(required=False)
        status = serializers.ChoiceField(choices=Ticket.STATUS_CHOICES, required=False)

    id = serializers.CharField(read_only=True)
    ticket = TicketPartialUpdateRequestSerializer(write_only=True)


class TicketUseSerializer(serializers.Serializer):
    class TicketUseRequestSerializer(serializers.Serializer):
        use_description = serializers.CharField()

    id = serializers.CharField(read_only=True)
    ticket = TicketUseRequestSerializer(write_only=True)


class TicketIdResponseSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
