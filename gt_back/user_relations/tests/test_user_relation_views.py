from datetime import date

from django.test import Client, TestCase
from rest_framework import status
from tickets.tests.ticket_factory import TicketFactory
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory


class TestUserRelationViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()

    def test_list(self):
        """
        Get /api/user_relations/
        """
        giving_relation_1 = UserRelationFactory(giving_user=self.user)
        giving_relation_2 = UserRelationFactory(giving_user=self.user)
        receiving_relation_1 = UserRelationFactory(
            receiving_user=self.user, giving_user=giving_relation_1.receiving_user
        )
        receiving_relation_2 = UserRelationFactory(
            receiving_user=self.user, giving_user=giving_relation_2.receiving_user
        )
        relations = [giving_relation_1, giving_relation_2, receiving_relation_1, receiving_relation_2]

        client = Client()
        client.force_login(self.user)
        response = client.get("/api/user_relations/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        expected = {
            "user_relations": [
                {
                    "id": str(relation.id),
                    "related_username": relation.receiving_user.username
                    if relation.giving_user == self.user
                    else relation.giving_user.username,
                    "is_giving_relation": relation.giving_user == self.user,
                    "ticket_image": relation.ticket_img,
                    "corresponding_relation_id": str(relation.corresponding_relation.id),
                }
                for relation in relations
            ]
        }
        self.assertDictEqual(expected, response.data)

    def test_check_special_ticket_availablity__True(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket/availability/?year={year}&month={month}
        """
        giving_relation = UserRelationFactory(giving_user=self.user)

        response = self._send_special_ticket_availability_request(
            self.user, giving_relation.id, year="2022", month="05"
        )

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertTrue(data)

    def test_check_special_ticket_availablity__False(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket_availability/?year={year}&month={month}
        """
        giving_relation = UserRelationFactory(giving_user=self.user)
        _special_ticket_already_exists = TicketFactory(
            is_special=True, gift_date=date(2022, 5, 1), user_relation=giving_relation
        )

        response = self._send_special_ticket_availability_request(
            self.user, giving_relation.id, year="2022", month="05"
        )

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertFalse(data)

    def test_check_special_ticket_availablity_case_error__non_related_user(self):
        non_related_relation = UserRelationFactory()

        response = self._send_special_ticket_availability_request(
            self.user, non_related_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity_case_error__not_giving_user(self):
        receiving_relation = UserRelationFactory(receiving_user=self.user)

        response = self._send_special_ticket_availability_request(
            self.user, receiving_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    def test_check_special_ticket_availablity_case_error__year_out_of_range(self):
        giving_relation = UserRelationFactory(giving_user=self.user)

        response = self._send_special_ticket_availability_request(
            self.user, giving_relation.id, year="20220", month="05"
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_check_special_ticket_availablity_case_error__month_out_of_range(self):
        giving_relation = UserRelationFactory(giving_user=self.user)

        response = self._send_special_ticket_availability_request(
            self.user, giving_relation.id, year="2022", month="13"
        )

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    """
    Utility Functions
    """

    def _send_special_ticket_availability_request(self, user, user_relation_id, year, month):
        client = Client()
        client.force_login(user)
        response = client.get(
            f"/api/user_relations/{user_relation_id}/special_ticket_availability/?year={year}&month={month}"
        )
        return response
