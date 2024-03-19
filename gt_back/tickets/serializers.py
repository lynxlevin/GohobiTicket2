from rest_framework import serializers
from tickets.models.ticket import Ticket


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "id",
            "user_relation_id",
            "giving_user_id",
            "description",
            "gift_date",
            "use_description",
            "use_date",
            "status",
            "is_special",
        ]


class ListTicketQuerySerializer(serializers.Serializer):
    user_relation_id = serializers.IntegerField()
    is_giving = serializers.BooleanField(default=False, required=False, allow_null=True)
    is_receiving = serializers.BooleanField(default=False, required=False, allow_null=True)

    def validate_is_giving(self, attrs):
        # So that empty query `?is_giving` should be considered True
        if attrs is None:
            return True
        return attrs

    def validate_is_receiving(self, attrs):
        # So that empty query `?is_receiving` should be considered True
        if attrs is None:
            return True
        return attrs


class ListTicketSerializer(serializers.Serializer):
    tickets = TicketSerializer(many=True)


class TicketCreateSerializer(serializers.Serializer):
    class TicketCreateRequestSerializer(serializers.Serializer):
        gift_date = serializers.DateField()
        description = serializers.CharField()
        user_relation_id = serializers.CharField()
        is_special = serializers.BooleanField(required=False)
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

    ticket = TicketUseRequestSerializer(write_only=True)


class TicketIdResponseSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
