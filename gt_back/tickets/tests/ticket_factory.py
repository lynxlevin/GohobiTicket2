from datetime import date, timedelta
from random import randint

import factory
import factory.fuzzy
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from ..enums import TicketStatus
from ..models import Ticket


class TicketFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Ticket

    user_relation = factory.SubFactory(UserRelationFactory)
    giving_user = factory.SubFactory(UserFactory)
    description = "チケットをあげるときのメッセージ。絵文字も使えます😁"
    gift_date = factory.fuzzy.FuzzyDate(date(2020, 1, 1))
    use_description = ""
    use_date = None
    status = factory.fuzzy.FuzzyChoice([st[0] for st in TicketStatus.choices_for_model()])
    is_special = False


class UsedTicketFactory(TicketFactory):
    use_description = "チケットを使うときのメッセージ。絵文字も使えます😁"
    use_date = factory.LazyAttribute(lambda ticket: ticket.gift_date + timedelta(days=randint(0, 30)))
