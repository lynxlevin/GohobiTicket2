import logging
from typing import Tuple

from django.test import TestCase
from users.models import User
from rest_framework import exceptions
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import PartialUpdateTicket
from tickets.test_utils import factory


class TestPartialUpdateTicketClean(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_execute_update_status(self):
        user, ticket = self._given_unread_ticket()

        cm = self._when_user_reads_ticket(user, ticket)

        self._then_ticket_should_be(ticket, status=Ticket.STATUS_READ)
        self._then_info_log_should_be_output(cm.output)

    def test_execute_update_unread_ticket_description(self):
        user, ticket = self._given_unread_ticket()

        cm = self._when_user_edits_ticket_description(
            user, ticket, description="edited_description"
        )

        self._then_ticket_should_be(
            ticket,
            status=Ticket.STATUS_UNREAD,
            description="edited_description",
        )
        self._then_info_log_should_be_output(cm.output)

    def test_execute_update_read_ticket_description(self):
        user, ticket = self._given_read_ticket()

        cm = self._when_user_edits_ticket_description(
            user, ticket, description="edited_description"
        )

        self._then_ticket_should_be(
            ticket,
            status=Ticket.STATUS_EDITED,
            description="edited_description",
        )
        self._then_info_log_should_be_output(cm.output)

    def test_execute_error_updating_receiving_ticket(self):
        user, ticket = self._given_receiving_ticket()

        self._when_updated_should_raise_exception(
            user,
            ticket,
            exception=exceptions.PermissionDenied,
            exc_detail="PartialUpdateTicket_exception: Only the giving user may update ticket.",
        )
        self._then_ticket_should_not_be_updated(ticket)

    def test_execute_error_updating_unrelated_ticket(self):
        user, ticket = self._given_unrelated_ticket()

        self._when_updated_should_raise_exception(
            user,
            ticket,
            exception=exceptions.PermissionDenied,
            exc_detail="PartialUpdateTicket_exception: Only the giving user may update ticket.",
        )
        self._then_ticket_should_not_be_updated(ticket)

    def test_execute_error_updating_non_existent_ticket(self):
        user, ticket = self._given_non_existent_ticket()

        self._when_updated_should_raise_exception(
            user,
            ticket,
            exception=exceptions.NotFound,
            exc_detail="PartialUpdateTicket_exception: Ticket not found.",
        )

    """
    Utility Functions
    """

    def _given_unread_ticket(self) -> Tuple[User, Ticket]:
        return self._given_ticket(Ticket.STATUS_UNREAD)

    def _given_read_ticket(self) -> Tuple[User, Ticket]:
        return self._given_ticket(Ticket.STATUS_READ)

    def _given_ticket(self, status: str) -> Tuple[User, Ticket]:
        user: User = self.seeds.users[1]
        giving_relation = user.giving_relations.first()

        ticket_param = {
            "description": "test_description",
            "status": status,
        }
        ticket: Ticket = factory.create_ticket(giving_relation, ticket_param)

        return (user, ticket)

    def _given_receiving_ticket(self) -> Tuple[User, Ticket]:
        user: User = self.seeds.users[1]
        receiving_relation = user.receiving_relations.first()
        receiving_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation.id
        ).first()

        return (user, receiving_ticket)

    def _given_unrelated_ticket(self) -> Tuple[User, Ticket]:
        user: User = self.seeds.users[1]
        unrelated_relation = self.seeds.user_relations[2]
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation.id
        ).first()

        return (user, unrelated_ticket)

    def _given_non_existent_ticket(self) -> Tuple[User, Ticket]:
        user: User = self.seeds.users[1]
        non_existent_ticket = Ticket(id="-1", description="not_saved")
        return (user, non_existent_ticket)

    def _when_user_reads_ticket(self, user: User, ticket: Ticket):
        return self._execute_webhook(user, ticket, {"status": Ticket.STATUS_READ})

    def _when_user_edits_ticket_description(
        self, user: User, ticket: Ticket, description: str
    ):
        return self._execute_webhook(user, ticket, {"description": description})

    def _execute_webhook(self, user: User, ticket: Ticket, data: dict):
        class_name = "tickets.use_cases.partial_update_ticket"
        logger = logging.getLogger(class_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            PartialUpdateTicket().execute(
                user=user,
                data=data,
                ticket_id=ticket.id,
            )

        return cm

    def _when_updated_should_raise_exception(
        self, user: User, ticket: Ticket, exception: Exception, exc_detail: str
    ):
        data = {"description": "updated description"}
        with self.assertRaisesRegex(exception, exc_detail):
            PartialUpdateTicket().execute(user=user, data=data, ticket_id=ticket.id)

    def _then_ticket_should_be(
        self, ticket: Ticket, status: str, description: str = ""
    ):
        original_updated_at = ticket.updated_at
        ticket.refresh_from_db()
        self.assertNotEqual(original_updated_at, ticket.updated_at)
        self.assertEqual(status, ticket.status)
        if description:
            self.assertEqual(description, ticket.description)

    def _then_ticket_should_not_be_updated(self, ticket: Ticket):
        original_description = ticket.description
        original_status = ticket.status
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()
        self.assertEqual(original_description, ticket.description)
        self.assertEqual(original_status, ticket.status)
        self.assertEqual(original_updated_at, ticket.updated_at)

    def _then_info_log_should_be_output(self, cm_output):
        class_name = "tickets.use_cases.partial_update_ticket"
        expected_log = [f"INFO:{class_name}:PartialUpdateTicket"]
        self.assertEqual(expected_log, cm_output)
