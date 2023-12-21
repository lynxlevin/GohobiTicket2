import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from gt_back.exception_handler import exception_handler_with_logging

from ..models import DiaryTag
from ..serializers import CreateDiaryTagRequestSerializer, DiaryTagSerializer, DiaryTagsSerializer, ListDiaryTagQuerySerializer
from ..use_cases import CreateDiaryTag, ListDiaryTag, UpdateDiary

logger = logging.getLogger(__name__)


class DiaryTagViewSet(viewsets.GenericViewSet):
    queryset = DiaryTag.objects.all()
    serializer_class = DiaryTagSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListDiaryTag(), format=None):
        try:
            serializer = ListDiaryTagQuerySerializer(data=request.GET.dict())
            serializer.is_valid(raise_exception=True)

            queries = serializer.validated_data
            diary_tags = use_case.execute(user=request.user, queries=queries)

            serializer = DiaryTagsSerializer({"diary_tags": diary_tags})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    def create(self, request, use_case=CreateDiaryTag(), format=None):
        try:
            serializer = CreateDiaryTagRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            tag = use_case.execute(user=request.user, data=data)

            serializer = self.get_serializer(tag)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            return exception_handler_with_logging(exc)

    # def update(self, request, use_case=UpdateDiary(), format=None, pk=None):
    #     try:
    #         serializer = self.get_serializer(data=request.data)
    #         serializer.is_valid(raise_exception=True)

    #         data = serializer.validated_data
    #         diary = use_case.execute(user=request.user, id=pk, data=data)

    #         serializer = self.get_serializer(diary)
    #         return Response(serializer.data)

    #     except Exception as exc:
    #         return exception_handler_with_logging(exc)
