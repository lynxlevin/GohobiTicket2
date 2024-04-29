from diaries.enums import DiaryStatus
from diaries.models import Diary
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
        Diary.objects.update(user_1_status=DiaryStatus.STATUS_READ.value, user_2_status=DiaryStatus.STATUS_READ.value)
