from enum import Enum


class TicketStatus(Enum):
    STATUS_UNREAD = "unread"
    STATUS_READ = "read"
    STATUS_EDITED = "edited"
    STATUS_DRAFT = "draft"

    @classmethod
    def choices_for_model(cls):
        return tuple((c.value, c.value) for c in cls)

    @classmethod
    def choices_for_serializer(cls):
        return tuple((c.value, c.value) for c in cls)
