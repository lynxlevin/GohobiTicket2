from rest_framework import serializers


class UserRelationSerializer(serializers.Serializer):
    id = serializers.CharField()
    related_username = serializers.CharField()
    is_giving_relation = serializers.BooleanField()
    ticket_image = serializers.CharField()
    corresponding_relation_id = serializers.CharField()


class ListUserRelationSerializer(serializers.Serializer):
    user_relations = UserRelationSerializer(many=True)
