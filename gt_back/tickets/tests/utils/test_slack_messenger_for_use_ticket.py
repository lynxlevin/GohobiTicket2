import logging
import os
from unittest import mock

import requests
from django.test import TestCase
from tickets.tests.ticket_factory import TicketFactory
from tickets.utils.slack_messenger_for_use_ticket import SlackMessengerForUseTicket


class TestSlackMessengerForUseTicket(TestCase):
    def test_generate_message(self):
        normal_ticket = TicketFactory()

        giving_user_name = normal_ticket.giving_user.username
        receiving_user_name = normal_ticket.receiving_user.username
        expected_normal_message = {
            "text": f"{receiving_user_name}がチケットを使ったよ",
            "blocks": [
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"},
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"{giving_user_name}へ: {normal_ticket.use_description}",
                    },
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"使ったチケット: {normal_ticket.description}",
                    },
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"},
                },
            ],
        }

        special_ticket = TicketFactory(is_special=True)

        giving_user_name = special_ticket.giving_user.username
        receiving_user_name = special_ticket.receiving_user.username
        expected_special_message = {
            "text": f"{receiving_user_name}が特別チケットを使ったよ",
            "blocks": [
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "〜★〜★〜★〜★〜★〜★〜★〜★"},
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "★ ★ ★ 特別チケット ★ ★ ★"},
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"{giving_user_name}へ: {special_ticket.use_description}",
                    },
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"使った特別チケット: {special_ticket.description}",
                    },
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "★〜★〜★〜★〜★〜★〜★〜★〜"},
                },
            ],
        }

        cases = {
            "normal_tikcet": {
                "ticket": normal_ticket,
                "expected_message": expected_normal_message,
            },
            "special_tikcet": {
                "ticket": special_ticket,
                "expected_message": expected_special_message,
            },
        }

        for case, condition in cases.items():
            with self.subTest(case=case):
                messenger = SlackMessengerForUseTicket()
                messenger.generate_message(condition["ticket"])

                self.assertDictEqual(condition["expected_message"], messenger.message_dict)

    @mock.patch("tickets.utils.slack_messenger.SlackMessenger.send_message", autospec=True)
    def test_send_message(self, slack_messenger_mock):
        logger = logging.getLogger("tickets.utils.slack_messenger_for_use_ticket")

        # MYMEMO: url はtestようにしたい
        url = os.getenv("SLACK_API_URL")
        message_dict = {"message": "test_message"}

        messenger = SlackMessengerForUseTicket()
        messenger.message_dict = message_dict

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            messenger.send_message()

        slack_messenger_mock.assert_called_once_with(messenger, url, message_dict)

        expected_log = ["INFO:tickets.utils.slack_messenger_for_use_ticket:Successfully sent message to Slack"]
        self.assertEqual(cm.output, expected_log)

    @mock.patch("tickets.utils.slack_messenger.SlackMessenger.send_message", autospec=True)
    def test_send_message_error(self, slack_messenger_mock):
        stub_exception = requests.exceptions.HTTPError()
        stub_response = requests.Response()
        stub_response.reason = "Bad Request"
        stub_response.status_code = 400
        stub_exception.response = stub_response
        slack_messenger_mock.side_effect = stub_exception

        logger = logging.getLogger("tickets.utils.slack_messenger_for_use_ticket")

        message_dict = {"message": "test_message"}

        messenger = SlackMessengerForUseTicket()
        messenger.message_dict = message_dict

        with self.assertLogs(logger=logger, level=logging.INFO) as cm:
            messenger.send_message()

        expected_log = ["ERROR:tickets.utils.slack_messenger_for_use_ticket:Slack message error"]
        self.assertEqual(cm.output, expected_log)
        self.assertEqual(cm.output, expected_log)
