from django.test import TestCase

from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TicketModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_unused_tickets(self):
        tickets = self.seeds.tickets
        user_relation_id = self.seeds.user_relations[0].id

        result = Ticket.objects.get_unused_tickets(user_relation_id).all()
        expected = [tickets[11], tickets[10], tickets[9], tickets[8],
                    tickets[3], tickets[2], tickets[1], tickets[0]]

        self.assertEqual(list(result), expected)

    def test_get_unused_complete_tickets(self):
        tickets = self.seeds.tickets
        user_relation_id = self.seeds.user_relations[0].id

        result = Ticket.objects.get_unused_complete_tickets(
            user_relation_id).all()
        expected = [tickets[11], tickets[10], tickets[8],
                    tickets[3], tickets[2], tickets[0]]

        self.assertEqual(list(result), expected)

    def test_get_used_tickets(self):
        tickets = self.seeds.tickets
        user_relation_id = self.seeds.user_relations[0].id

        result = Ticket.objects.get_used_tickets(user_relation_id).all()
        expected = [tickets[15], tickets[14], tickets[13],
                    tickets[12], tickets[7], tickets[6], tickets[5], tickets[4]]

        self.assertEqual(list(result), expected)
