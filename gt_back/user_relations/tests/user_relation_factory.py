import factory
from users.tests.user_factory import UserFactory

from ..models import UserRelation


class UserRelationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserRelation

    user_1 = factory.SubFactory(UserFactory, email=factory.Sequence(lambda n: f"giving{n}@example.com"))
    user_2 = factory.SubFactory(UserFactory, email=factory.Sequence(lambda n: f"receiving{n}@example.com"))
    user_1_giving_ticket_img = "IMG_1234.jpeg"
    user_2_giving_ticket_img = "IMG_5678.jpeg"
