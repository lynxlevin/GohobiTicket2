from rest_framework import serializers


class UserRelationSerializer(serializers.Serializer):
    id = serializers.CharField()
    related_username = serializers.CharField()
    user_1_giving_ticket_img = serializers.CharField()
    user_2_giving_ticket_img = serializers.CharField()


class ListUserRelationSerializer(serializers.Serializer):
    user_relations = UserRelationSerializer(many=True)
