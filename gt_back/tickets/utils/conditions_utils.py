from django.db import models

from tickets.models import Ticket
from users.models import User
from user_relations.models import UserRelation


def _is_none(model: models.Model) -> bool:
    return model is None


def _is_used(ticket: Ticket) -> bool:
    return ticket.use_date is not None


def _is_not_giving_user(user: User, user_relation: UserRelation) -> bool:
    return user != user_relation.giving_user


def _is_not_receiving_user(user: User, user_relation: UserRelation) -> bool:
    return user != user_relation.receiving_user
