import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from gt_back.exception_handler import exception_handler_with_logging

from ..models import Diary
from ..serializers import DiariesSerializer, DiarySerializer, ListDiaryQuerySerializer
from ..use_cases import ListDiary

logger = logging.getLogger(__name__)


class DiaryViewSet(viewsets.GenericViewSet):
    queryset = Diary.objects.all()
    serializer_class = DiarySerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, use_case=ListDiary(), format=None):
        try:
            serializer = ListDiaryQuerySerializer(data=request.GET.dict())
            serializer.is_valid(raise_exception=True)

            queries = serializer.validated_data
            diaries = use_case.execute(user=request.user, queries=queries)

            serializer = DiariesSerializer({"diaries": diaries})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as exc:
            return exception_handler_with_logging(exc)
