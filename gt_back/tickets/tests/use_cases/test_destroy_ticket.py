import logging
from datetime import date
from typing import Tuple

from django.test import TestCase
from rest_framework.exceptions import PermissionDenied, NotFound
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import DestroyTicket
from users.models import User


class TestDestroyTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()
        cls.use_case_name = "tickets.use_cases.destroy_ticket"

    def test_destroy(self):
        user, giving_ticket = self._given_ticket()

        cm = self._when_user_deletes_ticket(user, giving_ticket)

        self._then_ticket_is_deleted(giving_ticket.id)
        self._then_info_log_is_output(cm.output)

    def test_delete_error__bad_ticket(self):
        with self.subTest(case="receiving_ticket"):
            user, receiving_ticket = self._given_bad_ticket("receiving_ticket")

            self._when_deleted_should_raise_exception(
                user,
                receiving_ticket,
                exception=PermissionDenied,
                exception_message="Only the giving user may delete ticket.",
            )

            self._then_ticket_is_not_deleted(receiving_ticket.id)

        with self.subTest(case="unrelated_ticket"):
            user, unrelated_ticket = self._given_bad_ticket("unrelated_ticket")

            self._when_deleted_should_raise_exception(
                user,
                unrelated_ticket,
                exception=PermissionDenied,
                exception_message="Only the giving user may delete ticket.",
            )

            self._then_ticket_is_not_deleted(unrelated_ticket.id)

        with self.subTest(case="non_existent_ticket"):
            user, non_existent_ticket = self._given_bad_ticket("non_existent_ticket")

            self._when_deleted_should_raise_exception(
                user,
                non_existent_ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

        with self.subTest(case="used_ticket"):
            user, used_ticket = self._given_bad_ticket("used_ticket")

            self._when_deleted_should_raise_exception(
                user,
                used_ticket,
                exception=PermissionDenied,
                exception_message="Used ticket cannot be deleted.",
            )

            self._then_ticket_is_not_deleted(used_ticket.id)

    """
    Util Functions
    """

    def _given_ticket(self) -> Tuple[User, Ticket]:
        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        giving_ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation.id
        ).first()

        return (user, giving_ticket)

    def _given_bad_ticket(self, case: str) -> Tuple[User, Ticket]:
        user = self.seeds.users[1]

        if case == "receiving_ticket":
            receiving_relation = user.receiving_relations.first()
            ticket = Ticket.objects.filter_eq_user_relation_id(
                receiving_relation.id
            ).first()
        elif case == "unrelated_ticket":
            unrelated_relation = self.seeds.user_relations[2]
            ticket = Ticket.objects.filter_eq_user_relation_id(
                unrelated_relation.id
            ).first()
        elif case == "non_existent_ticket":
            ticket = Ticket(id="-1", description="not_saved")
        elif case == "used_ticket":
            giving_relation_id = user.giving_relations.first().id
            ticket = Ticket.objects.filter_eq_user_relation_id(
                giving_relation_id
            ).first()
            ticket.use_date = date.today()
            ticket.save()

        return (user, ticket)

    def _when_user_deletes_ticket(self, user: User, ticket: Ticket):
        logger = logging.getLogger(self.use_case_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            DestroyTicket().execute(ticket_id=ticket.id, user=user)

        return cm

    def _when_deleted_should_raise_exception(
        self, user: User, ticket: Ticket, exception: Exception, exception_message: str
    ):
        expected_exc_detail = f"DestroyTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            DestroyTicket().execute(ticket_id=ticket.id, user=user)

    def _then_ticket_is_deleted(self, ticket_id: int):
        self.assertIsNone(Ticket.objects.get_by_id(ticket_id))

    def _then_ticket_is_not_deleted(self, ticket_id: int):
        self.assertIsNotNone(Ticket.objects.get_by_id(ticket_id))

    def _then_info_log_is_output(self, cm_output: list[str]):
        expected_log = [f"INFO:{self.use_case_name}:DestroyTicket"]
        self.assertEqual(expected_log, cm_output)
