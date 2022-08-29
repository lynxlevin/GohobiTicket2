import json
import requests
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

    @mock.patch("requests.post")
    def test_send_message_error(self, post_mock):
        stub_response = requests.Response()
        stub_response.status_code = 400

        post_mock.return_value = stub_response

        url = 'https://test_url'
        message_dict = {
            "message": "test_message",
        }

        with self.assertRaises(requests.exceptions.HTTPError):
            slack_messenger = SlackMessenger()
            slack_messenger.send_message(url, message_dict)
