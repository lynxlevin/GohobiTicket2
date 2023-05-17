
from datetime import date, timedelta

from django.test import TestCase
from tickets.tests.ticket_factory import TicketFactory
from user_relations.models import UserRelation
from users.tests.user_factory import UserFactory

from .user_relation_factory import UserRelationFactory


class TestUserRelationModel(TestCase):
    def test_get_by_id(self):
        expected = UserRelationFactory()

        result = UserRelation.objects.get_by_id(expected.id)
        self.assertEqual(expected, result)

        # prefetchしなくてもuserは一緒に取得できている
        self.assertIsNotNone(result.giving_user)
        self.assertIsNotNone(result.receiving_user)

    def test_filter_by_receiving_user_id(self):
        user = UserFactory()
        expected = [
            UserRelationFactory(receiving_user=user),
            UserRelationFactory(receiving_user=user),
            UserRelationFactory(receiving_user=user),
        ]

        result = UserRelation.objects.filter_by_receiving_user_id(user.id)

        self.assertEqual(3, len(result.all()))
        self.assertEqual(expected, list(result.all()))

    def test_filter_by_giving_user_id(self):
        user = UserFactory()
        expected = [
            UserRelationFactory(giving_user=user),
            UserRelationFactory(giving_user=user),
            UserRelationFactory(giving_user=user),
        ]

        result = UserRelation.objects.filter_by_giving_user_id(user.id)

        self.assertEqual(3, len(result.all()))
        self.assertEqual(expected, list(result.all()))

    def test_property_corresponding_relation(self):
        user_relation = UserRelationFactory()
        expected = UserRelationFactory(
            giving_user=user_relation.receiving_user,
            receiving_user=user_relation.giving_user,
        )

        result = user_relation.corresponding_relation

        self.assertEqual(expected, result)

    # sample for record fetching
    def test_tickets(self):
        user_relation = UserRelationFactory()
        expected = [
            TicketFactory(user_relation=user_relation),
            TicketFactory(user_relation=user_relation),
            TicketFactory(user_relation=user_relation),
            TicketFactory(user_relation=user_relation),
        ]

        result = user_relation.ticket_set.all()

        self.assertEqual(list(result), expected)

    # sample for record fetching
    def test_has_special_ticket(self):
        target_date = date(2022, 6, 11)

        user_relation1 = UserRelationFactory()
        TicketFactory(user_relation=user_relation1, is_special=True, gift_date=target_date - timedelta(days=31))
        result1 = user_relation1.ticket_set.filter_special_tickets(target_date).exists()
        self.assertFalse(result1)

        user_relation2 = UserRelationFactory()
        TicketFactory(user_relation=user_relation2, is_special=True, gift_date=target_date)
        result2 = user_relation2.ticket_set.filter_special_tickets(target_date).exists()
        self.assertTrue(result2)
