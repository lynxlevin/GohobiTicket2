import logging
from datetime import date

from django.test import TestCase
from rest_framework import exceptions
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import DestroyTicket


class TestDestroyTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_execute(self):
        user = self.seeds.users[1]
        giving_relation = user.giving_relations.first()
        ticket = Ticket.objects.filter_eq_user_relation_id(giving_relation.id).first()

        class_name = "tickets.use_cases.destroy_ticket"
        logger = logging.getLogger(class_name)

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            DestroyTicket().execute(ticket_id=ticket.id, user=user)

        self._make_assertions(ticket.id)

        expected_log = [f"INFO:{class_name}:DestroyTicket"]
        self.assertEqual(expected_log, cm.output)

    def _make_assertions(self, ticket_id: int):
        self.assertIsNone(Ticket.objects.get_by_id(ticket_id))

    def test_execute_case_error(self):
        user = self.seeds.users[1]

        receiving_relation_id = user.receiving_relations.first().id
        receiving_ticket_id = (
            Ticket.objects.filter_eq_user_relation_id(receiving_relation_id).first().id
        )

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket_id = (
            Ticket.objects.filter_eq_user_relation_id(unrelated_relation_id).first().id
        )

        giving_relation_id = user.giving_relations.first().id
        used_ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation_id
        ).first()
        used_ticket.use_date = date.today()
        used_ticket.save()

        cases = {
            "receiving_relation": {
                "ticket_id": receiving_ticket_id,
                "exception": exceptions.PermissionDenied,
                "detail": "Only the giving user may delete ticket.",
            },
            "unrelated_relation": {
                "ticket_id": unrelated_ticket_id,
                "exception": exceptions.PermissionDenied,
                "detail": "Only the giving user may delete ticket.",
            },
            "non_existent_ticket": {
                "ticket_id": "-1",
                "exception": exceptions.NotFound,
                "detail": "Ticket not found.",
            },
            "used_ticket": {
                "ticket_id": used_ticket.id,
                "exception": exceptions.PermissionDenied,
                "detail": "Used ticket cannot be deleted.",
            },
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                expected_exc_detail = f"DestroyTicket_exception: {condition['detail']}"
                with self.assertRaisesRegex(
                    condition["exception"], expected_exc_detail
                ):
                    DestroyTicket().execute(ticket_id=condition["ticket_id"], user=user)

                if not case in ["non_existent_ticket"]:
                    self.assertIsNotNone(
                        Ticket.objects.get_by_id(condition["ticket_id"])
                    )
