from django.test import Client, TestCase
from rest_framework import status
from user_relations.tests.user_relation_factory import UserRelationFactory
from users.tests.user_factory import UserFactory

from tickets.enums import TicketStatus
from tickets.tests.ticket_factory import TicketFactory


class TestPartialUpdateTicket(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory()
        cls.partner = UserFactory()
        cls.relation = UserRelationFactory(user_1=cls.user, user_2=cls.partner)

    def test_partial_update__description_of_unread_ticket(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(user_relation=self.relation, giving_user=self.user)

        params = {"ticket": {"description": "updated description"}}

        response = self._send_patch_request(self.user, ticket.id, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(ticket.id, response.data["id"])
        self.assertEqual(params["ticket"]["description"], ticket.description)
        self.assertEqual(TicketStatus.STATUS_UNREAD.value, ticket.status)

    def test_partial_update__description_of_read_ticket(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        ticket = TicketFactory(
            user_relation=self.relation, giving_user=self.user, status=TicketStatus.STATUS_READ.value
        )

        params = {"ticket": {"description": "updated description"}}

        response = self._send_patch_request(self.user, ticket.id, params)

        self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

        ticket.refresh_from_db()
        self.assertEqual(ticket.id, response.data["id"])
        self.assertEqual(params["ticket"]["description"], ticket.description)
        self.assertEqual(TicketStatus.STATUS_EDITED.value, ticket.status)

    def test_partial_update__status(self):
        """
        Patch /api/tickets/{ticket_id}/
        """
        cases = [
            {
                "name": "draft_to_unread",
                "status_as_is": TicketStatus.STATUS_DRAFT.value,
                "status_to_be": TicketStatus.STATUS_UNREAD.value,
            },
            {
                "name": "unread_to_read",
                "status_as_is": TicketStatus.STATUS_UNREAD.value,
                "status_to_be": TicketStatus.STATUS_READ.value,
            },
            {
                "name": "read_to_edited",
                "status_as_is": TicketStatus.STATUS_READ.value,
                "status_to_be": TicketStatus.STATUS_EDITED.value,
            },
            {
                "name": "edited_to_read",
                "status_as_is": TicketStatus.STATUS_EDITED.value,
                "status_to_be": TicketStatus.STATUS_READ.value,
            },
        ]

        for case in cases:
            with self.subTest(case=case["name"]):
                ticket = TicketFactory(user_relation=self.relation, giving_user=self.user, status=case["status_as_is"])

                params = {"ticket": {"status": case["status_to_be"]}}

                response = self._send_patch_request(self.user, ticket.id, params)

                self.assertEqual(status.HTTP_202_ACCEPTED, response.status_code)

                ticket.refresh_from_db()
                self.assertEqual(ticket.id, response.data["id"])
                self.assertEqual(case["status_to_be"], ticket.status)

    def test_partial_update__bad_ticket(self):
        receiving_ticket = TicketFactory(user_relation=self.relation, giving_user=self.partner)
        unrelated_ticket = TicketFactory()
        cases = [
            {"name": "receiving_ticket", "ticket_id": receiving_ticket.id, "http_status": status.HTTP_403_FORBIDDEN},
            {"name": "unrelated_ticket", "ticket_id": unrelated_ticket.id, "http_status": status.HTTP_404_NOT_FOUND},
            {"name": "non_existent_ticket", "ticket_id": -1, "http_status": status.HTTP_404_NOT_FOUND},
        ]
        params = {"ticket": {"description": "updated description"}}

        for case in cases:
            with self.subTest(case=case["name"]):
                response = self._send_patch_request(self.user, case["ticket_id"], params)
                self.assertEqual(case["http_status"], response.status_code)

    def test_partial_update__error_changing_to_draft(self):
        cases = [
            {"name": "unread_ticket_cannot_be_changed_to_draft", "status": TicketStatus.STATUS_UNREAD.value},
            {"name": "read_ticket_cannot_be_changed_to_draft", "status": TicketStatus.STATUS_READ.value},
            {"name": "edited_ticket_cannot_be_changed_to_draft", "status": TicketStatus.STATUS_EDITED.value},
        ]
        params = {"ticket": {"status": TicketStatus.STATUS_DRAFT.value}}

        for case in cases:
            with self.subTest(case=case["name"]):
                ticket = TicketFactory(user_relation=self.relation, giving_user=self.user, status=case["status"])
                response = self._send_patch_request(self.user, ticket.id, params)
                self.assertEqual(status.HTTP_403_FORBIDDEN, response.status_code)

    """
    Utility Functions
    """

    def _send_patch_request(self, user, ticket_id, params):
        client = Client()
        client.force_login(user)
        uri = f"/api/tickets/{ticket_id}/"
        response = client.patch(uri, params, content_type="application/json")
        return response
