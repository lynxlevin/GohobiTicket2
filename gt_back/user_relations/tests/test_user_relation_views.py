from django.test import Client, TestCase
from rest_framework import status
from tickets.models import Ticket
from tickets.test_utils.test_seeds import TestSeed


class TestUserRelationViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    # MYMEMO: 内容ごとに user_relations/id/tickets とかに分けるのが REST かも
    def test_retrieve__receiving_relation(self):
        """
        Get /api/user_relations/{id}
        When receiving relation
        """
        user = self.seeds.users[0]
        user_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data
        self.assertNotEqual(0, len(data))

        available_tickets = data["available_tickets"]
        for ticket in available_tickets:
            self.assertNotEqual(Ticket.STATUS_DRAFT, ticket["status"])

    def test_retrieve__giving_relation(self):
        """
        Get /api/user_relations/{id}
        When giving relation
        """
        user = self.seeds.users[1]
        user_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        data = response.data
        self.assertNotEqual(0, len(data))

        available_tickets = data["available_tickets"]
        self.assertEqual(
            Ticket.objects.filter_eq_user_relation_id(user_relation.id).count(),
            len(available_tickets),
        )

    def test_retrieve__not_authenticated(self):
        """
        Get /api/user_relations/{id}
        403 Forbidden: when not logged in
        """
        user_relation = self.seeds.user_relations[2]

        client = Client()
        response = client.get(f"/api/user_relations/{user_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_retrieve__non_related_user(self):
        """
        Get /api/user_relations/{id}
        403 Forbidden: when wrong login
        """
        user = self.seeds.users[2]
        _user_relation = self.seeds.user_relations[2]

        other_relation = self.seeds.user_relations[1]

        client = Client()
        client.force_login(user)
        response = client.get(f"/api/user_relations/{other_relation.id}/")

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity__True(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket/availability/?year={year}&month={month}
        """
        user = self.seeds.users[1]
        user_relation = user.giving_relations.first()

        response = self._send_special_ticket_availability_request(
            user, user_relation.id, year="2022", month="05"
        )

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertTrue(data)

    def test_check_special_ticket_availablity__False(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket_availability/?year={year}&month={month}
        """
        user = self.seeds.users[1]
        user_relation = user.giving_relations.first()

        response = self._send_special_ticket_availability_request(
            user, user_relation.id, year="2022", month="06"
        )

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertFalse(data)

    def test_check_special_ticket_availablity_case_error__non_related_user(self):
        user = self.seeds.users[2]
        _user_relation = self.seeds.user_relations[2]

        other_relation = self.seeds.user_relations[1]

        response = self._send_special_ticket_availability_request(
            user, other_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity_case_error__not_giving_user(self):
        user = self.seeds.users[2]
        receiving_relation = user.receiving_relations.first()

        response = self._send_special_ticket_availability_request(
            user, receiving_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity_case_error__year_out_of_range(self):
        user = self.seeds.users[2]
        user_relation = user.giving_relations.first()

        response = self._send_special_ticket_availability_request(
            user, user_relation.id, year="20220", month="05"
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_check_special_ticket_availablity_case_error__month_out_of_range(self):
        user = self.seeds.users[2]
        user_relation = user.giving_relations.first()

        response = self._send_special_ticket_availability_request(
            user, user_relation.id, year="2022", month="13"
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
