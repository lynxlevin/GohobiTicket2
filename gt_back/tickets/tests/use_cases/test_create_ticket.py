import logging
from datetime import datetime

from django.test import TestCase
from rest_framework import exceptions
from tickets.models import Ticket
from tickets.use_cases import CreateTicket
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.models import User
from users.tests.user_factory import UserFactory


class TestCreateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.use_case_name = "tickets.use_cases.create_ticket"

        cls.user = UserFactory()
        cls.giving_relation_id = UserRelationFactory(giving_user=cls.user).id
        cls.receiving_relation_id = UserRelationFactory(receiving_user=cls.user).id
        cls.unrelated_relation_id = UserRelationFactory().id
        cls.non_existent_relation_id = -1

    def test_create_ticket(self):
        with self.subTest(case="normal_ticket"):
            cm, created_ticket = self._when_user_creates_ticket()

            self._then_ticket_is_created(created_ticket.id)
            self._then_info_log_is_output(cm.output)

        with self.subTest(case="draft_ticket"):
            cm, created_ticket = self._when_user_creates_draft_ticket()

            self._then_draft_ticket_is_created(created_ticket.id)
            self._then_info_log_is_output(cm.output)

    def test_execute_error_bad_relation(self):
        with self.subTest(case="receiving_relation"):
            self._when_created_should_raise_exception(
                self.receiving_relation_id,
                exception=exceptions.PermissionDenied,
                exception_message="Only the giving user may create ticket.",
            )
            self._then_ticket_is_not_created()

        with self.subTest(case="unrelated_relation"):
            self._when_created_should_raise_exception(
                self.unrelated_relation_id,
                exception=exceptions.PermissionDenied,
                exception_message="Only the giving user may create ticket.",
            )
            self._then_ticket_is_not_created()

        with self.subTest(case="non_existent_relation"):
            self._when_created_should_raise_exception(
                self.non_existent_relation_id,
                exception=exceptions.NotFound,
                exception_message="UserRelation not found.",
            )
            self._then_ticket_is_not_created()

    """
    Utility Functions
    """

    def _when_user_creates_ticket(self):
        data = {
            "gift_date": "2022-08-24",
            "description": "test_ticket",
            "user_relation_id": self.giving_relation_id,
        }

        cm, created_ticket = self._execute_create_ticket(self.user, data)

        return (cm, created_ticket)

    def _when_user_creates_draft_ticket(self):
        data = {
            "gift_date": "2022-08-24",
            "description": "test_ticket",
            "user_relation_id": self.giving_relation_id,
            "status": Ticket.STATUS_DRAFT,
        }

        cm, created_ticket = self._execute_create_ticket(self.user, data)

        return (cm, created_ticket)

    def _execute_create_ticket(self, user: User, data: dict):
        logger = logging.getLogger(self.use_case_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            created_ticket = CreateTicket().execute(user=user, data=data)

        return (cm, created_ticket)

    def _when_created_should_raise_exception(
        self,
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
            CreateTicket().execute(user=self.user, data=data)

    def _then_ticket_is_created(self, created_ticket_id: int, giving_relation_id=None):
        expected_relation_id = (
            giving_relation_id if giving_relation_id else self.giving_relation_id
        )
        created_ticket = Ticket.objects.get_by_id(created_ticket_id)
        self.assertIsNotNone(created_ticket)

        expected_ticket = {
            "description": "test_ticket",
            "user_relation_id": expected_relation_id,
            "gift_date": datetime.strptime("2022-08-24", "%Y-%m-%d").date(),
            "use_description": "",
            "use_date": None,
            "status": Ticket.STATUS_UNREAD,
            "is_special": False,
        }

        self.assertDictContainsSubset(expected_ticket, created_ticket.__dict__)

    def _then_draft_ticket_is_created(self, created_ticket_id: int):
        created_ticket = Ticket.objects.get_by_id(created_ticket_id)
        self.assertIsNotNone(created_ticket)

        expected_ticket = {
            "description": "test_ticket",
            "user_relation_id": self.giving_relation_id,
            "gift_date": datetime.strptime("2022-08-24", "%Y-%m-%d").date(),
            "use_description": "",
            "use_date": None,
            "status": Ticket.STATUS_DRAFT,
            "is_special": False,
        }

        self.assertDictContainsSubset(expected_ticket, created_ticket.__dict__)

    def _then_ticket_is_not_created(self):
        error_ticket_count = Ticket.objects.filter(
            description="test_ticket_to_raise_exception"
        ).count()
        self.assertEqual(0, error_ticket_count)

    def _then_info_log_is_output(self, cm_output):
        expected_log = [f"INFO:{self.use_case_name}:CreateTicket"]
        self.assertEqual(expected_log, cm_output)
        self.assertEqual(expected_log, cm_output)
