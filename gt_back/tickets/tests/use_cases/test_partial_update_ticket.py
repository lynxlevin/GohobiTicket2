from datetime import datetime
import logging

from django.test import TestCase
from rest_framework import exceptions

from tickets.models import Ticket
from tickets.use_cases import PartialUpdateTicket
from tickets.test_utils.test_seeds import TestSeed


class TestPartialUpdateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_execute(self):
        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation.id).first()
        original_updated_at = ticket.updated_at

        data = {
            "description": "updated description",
        }

        class_name = "tickets.use_cases.partial_update_ticket"
        logger = logging.getLogger(class_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            PartialUpdateTicket().execute(user=user, data=data, ticket_id=ticket.id)

        self._make_assertions(data, ticket.id, original_updated_at)

        expected_log = [f"INFO:{class_name}:PartialUpdateTicket"]
        self.assertEqual(expected_log, cm.output)

    def _make_assertions(self, data: dict, ticket_id: int, original_updated_at: datetime):
        ticket = Ticket.objects.get_by_id(ticket_id)
        self.assertEqual(data["description"], ticket.description)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

    def test_execute_case_error(self):
        user = self.seeds.users[1]

        receiving_relation_id = user.receiving_relations.first().id
        receiving_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation_id).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        cases = {
            "receiving_relation": {"ticket": receiving_ticket, "exception": exceptions.PermissionDenied, "detail": "Only the giving user may update ticket."},
            "unrelated_ticket": {"ticket": unrelated_ticket, "exception": exceptions.PermissionDenied, "detail": "Only the giving user may update ticket."},
            "non_existent_ticket": {"ticket": non_existent_ticket, "exception": exceptions.NotFound, "detail": "Ticket not found."},
        }

        data = {
            "description": "updated description",
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                expected_exc_detail = f"PartialUpdateTicket_exception: {condition['detail']}"
                with self.assertRaisesRegex(condition["exception"], expected_exc_detail):
                    PartialUpdateTicket().execute(user=user, data=data,
                                                  ticket_id=condition["ticket"].id)

                if not case in ["non_existent_ticket"]:
                    condition["ticket"].refresh_from_db()
                    self.assertNotEqual(
                        data["description"], condition["ticket"].description)
