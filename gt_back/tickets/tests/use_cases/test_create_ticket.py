import logging
from datetime import datetime
from typing import Tuple

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

    def test_execute_create_ticket(self):
        user, giving_relation_id = self._given_user_and_relation_id("giving_relation")

        cm, created_ticket = self._when_user_creates_ticket(user, giving_relation_id)

        self._then_ticket_should_be_created(created_ticket.id, giving_relation_id)
        self._then_info_log_should_be_output(cm.output)

    def test_execute_error_case_receiving_relation(self):
        user, receiving_relation_id = self._given_user_and_relation_id(
            "receiving_relation"
        )

        self._when_created_should_raise_exception(
            user,
            receiving_relation_id,
            exception=exceptions.PermissionDenied,
            exception_message="Only the giving user may create ticket.",
        )
        self._then_ticket_should_not_be_created()

    def test_execute_error_case_unrelated_relation(self):
        user, unrelated_relation_id = self._given_user_and_relation_id(
            "unrelated_relation"
        )

        self._when_created_should_raise_exception(
            user,
            unrelated_relation_id,
            exception=exceptions.PermissionDenied,
            exception_message="Only the giving user may create ticket.",
        )
        self._then_ticket_should_not_be_created()

    def test_execute_error_case_non_existent_relation(self):
        user, non_existent_relation_id = self._given_user_and_relation_id(
            "non_existent_relation"
        )

        self._when_created_should_raise_exception(
            user,
            non_existent_relation_id,
            exception=exceptions.NotFound,
            exception_message="UserRelation not found.",
        )
        self._then_ticket_should_not_be_created()

    """
    Utility Functions
    """

    def _given_user_and_relation_id(self, relation_type: str) -> Tuple[User, int]:
        user = self.seeds.users[1]

        user_relation_ids = {
            "giving_relation": user.giving_relations.first().id,
            "receiving_relation": user.receiving_relations.first().id,
            "unrelated_relation": self.seeds.user_relations[2].id,
            "non_existent_relation": -1,
        }

        return (user, user_relation_ids[relation_type])

    def _when_user_creates_ticket(self, user: User, giving_relation_id: int):
        data = {
            "gift_date": "2022-08-24",
            "description": "test_ticket",
            "user_relation_id": giving_relation_id,
        }

        class_name = "tickets.use_cases.create_ticket"
        logger = logging.getLogger(class_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            created_ticket = CreateTicket().execute(user=user, data=data)

        return (cm, created_ticket)

    def _when_created_should_raise_exception(
        self,
        user: User,
        user_relation_id: int,
        exception: Exception,
        exception_message: str,
    ):
        data = {
            "gift_date": "2022-08-24",
            "description": "test_ticket_to_raise_exception",
            "user_relation_id": user_relation_id,
        }

        expected_exc_detail = f"CreateTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            CreateTicket().execute(user=user, data=data)

    def _then_ticket_should_be_created(
        self, created_ticket_id: int, giving_relation_id: int
    ):
        created_ticket = Ticket.objects.get_by_id(created_ticket_id)
        self.assertIsNotNone(created_ticket)

        expected_ticket = {
            "description": "test_ticket",
            "user_relation_id": giving_relation_id,
            "gift_date": datetime.strptime("2022-08-24", "%Y-%m-%d").date(),
            "use_description": "",
            "use_date": None,
            "status": Ticket.STATUS_UNREAD,
            "is_special": False,
        }

        for key, value in expected_ticket.items():
            self.assertEqual(getattr(created_ticket, key), value)

    def _then_ticket_should_not_be_created(self):
        error_ticket_count = Ticket.objects.filter(
            description="test_ticket_to_raise_exception"
        ).count()
        self.assertEqual(0, error_ticket_count)

    def _then_info_log_should_be_output(self, cm_output):
        class_name = "tickets.use_cases.create_ticket"
        expected_log = [f"INFO:{class_name}:CreateTicket"]
        self.assertEqual(expected_log, cm_output)
