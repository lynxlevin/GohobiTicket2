from datetime import date

from django.test import TestCase
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TestTicketModel(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_filter_eq_user_relation_id(self):
        user_relation_id = self.seeds.user_relations[0].id
        tickets = self.seeds.tickets

        result = Ticket.objects.filter_eq_user_relation_id(user_relation_id)
        expected = tickets[0:16]

        self.assertEqual(list(result.all()), expected)

    def test_filter_unused_tickets(self):
        tickets = self.seeds.tickets

        result = Ticket.objects.filter_unused_tickets()

        list1 = tickets[0:4]
        list2 = tickets[8:12]
        list3 = tickets[16:22]
        list4 = tickets[22:23]
        expected = list(reversed(list1 + list2 + list3 + list4))

        self.assertEqual(list(result.all()), expected)

    def test_filter_unused_complete_tickets(self):
        tickets = self.seeds.tickets

        result = Ticket.objects.filter_unused_complete_tickets()

        list1 = [tickets[0], tickets[2], tickets[3]]
        list2 = [tickets[8], tickets[10], tickets[11]]
        list3 = tickets[16:22]
        list4 = tickets[22:23]
        expected = list(reversed(list1 + list2 + list3 + list4))

        self.assertEqual(list(result.all()), expected)

    def test_filter_used_tickets(self):
        tickets = self.seeds.tickets

        result = Ticket.objects.filter_used_tickets()

        list1 = tickets[4:8]
        list2 = tickets[12:16]
        expected = list(reversed(list1 + list2))

        self.assertEqual(list(result.all()), expected)

    def test_filter_special_tickets(self):
        target_date = date(2022, 6, 11)

        tickets = self.seeds.tickets
        result = Ticket.objects.filter_special_tickets(target_date)
        expected = [tickets[19]]

        self.assertEqual(list(result.all()), expected)

    def test_exclude_eq_status(self):
        target = Ticket.STATUS_DRAFT
        result = Ticket.objects.exclude_eq_status(target)

        all_tickets_count = Ticket.objects.count()
        draft_tickets_count = Ticket.objects.filter(status=target).count()
        expected_count = all_tickets_count - draft_tickets_count

        self.assertEqual(expected_count, result.count())
