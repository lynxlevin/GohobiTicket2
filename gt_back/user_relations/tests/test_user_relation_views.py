from datetime import date

from django.test import Client, TestCase
from rest_framework import status
from tickets.models import Ticket
from tickets.tests.ticket_factory import TicketFactory
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestUserRelationViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.giving_relation = UserRelationFactory(giving_user=cls.user)
        cls.receiving_relation = UserRelationFactory(receiving_user=cls.user, giving_user=cls.giving_relation.receiving_user)
        cls.non_related_relation = UserRelationFactory()

    # MYMEMO: 内容ごとに user_relations/id/tickets とかに分けるのが REST かも
    def test_retrieve__receiving_relation(self):
        """
        Get /api/user_relations/{id}
        When receiving relation
        """
        user_relation = self.receiving_relation
        tickets_to_be_returned = [
            TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=user_relation),
            TicketFactory(status=Ticket.STATUS_READ, user_relation=user_relation),
            TicketFactory(status=Ticket.STATUS_EDITED, user_relation=user_relation),
        ]
        _tickets_not_returned = [
            TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=user_relation),
            TicketFactory(status=Ticket.STATUS_UNREAD),
        ]

        client = Client()
        client.force_login(self.user)
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        available_tickets = response.data["available_tickets"]
        self.assertEqual(len(tickets_to_be_returned), len(available_tickets))

    def test_retrieve__giving_relation(self):
        """
        Get /api/user_relations/{id}
        When giving relation
        """
        user_relation = self.giving_relation
        tickets_to_be_returned = [
            TicketFactory(status=Ticket.STATUS_UNREAD, user_relation=user_relation),
            TicketFactory(status=Ticket.STATUS_READ, user_relation=user_relation),
            TicketFactory(status=Ticket.STATUS_EDITED, user_relation=user_relation),
            TicketFactory(status=Ticket.STATUS_DRAFT, user_relation=user_relation),
        ]
        _tickets_not_returned = [
            TicketFactory(status=Ticket.STATUS_UNREAD),
        ]

        client = Client()
        client.force_login(self.user)
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        available_tickets = response.data["available_tickets"]
        self.assertEqual(len(tickets_to_be_returned), len(available_tickets))

    def test_retrieve__not_authenticated(self):
        """
        Get /api/user_relations/{id}
        403 Forbidden: when not logged in
        """
        client = Client()
        response = client.get(f"/api/user_relations/{self.giving_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_retrieve__non_related_user(self):
        """
        Get /api/user_relations/{id}
        403 Forbidden: when wrong login
        """
        client = Client()
        client.force_login(self.user)
        response = client.get(f"/api/user_relations/{self.non_related_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity__True(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket/availability/?year={year}&month={month}
        """
        response = self._send_special_ticket_availability_request(
            self.user, self.giving_relation.id, year="2022", month="05"
        )

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertTrue(data)

    def test_check_special_ticket_availablity__False(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket_availability/?year={year}&month={month}
        """
        _special_ticket_already_exists = TicketFactory(is_special=True, gift_date=date(2022, 5, 1), user_relation=self.giving_relation)

        response = self._send_special_ticket_availability_request(
            self.user, self.giving_relation.id, year="2022", month="05"
        )

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertFalse(data)

    def test_check_special_ticket_availablity_case_error__non_related_user(self):
        response = self._send_special_ticket_availability_request(
            self.user, self.non_related_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity_case_error__not_giving_user(self):
        response = self._send_special_ticket_availability_request(
            self.user, self.receiving_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity_case_error__year_out_of_range(self):
        response = self._send_special_ticket_availability_request(
            self.user, self.giving_relation.id, year="20220", month="05"
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_check_special_ticket_availablity_case_error__month_out_of_range(self):
        response = self._send_special_ticket_availability_request(
            self.user, self.giving_relation.id, year="2022", month="13"
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    """
    Utility Functions
    """

    def _send_special_ticket_availability_request(
        self, user, user_relation_id, year, month
    ):
        client = Client()
        client.force_login(user)
        response = client.get(
            f"/api/user_relations/{user_relation_id}/special_ticket_availability/?year={year}&month={month}"
        )
        return response
        return response
        return response
        return response
