import logging

from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from gt_back.exception_handler import exception_handler_with_logging

from ..models import Diary

logger = logging.getLogger(__name__)


class DiaryViewSet(viewsets.GenericViewSet):
    queryset = Diary.objects.all()
    # serializer_class = TicketSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, format=None):
        try:
            # serializer = TicketCreateSerializer(data=request.data)
            # serializer.is_valid(raise_exception=True)

            # data = serializer.validated_data["ticket"]
            # ticket = use_case.execute(user=request.user, data=data)

            # serializer = self.get_serializer(ticket)
            return Response({"diaries": []}, status=status.HTTP_200_OK)

        except Exception as exc:
            return exception_handler_with_logging(exc)
