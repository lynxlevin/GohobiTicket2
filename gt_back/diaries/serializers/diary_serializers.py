from rest_framework import serializers

from ..enums import DiaryStatus
from .diary_tag_serializers import DiaryTagSerializer


class DiarySerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    entry = serializers.CharField()
    date = serializers.DateField()
    tags = DiaryTagSerializer(many=True, required=False)
    status = serializers.ChoiceField(choices=DiaryStatus.choices_for_serializer(), required=False)


class DiariesSerializer(serializers.Serializer):
    diaries = DiarySerializer(many=True, read_only=True)


class ListDiaryQuerySerializer(serializers.Serializer):
    user_relation_id = serializers.IntegerField()


class CreateDiaryRequestSerializer(serializers.Serializer):
    entry = serializers.CharField()
    date = serializers.DateField()
    user_relation_id = serializers.IntegerField()
    tag_ids = serializers.ListField(child=serializers.UUIDField())


class UpdateDiaryRequestSerializer(serializers.Serializer):
    entry = serializers.CharField()
    date = serializers.DateField()
    tag_ids = serializers.ListField(child=serializers.UUIDField())
