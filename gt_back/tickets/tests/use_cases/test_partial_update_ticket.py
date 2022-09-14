import inspect
import logging
from datetime import datetime
from typing import Tuple

from django.test import TestCase
from users.models import User
from rest_framework import exceptions
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import PartialUpdateTicket
from tickets.test_utils import factory


class TestPartialUpdateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_execute(self):
        user = self.seeds.users[1]
        unread_ticket, unread_ticket2, read_ticket = self._setup_tickets(user)

        cases = {
            "update_status": {
                "ticket": unread_ticket,
                "data": {"status": Ticket.STATUS_READ},
                "to_be": {
                    "description": unread_ticket.description,
                    "status": Ticket.STATUS_READ,
                },
            },
            "update_description_unread_ticket": {
                "ticket": unread_ticket2,
                "data": {"description": "updated description"},
                "to_be": {
                    "description": "updated description",
                    "status": Ticket.STATUS_UNREAD,
                },
            },
            "update_description_read_ticket": {
                "ticket": read_ticket,
                "data": {"description": "updated description"},
                "to_be": {
                    "description": "updated description",
                    "status": Ticket.STATUS_EDITED,
                },
            },
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                cm = self._execute_partial_update(
                    user, condition["ticket"], condition["data"]
                )

                self._assert_ticket(
                    condition["ticket"],
                    condition["to_be"]["description"],
                    condition["to_be"]["status"],
                )

                expected_log = [
                    "INFO:tickets.use_cases.partial_update_ticket:PartialUpdateTicket"
                ]
                self.assertEqual(expected_log, cm.output)

    def test_execute_case_error(self):
        user = self.seeds.users[1]

        tickets = self._setup_tickets_for_error_case(user)
        receiving_ticket, unrelated_ticket, non_existent_ticket = tickets

        cases = {
            "receiving_relation": {
                "ticket": receiving_ticket,
                "exception": exceptions.PermissionDenied,
                "exc_detail": "Only the giving user may update ticket.",
            },
            "unrelated_ticket": {
                "ticket": unrelated_ticket,
                "exception": exceptions.PermissionDenied,
                "exc_detail": "Only the giving user may update ticket.",
            },
            "non_existent_ticket": {
                "ticket": non_existent_ticket,
                "exception": exceptions.NotFound,
                "exc_detail": "Ticket not found.",
            },
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                self._execute_with_exception(user, **condition)

                if not case in ["non_existent_ticket"]:
                    self._assert_ticket_unchanged(condition["ticket"])

    """
    Utility Functions
    """

    def _setup_tickets(self, user: User) -> Tuple[Ticket, Ticket, Ticket]:
        giving_relation = user.giving_relations.first()

        params = {
            "unread_ticket": {
                "description": "test_description",
                "status": Ticket.STATUS_UNREAD,
            },
            "unread_ticket2": {
                "description": "test_description",
                "status": Ticket.STATUS_UNREAD,
            },
            "read_ticket": {
                "description": "test_description",
                "status": Ticket.STATUS_READ,
            },
        }
        tickets = factory.create_tickets(giving_relation, params.values())
        unread_ticket, unread_ticket2, read_ticket = tickets
        return (unread_ticket, unread_ticket2, read_ticket)

    def _setup_tickets_for_error_case(
        self, user: User
    ) -> Tuple[Ticket, Ticket, Ticket]:
        receiving_relation_id = user.receiving_relations.first().id
        receiving_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation_id
        ).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id
        ).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        return (receiving_ticket, unrelated_ticket, non_existent_ticket)

    def _execute_partial_update(self, user: User, ticket: Ticket, data: dict):
        class_name = "tickets.use_cases.partial_update_ticket"
        logger = logging.getLogger(class_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            PartialUpdateTicket().execute(user=user, data=data, ticket_id=ticket.id)

        return cm

    def _execute_with_exception(
        self, user: User, ticket: Ticket, exception: Exception, exc_detail: str
    ):
        data = {
            "description": "updated description",
        }
        expected_exc_detail = f"PartialUpdateTicket_exception: {exc_detail}"
        with self.assertRaisesRegex(exception, expected_exc_detail):
            PartialUpdateTicket().execute(user=user, data=data, ticket_id=ticket.id)

    def _assert_ticket(
        self,
        ticket: Ticket,
        description_to_be: str,
        status_to_be: str,
    ):
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()

        self.assertEqual(description_to_be, ticket.description)
        self.assertEqual(status_to_be, ticket.status)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def _assert_ticket_unchanged(self, ticket: Ticket):
        original_description = ticket.description
        ticket.refresh_from_db()
        self.assertEqual(original_description, ticket.description)
