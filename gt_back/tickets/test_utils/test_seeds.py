from datetime import date

from tickets.test_utils import factory
from tickets.models import Ticket

from users.models import User
from user_relations.models import UserRelation


class TestSeed:
    users: list[User]
    user_relations: list[UserRelation]
    tickets: list[Ticket]

    def setUp(self):
        self.setUpUsers()
        self.setUpUserRelations()
        self.setUpTickets()
        self.setUpForDateRelatedTests()

    def setUpUsers(self):
        self.users = factory.create_users()  # 0, 1, 2, 3

    # MYMEMO: refactor
    def setUpUserRelations(self):
        self.user_relations = []

        user_relation1 = factory.create_user_relation(
            self.users[0], self.users[1])
        self.user_relations.append(user_relation1)

        user_relation2 = factory.create_user_relation(
            self.users[1], self.users[0])
        self.user_relations.append(user_relation2)

        user_relation3 = factory.create_user_relation(
            self.users[0], self.users[2])
        self.user_relations.append(user_relation3)

        user_relation4 = factory.create_user_relation(
            self.users[2], self.users[0])
        self.user_relations.append(user_relation4)

        user_relation5 = factory.create_user_relation(
            self.users[0], self.users[3])
        self.user_relations.append(user_relation5)

        user_relation6 = factory.create_user_relation(
            self.users[3], self.users[0])
        self.user_relations.append(user_relation6)

    def setUpTickets(self):
        self.tickets = []
        params = [
            {"status": "unread"},  # 0
            {"status": "draft"},  # 1
            {"status": "read"},  # 2
            {"status": "edited"},  # 3
            {"status": "unread", "use_date": date.today()},  # 4
            {"status": "draft", "use_date": date.today()},  # 5
            {"status": "read", "use_date": date.today()},  # 6
            {"status": "edited", "use_date": date.today()},  # 7
            {"status": "unread", "is_special": True},  # 8
            {"status": "draft", "is_special": True},  # 9
            {"status": "read", "is_special": True},  # 10
            {"status": "edited", "is_special": True},  # 11
            {"status": "unread", "use_date": date.today(), "is_special": True},  # 12
            {"status": "draft", "use_date": date.today(), "is_special": True},  # 13
            {"status": "read", "use_date": date.today(), "is_special": True},  # 14
            {"status": "edited", "use_date": date.today(), "is_special": True},  # 15
        ]
        tickets = factory.create_tickets(self.user_relations[0], params)
        self.tickets.extend(tickets)

    def setUpForDateRelatedTests(self):
        params = [
            {"gift_date": date(2022, 6, 1)},  # 16
            {"gift_date": date(2022, 7, 1)},  # 17
            {"gift_date": date(2022, 8, 1)},  # 18
            {"gift_date": date(2022, 6, 1), "is_special": True},  # 19
            {"gift_date": date(2022, 7, 1), "is_special": True},  # 20
            {"gift_date": date(2022, 8, 1), "is_special": True},  # 21
        ]
        tickets = factory.create_tickets(self.user_relations[1], params)
        self.tickets.extend(tickets)
