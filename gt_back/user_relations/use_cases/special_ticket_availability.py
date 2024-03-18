import logging
from datetime import datetime

from rest_framework import exceptions
from tickets.models import Ticket
from user_relations.models import UserRelation

logger = logging.getLogger(__name__)


class SpecialTicketAvailability:
    def __init__(self):
        self.exception_log_title = f"{__class__.__name__}_exception"

    def execute(
        self,
        user_relation_id: str,
        user_id: str,
        query_params: dict,
    ) -> bool:
        logger.info(
            "SpecialTicketAvailability",
            extra={
                "user_relation_id": user_relation_id,
                "query_params": query_params,
            },
        )
        year = int(query_params.get("year"))
        month = int(query_params.get("month"))

        if not 2020 <= year <= 2200 or not 1 <= month <= 12:
            raise exceptions.ValidationError()

        year_month = datetime(year=year, month=month, day=1)

        user_relation = UserRelation.objects.get_by_id(user_relation_id)

        if not user_relation:
            raise exceptions.NotFound()

        if user_id not in [user_relation.user_1_id, user_relation.user_2_id]:
            raise exceptions.NotFound()

        has_other_special_tickets_in_month = (
            Ticket.objects.filter_eq_user_relation_id(user_relation_id).filter_special_tickets(year_month).count() > 0
        )

        return not has_other_special_tickets_in_month
