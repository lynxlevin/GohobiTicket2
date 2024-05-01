from datetime import date

from django.test import TestCase
from tickets.enums import TicketStatus
from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestTicketModel(TestCase):
    def test_filter_eq_user_relation_id(self):
        user_relation = UserRelationFactory()
        expected_tickets = TicketFactory.create_batch(5, user_relation=user_relation)
        _another_relation_ticket = TicketFactory()

        result = Ticket.objects.filter_eq_user_relation_id(user_relation.id).all()

        self.assertEqual(expected_tickets, list(result))

    def test_filter_unused_tickets(self):
        expected_tickets = [
            TicketFactory(gift_date=date(2022, 1, 4)),
            TicketFactory(gift_date=date(2022, 1, 3)),
            TicketFactory(gift_date=date(2022, 1, 2)),
            TicketFactory(gift_date=date(2022, 1, 1)),
        ]
        _used_ticket = UsedTicketFactory()

        result = Ticket.objects.filter_unused_tickets().all()

        self.assertEqual(expected_tickets, list(result))

    def test_filter_used_tickets(self):
        expected_tickets = [
            TicketFactory(use_date=date(2022, 1, 4)),
            TicketFactory(use_date=date(2022, 1, 3)),
            TicketFactory(use_date=date(2022, 1, 2)),
            TicketFactory(use_date=date(2022, 1, 1)),
        ]
        _unused_ticket = TicketFactory()

        result = Ticket.objects.filter_used_tickets().all()

        self.assertEqual(expected_tickets, list(result))

    def test_filter_special_tickets(self):
        target_date = date(2022, 6, 11)

        expected_tickets = [TicketFactory(gift_date=date(2022, 6, 1), is_special=True)]
        _other_tickets = [
            TicketFactory(gift_date=date(2022, 6, 11)),
            *TicketFactory.create_batch(3),
        ]

        result = Ticket.objects.filter_special_tickets(target_date)

        self.assertEqual(expected_tickets, list(result.all()))

    def test_exclude_eq_status(self):
        exclude_target = TicketStatus.STATUS_DRAFT.value
        _excluded_tickets = TicketFactory.create_batch(5, status=exclude_target)
        expected_tickets = [
            TicketFactory(status=TicketStatus.STATUS_READ.value),
            TicketFactory(status=TicketStatus.STATUS_UNREAD.value),
            TicketFactory(status=TicketStatus.STATUS_EDITED.value),
        ]

        result = Ticket.objects.exclude_eq_status(exclude_target).all()

        self.assertEqual(expected_tickets, list(result))

    def test_receiving_user(self):
        giving_user = UserFactory()
        receiving_user = UserFactory()
        relation = UserRelationFactory(user_1=giving_user, user_2=receiving_user)
        ticket = TicketFactory(user_relation=relation, giving_user=giving_user)

        result = ticket.receiving_user

        self.assertEqual(receiving_user.id, result.id)
