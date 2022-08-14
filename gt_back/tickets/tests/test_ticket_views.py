from datetime import date
from django.test import Client, TestCase
from rest_framework import status

from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TestTicketViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_list(self):
        """
        Get /tickets
        """

        client = Client()
        response = client.get(f"/tickets/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data

        self.assertEqual(len(self.seeds.tickets), len(data))

    # def test_get(self):
    #     """
    #     Get /tickets/{ticket_id}
    #     """
    #     ticket = self.seeds.tickets[0]

    #     client = Client()
    #     response = client.get(f"/tickets/{ticket.id}")

    #     self.assertEqual(status.HTTP_200_OK, response.status_code)
