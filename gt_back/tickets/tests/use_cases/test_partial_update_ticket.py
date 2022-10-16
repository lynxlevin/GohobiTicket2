import logging

from django.test import TestCase
from users.models import User
from rest_framework.exceptions import PermissionDenied, NotFound
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import PartialUpdateTicket
from tickets.test_utils import factory


class TestPartialUpdateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()
        cls.use_case_name = "tickets.use_cases.partial_update_ticket"
        cls.user = cls.seeds.users[1]

    def test_update_status(self):
        with self.subTest(case="unread_to_read"):
            ticket = self._given_ticket(Ticket.STATUS_UNREAD)
            cm = self._when_user_updates_ticket_status(ticket, Ticket.STATUS_READ)

            self._then_ticket_should_be(ticket, Ticket.STATUS_READ)
            self._then_info_log_is_output(cm.output)

        with self.subTest(case="draft_to_unread"):
            ticket = self._given_ticket(Ticket.STATUS_DRAFT)
            cm = self._when_user_updates_ticket_status(ticket, Ticket.STATUS_UNREAD)

            self._then_ticket_should_be(ticket, Ticket.STATUS_UNREAD)
            self._then_info_log_is_output(cm.output)

    def test_update_description(self):
        with self.subTest(case="unread_ticket"):
            ticket = self._given_ticket(Ticket.STATUS_UNREAD)
            cm = self._when_user_updates_ticket_description(ticket)
            self._then_ticket_should_be(
                ticket,
                status=Ticket.STATUS_UNREAD,
                description="edited_description",
            )
            self._then_info_log_is_output(cm.output)

        with self.subTest(case="read_ticket"):
            ticket = self._given_ticket(Ticket.STATUS_READ)
            cm = self._when_user_updates_ticket_description(ticket)
            self._then_ticket_should_be(
                ticket,
                status=Ticket.STATUS_EDITED,
                description="edited_description",
            )
            self._then_info_log_is_output(cm.output)

    def test_update_error__bad_ticket(self):
        with self.subTest(case="receiving_ticket"):
            ticket = self._given_bad_ticket("receiving_ticket")

            self._when_updated_should_raise_exception(
                ticket,
                exception=PermissionDenied,
                exception_message="Only the giving user may update ticket.",
            )

            self._then_ticket_is_not_updated(ticket)

        with self.subTest(case="unrelated_ticket"):
            ticket = self._given_bad_ticket("unrelated_ticket")

            self._when_updated_should_raise_exception(
                ticket,
                exception=PermissionDenied,
                exception_message="Only the giving user may update ticket.",
            )

            self._then_ticket_is_not_updated(ticket)

        with self.subTest(case="non_existent_ticket"):
            ticket = self._given_bad_ticket("non_existent_ticket")

            self._when_updated_should_raise_exception(
                ticket,
                exception=NotFound,
                exception_message="Ticket not found.",
            )

    def test_update_status_error(self):
        with self.subTest(case="to_draft"):
            ticket = self._given_ticket(Ticket.STATUS_UNREAD)

            self._when_updated_to_draft_should_raise_exception(
                ticket,
                exception=PermissionDenied,
                exception_message="Tickets cannot be updated to draft.",
            )
            self._then_ticket_is_not_updated(ticket)

        with self.subTest(case="to_unread"):
            ticket = self._given_ticket(Ticket.STATUS_READ)

            self._when_updated_to_unread_should_raise_exception(
                ticket,
                exception=PermissionDenied,
                exception_message="Only draft tickets can be updated to unread.",
            )
            self._then_ticket_is_not_updated(ticket)

    """
    Utility Functions
    """

    def _given_ticket(self, status: str) -> Ticket:
        giving_relation = self.user.giving_relations.first()

        ticket_param = {
            "description": "test_description",
            "status": status,
        }
        ticket: Ticket = factory.create_ticket(giving_relation, ticket_param)

        return ticket

    def _given_bad_ticket(self, case: str) -> Ticket:
        if case == "receiving_ticket":
            receiving_relation = self.user.receiving_relations.first()
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

        return ticket

    def _when_user_updates_ticket_status(self, ticket: Ticket, status: str):
        return self._execute_use_case(self.user, ticket, {"status": status})

    def _when_user_updates_ticket_description(self, ticket: Ticket):
        return self._execute_use_case(
            self.user, ticket, {"description": "edited_description"}
        )

    def _execute_use_case(self, user: User, ticket: Ticket, data: dict):
        logger = logging.getLogger(self.use_case_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            PartialUpdateTicket().execute(
                user=user,
                data=data,
                ticket_id=ticket.id,
            )

        return cm

    def _when_updated_should_raise_exception(
        self, ticket: Ticket, exception: Exception, exception_message: str
    ):
        data = {"description": "updated description"}
        self._execute_use_case_raise_exception(
            self.user, ticket, data, exception, exception_message
        )

    def _when_updated_to_draft_should_raise_exception(
        self, ticket: Ticket, exception: Exception, exception_message: str
    ):
        data = {"status": Ticket.STATUS_DRAFT}
        self._execute_use_case_raise_exception(
            self.user, ticket, data, exception, exception_message
        )

    def _when_updated_to_unread_should_raise_exception(
        self, ticket: Ticket, exception: Exception, exception_message: str
    ):
        data = {"status": Ticket.STATUS_UNREAD}
        self._execute_use_case_raise_exception(
            self.user, ticket, data, exception, exception_message
        )

    def _execute_use_case_raise_exception(
        self,
        user: User,
        ticket: Ticket,
        data: dict,
        exception: Exception,
        exception_message: str,
    ):
        exc_detail = f"PartialUpdateTicket_exception: {exception_message}"
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

    def _then_ticket_is_not_updated(self, ticket: Ticket):
        original_description = ticket.description
        original_status = ticket.status
        original_updated_at = ticket.updated_at

        ticket.refresh_from_db()
        self.assertEqual(original_description, ticket.description)
        self.assertEqual(original_status, ticket.status)
        self.assertEqual(original_updated_at, ticket.updated_at)

    def _then_info_log_is_output(self, cm_output):
        expected_log = [f"INFO:{self.use_case_name}:PartialUpdateTicket"]
        self.assertEqual(expected_log, cm_output)
