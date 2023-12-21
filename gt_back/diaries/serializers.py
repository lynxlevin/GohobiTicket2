from rest_framework import serializers


class DiarySerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    entry = serializers.CharField()
    date = serializers.DateField()

class DiariesSerializer(serializers.Serializer):
    diaries = DiarySerializer(many=True, read_only=True)


class ListDiaryQuerySerializer(serializers.Serializer):
    user_relation_id = serializers.IntegerField()


class CreateDiaryRequestSerializer(serializers.Serializer):
    entry = serializers.CharField()
    date = serializers.DateField()
    user_relation_id = serializers.IntegerField()


class DiaryTagSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    text = serializers.CharField()
    sort_no = serializers.IntegerField()

class DiaryTagsSerializer(serializers.Serializer):
    diary_tags = DiaryTagSerializer(many=True, read_only=True)


class ListDiaryTagQuerySerializer(serializers.Serializer):
    user_relation_id = serializers.IntegerField()


class CreateDiaryTagRequestSerializer(serializers.Serializer):
    text = serializers.CharField()
    user_relation_id = serializers.IntegerField()


