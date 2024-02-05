from rest_framework import serializers


class DiaryTagSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False, allow_null=True)
    text = serializers.CharField()
    sort_no = serializers.IntegerField()
    diary_count = serializers.IntegerField(required=False)


class DiaryTagsSerializer(serializers.Serializer):
    diary_tags = DiaryTagSerializer(many=True)
    user_relation_id = serializers.IntegerField(write_only=True)

    def validate_diary_tags(self, tags):
        sort_nos = [t["sort_no"] for t in tags]
        has_duplicate = len(sort_nos) != len(set(sort_nos))
        if has_duplicate:
            raise serializers.ValidationError("duplicate sort_no")

        if any((n for n in sort_nos if n < 1 or n > len(sort_nos))):
            raise serializers.ValidationError("sort_no out of range")

        return tags


class ListDiaryTagQuerySerializer(serializers.Serializer):
    user_relation_id = serializers.IntegerField()
