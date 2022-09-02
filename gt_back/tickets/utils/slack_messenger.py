import json
import logging

import requests

logger = logging.getLogger(__name__)


class SlackMessenger():
    def send_message(self, url: str, message_dict: str):
        header = {"Content-type": "application/json"}
        connect_timeout = 5.0
        read_timeout = 30.0

        message = json.dumps(message_dict)

        response = requests.post(url, data=message, headers=header,
                                 timeout=(connect_timeout, read_timeout))
        response.raise_for_status()
