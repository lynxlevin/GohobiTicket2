from rest_framework import serializers
from tickets.serializers import TicketSerializer


class UserRelationSerializer(serializers.Serializer):
    id = serializers.CharField()
    related_username = serializers.CharField()
    is_giving_relation = serializers.BooleanField()
    ticket_image = serializers.CharField()
    corresponding_relation_id = serializers.CharField()


class ListUserRelationSerializer(serializers.Serializer):
    user_relations = UserRelationSerializer(many=True)


class UserRelationForRetrieveSerializer(serializers.Serializer):
    id = serializers.CharField()
    # MYMEMO: change to related_user_name
    related_user_nickname = serializers.CharField()
    is_giving_relation = serializers.BooleanField()
    ticket_image = serializers.CharField()
    background_color = serializers.CharField()
    corresponding_relation_id = serializers.CharField()


class UserRelationNicknameSerializer(serializers.Serializer):
    id = serializers.CharField()
    # MYMEMO: change to related_user_name
    related_user_nickname = serializers.CharField()


class UserRelationRetrieveSerializer(serializers.Serializer):
    user_relation_info = UserRelationForRetrieveSerializer(many=False)
    other_receiving_relations = UserRelationNicknameSerializer(many=True)
    available_tickets = TicketSerializer(many=True)
    used_tickets = TicketSerializer(many=True)
    all_ticket_count = serializers.IntegerField()
    available_ticket_count = serializers.IntegerField()
