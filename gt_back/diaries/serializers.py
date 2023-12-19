from rest_framework import serializers


class DiarySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    entry = serializers.CharField()
    date = serializers.DateField()

class DiariesSerializer(serializers.Serializer):
    diaries = DiarySerializer(many=True, read_only=True)


class ListDiaryQuerySerializer(serializers.Serializer):
    user_relation_id = serializers.IntegerField()


