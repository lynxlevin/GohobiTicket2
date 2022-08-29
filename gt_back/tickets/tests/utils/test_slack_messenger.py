import json
from unittest import mock
from django.test import TestCase
from tickets.utils.slack_messenger import SlackMessenger
from tickets.test_utils.test_seeds import TestSeed


class TestSlackMessenger(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.seeds = TestSeed()
        cls.seeds.setUp()

    @mock.patch("requests.post")
    def test_send_message(self, requests_mock):
        url = 'https://test_url'
        message_dict = {
            "message": "test_message",
        }

        slack_messenger = SlackMessenger()
        slack_messenger.send_message(url, message_dict)

        header = {"Content-type": "application/json"}
        timeout = (5.0, 30.0)

        requests_mock.assert_called_once_with(
            url, data=json.dumps(message_dict), headers=header, timeout=timeout)
