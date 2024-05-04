from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.enums import TicketStatus
from tickets.tests.ticket_factory import TicketFactory, UsedTicketFactory


class TestListTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_list__receiving_relation(self):
        """
        Get /api/tickets/?user_relation_id={user_relation_id}&is_receiving
        """
        expected_available_tickets = [
            TicketFactory(
                status=TicketStatus.STATUS_UNREAD.value, user_relation=self.relation, giving_user=self.partner
            ),
            TicketFactory(status=TicketStatus.STATUS_READ.value, user_relation=self.relation, giving_user=self.partner),
            TicketFactory(
                status=TicketStatus.STATUS_EDITED.value, user_relation=self.relation, giving_user=self.partner
            ),
        ]
        expected_used_tickets = [
            UsedTicketFactory(
                status=TicketStatus.STATUS_READ.value, user_relation=self.relation, giving_user=self.partner
            ),
            UsedTicketFactory(
                status=TicketStatus.STATUS_READ.value, user_relation=self.relation, giving_user=self.partner
            ),
        ]
        _tickets_not_returned = [
            TicketFactory(
                status=TicketStatus.STATUS_DRAFT.value, user_relation=self.relation, giving_user=self.partner
            ),
            TicketFactory(status=TicketStatus.STATUS_UNREAD.value),
        ]

        response = self._send_get_request(self.user, f"/api/tickets/?user_relation_id={self.relation.id}&is_receiving")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        body = response.json()
        tickets = body["tickets"]
        for expected, ticket in zip(
            sorted(
                [*expected_available_tickets, *expected_used_tickets],
                key=lambda ticket: f"{ticket.gift_date}-{ticket.id}",
                reverse=True,
            ),
            tickets,
        ):
            self.assertEqual(expected.id, ticket["id"])

    def test_list__giving_relation(self):
        """
        Get /api/tickets/?user_relation_id={user_relation_id}&is_giving
        """
        expected_available_tickets = [
            TicketFactory(status=TicketStatus.STATUS_UNREAD.value, user_relation=self.relation, giving_user=self.user),
            TicketFactory(status=TicketStatus.STATUS_READ.value, user_relation=self.relation, giving_user=self.user),
            TicketFactory(status=TicketStatus.STATUS_EDITED.value, user_relation=self.relation, giving_user=self.user),
            TicketFactory(status=TicketStatus.STATUS_DRAFT.value, user_relation=self.relation, giving_user=self.user),
        ]
        expected_used_tickets = [
            UsedTicketFactory(
                status=TicketStatus.STATUS_READ.value, user_relation=self.relation, giving_user=self.user
            ),
            UsedTicketFactory(
                status=TicketStatus.STATUS_READ.value, user_relation=self.relation, giving_user=self.user
            ),
        ]
        _tickets_not_returned = [
            TicketFactory(status=TicketStatus.STATUS_UNREAD.value),
        ]

        response = self._send_get_request(self.user, f"/api/tickets/?user_relation_id={self.relation.id}&is_giving")

        self.assertEqual(status.HTTP_200_OK, response.status_code)

        body = response.json()
        tickets = body["tickets"]
        for expected, ticket in zip(
            sorted(
                [*expected_available_tickets, *expected_used_tickets],
                key=lambda ticket: f"{ticket.gift_date}-{ticket.id}",
                reverse=True,
            ),
            tickets,
        ):
            self.assertEqual(expected.id, ticket["id"])

    """
    Utility Functions
    """

    def _send_get_request(self, user, uri):
        client = Client()
        client.force_login(user)
        response = client.get(uri)
        return response
