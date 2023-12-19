from datetime import date

import factory
import factory.fuzzy
from user_relations.tests.user_relation_factory import UserRelationFactory

from ..models import Diary


class DiaryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Diary

    user_relation = factory.SubFactory(UserRelationFactory)
    entry = "今日もいいことありますように🌈"
    date = factory.fuzzy.FuzzyDate(date(2020, 1, 1))

