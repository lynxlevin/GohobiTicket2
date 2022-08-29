import os
from tickets.models.ticket import Ticket
from tickets.utils import SlackMessenger


class SlackMessengerForUseTicket(SlackMessenger):
    url = os.getenv("SLACK_API_URL")

    def __init__(self):
        self.message_dict = {}

    def generate_message(self, ticket: Ticket):
        if ticket.is_special:
            message = self._get_special_message(ticket)
        else:
            message = self._get_normal_message(ticket)

        self.message_dict = message

    def send_message(self):
        # MYMEMO: superの失敗を受け取って、log 出力できるようにしたい
        super().send_message(self.url, self.message_dict)

    def _get_normal_message(self, ticket):
        receiving_user_name = ticket.user_relation.receiving_user.username
        giving_user_name = ticket.user_relation.giving_user.username

        title = f"{receiving_user_name}がチケットを使ったよ"
        main_text = f"{giving_user_name}へ: {ticket.use_description}"
        ticket_description = f"使ったチケット: {ticket.description}"

        normal_message = {
            "text": title,
            "blocks": [
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": main_text}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": ticket_description}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜"}},
            ],
        }

        return normal_message

    def _get_special_message(self, ticket):
        receiving_user_name = ticket.user_relation.receiving_user.username
        giving_user_name = ticket.user_relation.giving_user.username

        title = f"{receiving_user_name}が特別チケットを使ったよ"
        main_text = f"{giving_user_name}へ: {ticket.use_description}"
        ticket_description = f"使った特別チケット: {ticket.description}"
        special_message = {
            "text": title,
            "blocks": [
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "〜★〜★〜★〜★〜★〜★〜★〜★"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "★ ★ ★ 特別チケット ★ ★ ★"}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": main_text}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": ticket_description}},
                {"type": "section", "text": {
                    "type": "mrkdwn", "text": "★〜★〜★〜★〜★〜★〜★〜★〜"}},
            ],
        }

        return special_message
