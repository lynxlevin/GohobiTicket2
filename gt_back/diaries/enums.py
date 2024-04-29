from enum import Enum


class DiaryStatus(Enum):
    STATUS_UNREAD = "unread"
    STATUS_EDITED = "edited"
    STATUS_READ = "read"

    @classmethod
    def choices_for_model(cls):
        return tuple((c.value, c.value) for c in cls)

    @classmethod
    def choices_for_serializer(cls):
        return tuple((c.value, c.value) for c in cls)
