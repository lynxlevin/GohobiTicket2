import json
import os
from unittest import mock
from django.test import TestCase
from test.support import EnvironmentVarGuard
from tickets.use_cases.helper.slack_message_helper import SlackMessageHelper
from tickets.test_utils.test_seeds import TestSeed


class TestSlackMessageHelper(TestCase):
    def setUp(self):
        self.env = EnvironmentVarGuard()
        self.env.set("SLACK_API_URL", "https://test_api/")

    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    def test_get_message(self):
        user_name = "user"
        gifter_name = "gifter"
        use_description = "Thanks"
        description = "You're great"

        helper = SlackMessageHelper()

        message = helper.get_message(user_name=user_name, gifter_name=gifter_name,
                                     use_description=use_description, description=description)

        expected_message = {
            "text": f"{user_name}がチケットを使ったよ",
            "blocks": [
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"}},
                {"type": "section", "text": {"type": "mrkdwn",
                                             "text": f"{gifter_name}へ: {use_description}"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": f"使ったチケット: {description}"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"}},
            ],
        }

        # MYMEMO: json.dumpsはここではしない
        self.assertEqual(json.dumps(expected_message), message)

    def test_get_special_message(self):
        user_name = "user"
        gifter_name = "gifter"
        use_description = "Thanks"
        description = "You're great"

        helper = SlackMessageHelper()

        message = helper.get_special_message(user_name=user_name, gifter_name=gifter_name,
                                             use_description=use_description, description=description)

        expected_message = {
            "text": f"{user_name}が特別チケットを使ったよ",
            "blocks": [
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜★〜★〜★〜★〜★〜★〜★〜★"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "★ ★ ★ 特別チケット ★ ★ ★"}},
                {"type": "section", "text": {"type": "mrkdwn",
                                             "text": f"{gifter_name}へ: {use_description}"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": f"使った特別チケット: {description}"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "★〜★〜★〜★〜★〜★〜★〜★〜"}},
            ],
        }

        # MYMEMO: json.dumpsはここではしない
        self.assertEqual(json.dumps(expected_message), message)

    @mock.patch("tickets.use_cases.helper.slack_message_helper.SlackMessageHelper.get_message")
    @mock.patch("requests.post")
    def test_send_message_normal_ticket(self, requests_mock, get_message_mock):
        test_message = 'test_message'
        get_message_mock.return_value = test_message

        ticket = self.seeds.tickets[0]

        helper = SlackMessageHelper()

        helper.send_message(ticket)

        get_message_mock.assert_called_once_with(
            user_name=ticket.user_relation.receiving_user.username,
            gifter_name=ticket.user_relation.giving_user.username,
            use_description=ticket.use_description,
            description=ticket.description,
        )

        url = os.getenv("SLACK_API_URL")
        header = {"Content-type": "application/json"}
        requests_mock.assert_called_once_with(
            url, data=test_message, headers=header, timeout=(5.0, 30.0))

    @mock.patch("tickets.use_cases.helper.slack_message_helper.SlackMessageHelper.get_special_message")
    @mock.patch("requests.post")
    def test_send_message_special_ticket(self, requests_mock, get_message_mock):
        test_message = 'test_message'
        get_message_mock.return_value = test_message

        ticket = self.seeds.tickets[0]
        ticket.is_special = True
        ticket.save()
        # MYMEMO: logger もテスト書きたい
        helper = SlackMessageHelper()

        helper.send_message(ticket)

        get_message_mock.assert_called_once_with(
            user_name=ticket.user_relation.receiving_user.username,
            gifter_name=ticket.user_relation.giving_user.username,
            use_description=ticket.use_description,
            description=ticket.description,
        )

        url = os.getenv("SLACK_API_URL")
        header = {"Content-type": "application/json"}
        requests_mock.assert_called_once_with(
            url, data=test_message, headers=header, timeout=(5.0, 30.0))
