import enum
import json


class ErrorMessages(enum.Enum):
    SPECIAL_TICKET_LIMIT_VIOLATION = "特別チケットは月に1枚までしか付与できません"


class SlackMessageTemplates():
    def get_message(self, ticket_user_name: str, ticket_gifter_name: str, use_description: str, description: str):
        title = f"{ticket_user_name}がチケットを使ったよ"
        main_text = f"{ticket_gifter_name}へ: {use_description}"
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

    def get_special_message(self, ticket_user_name: str, ticket_gifter_name: str, use_description: str, description: str):
        title = f"{ticket_user_name}が特別チケットを使ったよ"
        main_text = f"{ticket_gifter_name}へ: {use_description}"
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
