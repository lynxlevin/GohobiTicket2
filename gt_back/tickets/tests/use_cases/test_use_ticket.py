import logging
from datetime import date, datetime
from unittest import mock

from django.test import TestCase
from rest_framework import exceptions
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed
from tickets.use_cases import UseTicket
from tickets.utils import SlackMessengerForUseTicket


class TestUseTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    @mock.patch.object(SlackMessengerForUseTicket, "__new__")
    def test_execute(self, slack_mock):
        user = self.seeds.users[1]
        receiving_relation = user.receiving_relations.first()
        normal_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation.id).filter(use_date__isnull=True, is_special=False).first()

        special_ticket = Ticket.objects.filter_eq_user_relation_id(
            receiving_relation.id).filter(use_date__isnull=True, is_special=True).first()

        data = {
            "use_description": "test_use_ticket",
        }

        cases = {
            "normal_ticket": {"ticket": normal_ticket},
            "special_ticket": {"ticket": special_ticket},
        }

        class_name = "tickets.use_cases.use_ticket"
        logger = logging.getLogger(class_name)

        for case, condition in cases.items():
            with self.subTest(case=case):
                slack_instance_mock = mock.Mock()
                slack_mock.return_value = slack_instance_mock

                ticket = condition["ticket"]

                original_updated_at = ticket.updated_at

                with self.assertLogs(logger=logger, level=logging.INFO) as cm:
                    UseTicket().execute(user=user, data=data, ticket_id=str(ticket.id))

                self._make_assertions(
                    data, ticket.id, original_updated_at, slack_instance_mock)

                expected_log = [f"INFO:{class_name}:UseTicket"]
                self.assertEqual(expected_log, cm.output)

    def _make_assertions(self, data: dict, ticket_id: int, original_updated_at: datetime, slack_instance_mock):
        ticket = Ticket.objects.get_by_id(ticket_id)

        self.assertEqual(date.today(), ticket.use_date)
        self.assertEqual(data["use_description"], ticket.use_description)
        self.assertNotEqual(original_updated_at, ticket.updated_at)

        slack_instance_mock.generate_message.assert_called_once_with(ticket)
        slack_instance_mock.send_message.assert_called_once()

    def test_execute_case_error(self):
        user = self.seeds.users[1]

        data = {"use_description": "test_use_case_error"}

        giving_relation_id = user.giving_relations.first().id
        giving_ticket = Ticket.objects.filter_eq_user_relation_id(
            giving_relation_id).first()

        unrelated_relation_id = self.seeds.user_relations[2].id
        unrelated_ticket = Ticket.objects.filter_eq_user_relation_id(
            unrelated_relation_id).first()

        non_existent_ticket = Ticket(id="-1", description="not_saved")

        receiving_relation = user.receiving_relations.first()
        used_ticket = Ticket(description="used_ticket", user_relation=receiving_relation,
                             gift_date=date.today(), use_date=date.today())
        used_ticket.save()

        cases = {
            "giving_relation": {"ticket": giving_ticket, "exception": exceptions.PermissionDenied, "detail": "Only the receiving user may use ticket."},
            "unrelated_relation": {"ticket": unrelated_ticket, "exception": exceptions.PermissionDenied, "detail": "Only the receiving user may use ticket."},
            "non_existent_ticket": {"ticket": non_existent_ticket, "exception": exceptions.NotFound, "detail": "Ticket not found."},
            "used_ticket": {"ticket": used_ticket, "exception": exceptions.PermissionDenied, "detail": "This ticket is already used"},
        }

        for case, condition in cases.items():
            with self.subTest(case):
                expected_exc_detail = f"UseTicket_exception: {condition['detail']}"
                with self.assertRaisesRegex(condition["exception"], expected_exc_detail):
                    UseTicket().execute(user=user, data=data,
                                        ticket_id=str(condition["ticket"].id))

                if not case in ["non_existent_ticket", "used_ticket"]:
                    condition["ticket"].refresh_from_db()
                    self.assertIsNone(condition["ticket"].use_date)
                    self.assertEqual("", condition["ticket"].use_description)
