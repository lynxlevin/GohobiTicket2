from datetime import date

from tickets.models import Ticket
from user_relations.models import UserRelation
from user_settings.models import UserSetting
from users.models import User


def create_user(username: str, email: str, password: str) -> User:
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return user


def create_user_setting(user: User, default_page) -> UserSetting:
    user_setting = UserSetting(user=user, default_page=default_page)
    user_setting.save()
    return user_setting


def create_user_relation(giving_user: User, receiving_user: User) -> UserRelation:
    user_relation = UserRelation(giving_user=giving_user, receiving_user=receiving_user)
    user_relation.save()
    return user_relation


def create_ticket(user_relation: UserRelation, param: dict = {}) -> Ticket:
    ticket = Ticket(
        description=param.get("description", "test_ticket"),
        gift_date=param.get("gift_date", date.today()),
        use_description=param.get("use_description", ""),
        use_date=param.get("use_date", None),
        status=param.get("status", "unread"),
        is_special=param.get("is_special", False),
        created_at=param.get("created_at", None),
        updated_at=param.get("updated_at", None),
        user_relation=user_relation,
    )
    ticket.save()
    return ticket


def create_tickets(user_relation: UserRelation, params: list[dict]) -> list[Ticket]:
    tickets = []
    for param in params:
        ticket = create_ticket(user_relation, param)
        tickets.append(ticket)
    return tickets
