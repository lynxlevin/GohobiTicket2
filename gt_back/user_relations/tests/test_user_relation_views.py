from datetime import date

from django.test import Client, TestCase
from rest_framework import status
from tickets.tests.ticket_factory import TicketFactory
from users.tests.user_factory import UserFactory

from user_relations.tests.user_relation_factory import UserRelationFactory


class TestUserRelationViews(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()

    def test_list(self):
        """
        Get /api/user_relations/
        """
        relation_1 = UserRelationFactory(user_1=self.user)
        relation_2 = UserRelationFactory(user_2=self.user)

        client = Client()
        client.force_login(self.user)
        response = client.get("/api/user_relations/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        expected = {
            "user_relations": [
                {
                    "id": str(relation_1.id),
                    "related_username": relation_1.get_related_user(self.user.id).username,
                    "giving_ticket_img": relation_1.user_1_giving_ticket_img,
                    "receiving_ticket_img": relation_1.user_2_giving_ticket_img,
                },
                {
                    "id": str(relation_2.id),
                    "related_username": relation_2.get_related_user(self.user.id).username,
                    "giving_ticket_img": relation_2.user_2_giving_ticket_img,
                    "receiving_ticket_img": relation_2.user_1_giving_ticket_img,
                },
            ]
        }
        self.assertDictEqual(expected, response.data)

    def test_list__null_ticket_img(self):
        """
        Get /api/user_relations/
        """
        relation = UserRelationFactory(user_1=self.user, user_1_giving_ticket_img=None, user_2_giving_ticket_img=None)

        client = Client()
        client.force_login(self.user)
        response = client.get("/api/user_relations/")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        expected = {
            "user_relations": [
                {
                    "id": str(relation.id),
                    "related_username": relation.get_related_user(self.user.id).username,
                    "giving_ticket_img": None,
                    "receiving_ticket_img": None,
                },
            ]
        }
        self.assertDictEqual(expected, response.data)

    def test_check_special_ticket_availablity__True(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket/availability/?year={year}&month={month}
        """
        relation = UserRelationFactory(user_1=self.user)
        _receiving_special_ticket = TicketFactory(
            is_special=True, gift_date=date(2022, 5, 1), user_relation=relation, giving_user=relation.user_2
        )

        response = self._send_special_ticket_availability_request(self.user, relation.id, year="2022", month="05")

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertTrue(data)

    def test_check_special_ticket_availablity__False(self):
        """
        Get /api/user_relations/{user_relation_id}/special_ticket_availability/?year={year}&month={month}
        """
        relation = UserRelationFactory(user_1=self.user)
        _special_ticket_already_exists = TicketFactory(
            is_special=True, gift_date=date(2022, 5, 1), user_relation=relation, giving_user=self.user
        )

        response = self._send_special_ticket_availability_request(self.user, relation.id, year="2022", month="05")

        data = response.data
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertFalse(data)

    def test_check_special_ticket_availablity_case_error__non_related_user(self):
        non_related_relation = UserRelationFactory()

        response = self._send_special_ticket_availability_request(
            self.user, non_related_relation.id, year="2022", month="05"
        )

        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_check_special_ticket_availablity_case_error__year_out_of_range(self):
        relation = UserRelationFactory(user_1=self.user)

        response = self._send_special_ticket_availability_request(self.user, relation.id, year="2201", month="05")

        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)

    def test_check_special_ticket_availablity_case_error__month_out_of_range(self):
        relation = UserRelationFactory(user_1=self.user)

        response = self._send_special_ticket_availability_request(self.user, relation.id, year="2022", month="13")

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
