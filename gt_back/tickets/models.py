from django.db import models

from user_relations.models import UserRelation


class Ticket(models.Model):
    STATUS_UNREAD = "unread"
    STATUS_READ = "read"
    STATUS_EDITED = "edited"
    STATUS_DRAFT = "draft"

    STATUS_CHOICES = (
        (STATUS_UNREAD, STATUS_UNREAD),
        (STATUS_READ, STATUS_READ),
        (STATUS_EDITED, STATUS_EDITED),
        (STATUS_DRAFT, STATUS_DRAFT),
    )

    user_relation = models.ForeignKey(UserRelation, on_delete=models.CASCADE)
    description = models.TextField(default="", blank=True)
    gift_date = models.DateTimeField()
    use_description = models.TextField(default="", blank=True)
    use_date = models.DateTimeField(null=True)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES)
    is_special = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # MYMEMO: タイムスタンプはisvizと比較
