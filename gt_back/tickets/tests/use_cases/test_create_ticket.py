import logging
from datetime import datetime

from django.test import TestCase
from rest_framework import exceptions
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import CreateTicket
from users.models import User


class TestCreateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_execute(self):
        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()

        data = {
            "gift_date": "2022-08-24",
            "description": "test_ticket",
            "user_relation_id": giving_relation.id,
        }

        class_name = "tickets.use_cases.create_ticket"
        logger = logging.getLogger(class_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            created_ticket = CreateTicket().execute(user=user, data=data)

        self._make_assertions(data, created_ticket.id)

        expected_log = [f"INFO:{class_name}:CreateTicket"]
        self.assertEqual(expected_log, cm.output)

    def _make_assertions(self, data: dict, created_ticket_id: int):
        created_ticket = Ticket.objects.get_by_id(created_ticket_id)
        self.assertIsNotNone(created_ticket)

        expected_date = datetime.strptime(data["gift_date"], "%Y-%m-%d").date()
        self.assertEqual(data["user_relation_id"], created_ticket.user_relation_id)
        self.assertEqual(data["description"], created_ticket.description)
        self.assertEqual(expected_date, created_ticket.gift_date)
        self.assertEqual("", created_ticket.use_description)
        self.assertEqual(None, created_ticket.use_date)
        self.assertEqual(Ticket.STATUS_UNREAD, created_ticket.status)
        self.assertFalse(created_ticket.is_special)

    def test_execute_case_error(self):
        user = self.seeds.users[1]

        unrelated_relation_id = self.seeds.user_relations[2].id
        receiving_relation_id = user.receiving_relations.first().id

        cases = {
            "receiving_relation": {
                "id": receiving_relation_id,
                "exception": exceptions.PermissionDenied,
                "detail": "Only the giving user may create ticket.",
            },
            "unrelated_relation": {
                "id": unrelated_relation_id,
                "exception": exceptions.PermissionDenied,
                "detail": "Only the giving user may create ticket.",
            },
            "non_existent_user_relation": {
                "id": "-1",
                "exception": exceptions.NotFound,
                "detail": "UserRelation not found.",
            },
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                data = {
                    "gift_date": "2022-08-24",
                    "description": "test_ticket",
                    "user_relation_id": condition["id"],
                }

                original_ticket_count = Ticket.objects.filter_eq_user_relation_id(
                    condition["id"]
                ).count()

                expected_exc_detail = f"CreateTicket_exception: {condition['detail']}"
                with self.assertRaisesRegex(
                    condition["exception"], expected_exc_detail
                ):
                    CreateTicket().execute(user=user, data=data)

                pro_execution_ticket_count = Ticket.objects.filter_eq_user_relation_id(
                    condition["id"]
                ).count()
                self.assertEqual(original_ticket_count, pro_execution_ticket_count)
