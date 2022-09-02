from datetime import date

from tickets.models import Ticket
from tickets.test_utils import factory
from user_relations.models import UserRelation
from user_settings.models import UserSetting
from users.models import User


class TestSeed:
    users: list[User]
    user_relations: list[UserRelation]
    user_settings: list[UserSetting]
    tickets: list[Ticket]

    def setUp(self):
        self.setUpUsers()
        self.setUpUserRelations()
        self.setUpUserSettings()
        self.setUpTickets()
        self.setUpTicketsForDateRelatedTests()
        self.setUpTicketsForUserRelation2()

    def setUpUsers(self):
        self.users = []

        args = [
            ("test_user1", "test1@test.com", "password1"),  # 0
            ("test_user2", "test2@test.com", "password2"),  # 1
            ("test_user3", "test3@test.com", "password3"),  # 2
            ("test_user4", "test4@test.com", "password4"),  # 3
        ]

        for arg in args:
            user = factory.create_user(*arg)
            self.users.append(user)

    def setUpUserRelations(self):
        self.user_relations = []

        args = [
            (self.users[0], self.users[1]),  # 0
            (self.users[1], self.users[0]),  # 1
            (self.users[0], self.users[2]),  # 2
            (self.users[2], self.users[0]),  # 3
            (self.users[0], self.users[3]),  # 4
            (self.users[3], self.users[0]),  # 5
        ]

        for arg in args:
            user_relation = factory.create_user_relation(
                giving_user=arg[0], receiving_user=arg[1])
            self.user_relations.append(user_relation)

    def setUpUserSettings(self):
        self.user_settings = []

        args = [
            (self.users[0], "default_page1"),  # 0
            (self.users[1], "default_page2"),  # 1
            (self.users[2], "default_page3"),  # 2
            (self.users[3], "default_page4"),  # 3
        ]

        for arg in args:
            user_setting = factory.create_user_setting(*arg)
            self.user_settings.append(user_setting)

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

    def setUpTicketsForDateRelatedTests(self):
        # MYMEMO: このケースはテスト内でパラメータ変更して、このリレーションは上記と同じように網羅したほうがいいかも
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

    def setUpTicketsForUserRelation2(self):
        params = [
            {"gift_date": date(2022, 6, 1)},  # 22
        ]
        tickets = factory.create_tickets(self.user_relations[2], params)
        self.tickets.extend(tickets)
