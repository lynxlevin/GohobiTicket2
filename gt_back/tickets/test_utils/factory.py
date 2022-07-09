from django.utils import timezone

from users.models import User
from user_relations.models import UserRelation
from tickets.models import Ticket


def create_users() -> list[User]:
    users = []
    user1 = User(username="test_user1", email="test1@test.com")
    user1.set_password("password1")
    users.append(user1)

    user2 = User(username="test_user2", email="test2@test.com")
    user2.set_password("password2")
    users.append(user2)

    User.objects.bulk_create(users)
    return users


def create_user_relation(giving_user: User, receiving_user: User) -> UserRelation:
    user_relation = UserRelation(
        giving_user=giving_user, receiving_user=receiving_user)
    user_relation.save()
    return user_relation


def create_ticket(user_relation: UserRelation, param: dict = {}) -> Ticket:
    ticket = Ticket(
        description=param.get("description", "test_ticket"),
        gift_date=param.get("gift_date", timezone.now()),
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
