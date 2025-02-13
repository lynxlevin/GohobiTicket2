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

        # MYMEMO: add serializers for query
        if not 2020 <= year <= 2200 or not 1 <= month <= 12:
            raise exceptions.ValidationError()

        year_month = datetime(year=year, month=month, day=1)

        user_relation = UserRelation.objects.filter_eq_user_id(user_id).get_by_id(user_relation_id)

        if not user_relation:
            raise exceptions.NotFound()

        has_other_special_tickets_in_month = (
            Ticket.objects.filter_eq_user_relation_id(user_relation_id)
            .filter_eq_giving_user_id(user_id)
            .filter_special_tickets(year_month)
            .exists()
        )

        return not has_other_special_tickets_in_month
