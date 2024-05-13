from rest_framework import serializers


class UserRelationSerializer(serializers.Serializer):
    id = serializers.CharField()
    related_username = serializers.CharField()
    giving_ticket_img = serializers.CharField()
    receiving_ticket_img = serializers.CharField()
    use_slack = serializers.BooleanField()


class ListUserRelationSerializer(serializers.Serializer):
    user_relations = UserRelationSerializer(many=True)
