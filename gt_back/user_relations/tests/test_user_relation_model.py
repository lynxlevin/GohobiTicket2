from datetime import date

from django.test import TestCase
from tickets.test_utils.test_seeds import TestSeed
from user_relations.models import UserRelation


class TestUserRelationModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_by_id(self):
        user1, user2 = self.seeds.users[0:2]
        user_relation = self.seeds.user_relations[0]

        result = UserRelation.objects.get_by_id(user_relation.id)
        self.assertEqual(result, user_relation)

        # prefetchしなくてもuserは一緒に取得できている
        self.assertEqual(result.giving_user, user1)
        self.assertEqual(result.receiving_user, user2)

    def test_filter_by_receiving_user_id(self):
        user1 = self.seeds.users[0]
        expected = [self.seeds.user_relations[1],
                    self.seeds.user_relations[3], self.seeds.user_relations[5]]

        result = UserRelation.objects.filter_by_receiving_user_id(user1.id)

        self.assertEqual(len(result.all()), 3)
        self.assertEqual(list(result.all()), expected)

    def test_filter_by_giving_user_id(self):
        user1 = self.seeds.users[0]
        expected = [self.seeds.user_relations[0],
                    self.seeds.user_relations[2], self.seeds.user_relations[4]]

        result = UserRelation.objects.filter_by_giving_user_id(user1.id)

        self.assertEqual(len(result.all()), 3)
        self.assertEqual(list(result.all()), expected)

    def test_property_corresponding_relation(self):
        user_relation = self.seeds.user_relations[0]
        expected = self.seeds.user_relations[1]

        result = user_relation.corresponding_relation

        self.assertEqual(result, expected)

    # sample for record fetching
    def test_tickets(self):
        user_relation = self.seeds.user_relations[0]
        expected = self.seeds.tickets[0:16]

        result = user_relation.ticket_set.all()

        self.assertEqual(list(result), expected)

    # sample for record fetching
    def test_has_special_ticket(self):
        target_date = date(2022, 6, 11)

        user_relation1 = self.seeds.user_relations[0]
        result1 = user_relation1.ticket_set.filter_special_tickets(
            target_date).exists()
        self.assertFalse(result1)

        user_relation2 = self.seeds.user_relations[1]
        result2 = user_relation2.ticket_set.filter_special_tickets(
            target_date).exists()
        self.assertTrue(result2)
