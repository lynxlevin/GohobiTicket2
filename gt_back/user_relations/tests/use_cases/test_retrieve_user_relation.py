from datetime import date

from django.test import Client, TestCase
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, NotFound
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from user_relations.use_cases import RetrieveUserRelation


class TestUserRelationViews(TestCase):
    maxDiff = None

    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

        cls.user = cls.seeds.users[0]
        cls.user_relation = cls.seeds.user_relations[0]

        cls.non_related_user = cls.seeds.users[2]
        cls.non_related_relation = cls.seeds.user_relations[1]

        cls.non_existent_relation_id = "-1"

    def test_retrieve_user_relation(self):
        data = RetrieveUserRelation().execute(self.user_relation.id, self.user.id)

        expected = {
            "user_relation_info": {
                "id": self.user_relation.id,
                "related_user_nickname": self.seeds.users[1].username,
                "is_giving_relation": True,
                "ticket_image": self.user_relation.ticket_img,
                "background_color": self.user_relation.background_color,
                "corresponding_relation_id": self.seeds.user_relations[1].id,
            },
            "other_receiving_relations": [
                {
                    "id": self.seeds.user_relations[1].id,
                    "related_user_nickname": self.seeds.users[1].username,
                },
                {
                    "id": self.seeds.user_relations[3].id,
                    "related_user_nickname": self.seeds.users[2].username,
                },
                {
                    "id": self.seeds.user_relations[5].id,
                    "related_user_nickname": self.seeds.users[3].username,
                },
            ],
            "available_tickets": [
                *self.seeds.tickets[0:4],
                *self.seeds.tickets[8:12],
            ],
            "used_tickets": [
                *self.seeds.tickets[4:8],
                *self.seeds.tickets[12:16],
            ],
            "all_ticket_count": 16,
            "available_ticket_count": 8,
        }
        self.assertDictContainsSubset(expected, data)

    def test_retrieve_non_related_user(self):
        with self.assertRaises(PermissionDenied):
            RetrieveUserRelation().execute(
                self.non_related_relation.id, self.non_related_user.id
            )

    def test_retrieve_non_existent_relation(self):
        with self.assertRaises(NotFound):
            RetrieveUserRelation().execute(
                self.non_existent_relation_id, self.non_related_user.id
            )
