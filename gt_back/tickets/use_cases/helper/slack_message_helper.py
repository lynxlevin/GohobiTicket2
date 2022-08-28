import json
import os
import requests
import logging

from tickets.models.ticket import Ticket

logger = logging.getLogger(__name__)


class SlackMessageHelper():
    def get_message(self, user_name: str, gifter_name: str, use_description: str, description: str):
        title = f"{user_name}がチケットを使ったよ"
        main_text = f"{gifter_name}へ: {use_description}"
        ticket_description = f"使ったチケット: {description}"
        message = {
            "text": title,
            "blocks": [
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"}},
                {"type": "section", "text": {"type": "mrkdwn", "text": main_text}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": ticket_description}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"}},
            ],
        }

        return json.dumps(message)

    def get_special_message(self, user_name: str, gifter_name: str, use_description: str, description: str):
        title = f"{user_name}が特別チケットを使ったよ"
        main_text = f"{gifter_name}へ: {use_description}"
        ticket_description = f"使った特別チケット: {description}"
        special_message = {
            "text": title,
            "blocks": [
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜★〜★〜★〜★〜★〜★〜★〜★"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "★ ★ ★ 特別チケット ★ ★ ★"}},
                {"type": "section", "text": {"type": "mrkdwn", "text": main_text}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": ticket_description}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "★〜★〜★〜★〜★〜★〜★〜★〜"}},
            ],
        }

        return json.dumps(special_message)

    def send_message(self, ticket: Ticket):
        try:
            url = os.getenv("SLACK_API_URL")
            # MYMEMO: ticket と複雑に絡みすぎ？
            message_method = "get_special_message" if ticket.is_special else "get_message"
            message = getattr(self, message_method)(
                user_name=ticket.user_relation.receiving_user.username,
                gifter_name=ticket.user_relation.giving_user.username,
                use_description=ticket.use_description,
                description=ticket.description,
            )
            header = {"Content-type": "application/json"}
            connect_timeout = 5.0
            read_timeout = 30.0
            response = requests.post(url, data=message, headers=header,
                                     timeout=(connect_timeout, read_timeout))
            response.raise_for_status()
            # MYMEMO: logger もviewにあるほうがわかりやすいかも
            logger.info("Successfully sent message to Slack",
                        extra={"slack_message": message})
        except Exception as exc:
            logger.error("Slack message error", extra={
                         "response_text": exc.response.text, "response_status_code": exc.response.status_code})
