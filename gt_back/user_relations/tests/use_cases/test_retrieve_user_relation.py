from django.test import TestCase
from rest_framework.exceptions import NotFound, PermissionDenied
from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory
from user_relations.tests.user_relation_factory import UserRelationFactory
from user_relations.use_cases import RetrieveUserRelation
from users.tests.user_factory import UserFactory


class TestUserRelationViews(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.related_user = UserFactory()
        cls.giving_relation = UserRelationFactory(giving_user=cls.user, receiving_user=cls.related_user)
        cls.receiving_relation = UserRelationFactory(receiving_user=cls.user, giving_user=cls.related_user)
        cls.another_receiving_relation = UserRelationFactory(receiving_user=cls.user)

        cls.available_tickets = [
            *TicketFactory.create_batch(5, user_relation=cls.giving_relation),
        ]
        cls.used_tickets = [
            *UsedTicketFactory.create_batch(5, user_relation=cls.giving_relation),
        ]

    def test_retrieve_user_relation(self):
        data = RetrieveUserRelation().execute(self.giving_relation.id, self.user.id)

        expected = {
            "user_relation_info": {
                "id": self.giving_relation.id,
                "related_user_nickname": self.related_user.username,
                "is_giving_relation": True,
                "ticket_image": self.giving_relation.ticket_img,
                "background_color": self.giving_relation.background_color,
                "corresponding_relation_id": self.receiving_relation.id,
            },
            "other_receiving_relations": [
                {
                    "id": self.receiving_relation.id,
                    "related_user_nickname": self.related_user.username,
                },
                {
                    "id": self.another_receiving_relation.id,
                    "related_user_nickname": self.another_receiving_relation.giving_user.username,
                },
            ],
            "available_tickets": sorted(self.available_tickets, key=lambda t: t.gift_date, reverse=True),
            "used_tickets": sorted(self.used_tickets, key=lambda t: t.use_date, reverse=True),
            "all_ticket_count": len(self.available_tickets + self.used_tickets),
            "available_ticket_count": len(self.available_tickets),
        }
        self.assertDictContainsSubset(expected, data)

    def test_retrieve_non_related_user(self):
        non_related_relation = UserRelationFactory()

        with self.assertRaises(PermissionDenied):
            RetrieveUserRelation().execute(
                non_related_relation.id, self.user.id
            )

    def test_retrieve_non_existent_relation(self):
        non_existent_relation_id = "-1"

        with self.assertRaises(NotFound):
            RetrieveUserRelation().execute(
                non_existent_relation_id, self.user.id
            )
