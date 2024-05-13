from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from user_relations.models import UserRelation
from users.models import User


class Command(BaseCommand):
    def handle(self, *args, **options):
        user_1 = User.objects.create(
            username="test_user_1", email="test_user_1@test.com", password=make_password("test_user_1")
        )
        user_2 = User.objects.create(
            username="test_user_2", email="test_user_2@test.com", password=make_password("test_user_2")
        )
        user_relation = UserRelation.objects.create(user_1=user_1, user_2=user_2)

        print("user_1: email is 'test_user_1@test.com', password is 'test_user_1'")
        print("user_2: email is 'test_user_2@test.com', password is 'test_user_2'")
        print(f"user_relation_id is {user_relation.id}")
