import logging

from django.test import TestCase
from rest_framework.exceptions import NotFound, PermissionDenied
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.models import Ticket
from tickets.use_cases import DestroyTicket

from ..ticket_factory import TicketFactory, UsedTicketFactory


class TestDestroyTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.use_case_name = "tickets.use_cases.destroy_ticket"

        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_destroy(self):
        giving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)

        cm = self._when_user_deletes_ticket(giving_ticket)

        self._then_ticket_is_deleted(giving_ticket.id)
        expected_log = [f"INFO:{self.use_case_name}:DestroyTicket"]
        self.assertEqual(expected_log, cm.output)

    def test_delete_error__bad_ticket(self):
        with self.subTest(case="receiving_ticket"):
            receiving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)

            self._when_deleted_should_raise_exception(
                receiving_ticket,
                exception=PermissionDenied,
                exception_message="Only the giving user may delete ticket.",
            )

            self._then_ticket_is_not_deleted(receiving_ticket.id)

        with self.subTest(case="un_related_ticket"):
            un_related_ticket = TicketFactory()

            self._when_deleted_should_raise_exception(
                un_related_ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

        with self.subTest(case="non_existent_ticket"):
            non_existent_ticket = Ticket(id="-1", description="not_saved")

            self._when_deleted_should_raise_exception(
                non_existent_ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

        with self.subTest(case="used_ticket"):
            used_ticket = UsedTicketFactory(user_relation=self.relation, giving_user=self.user)

            self._when_deleted_should_raise_exception(
                used_ticket,
                exception=PermissionDenied,
                exception_message="Used ticket cannot be deleted.",
            )

            self._then_ticket_is_not_deleted(used_ticket.id)

    """
    Util Functions
    """

    def _when_user_deletes_ticket(self, ticket: Ticket):
        logger = logging.getLogger(self.use_case_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            DestroyTicket().execute(ticket_id=ticket.id, user=self.user)

        return cm

    def _when_deleted_should_raise_exception(self, ticket: Ticket, exception: Exception, exception_message: str):
        expected_exc_detail = f"DestroyTicket_exception: {exception_message}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            DestroyTicket().execute(ticket_id=ticket.id, user=self.user)

    def _then_ticket_is_deleted(self, ticket_id: int):
        self.assertIsNone(Ticket.objects.get_by_id(ticket_id))

    def _then_ticket_is_not_deleted(self, ticket_id: int):
        self.assertIsNotNone(Ticket.objects.get_by_id(ticket_id))
