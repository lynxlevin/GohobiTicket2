import factory
from users.tests.user_factory import UserFactory

from ..models import UserRelation


class UserRelationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserRelation

    giving_user = factory.SubFactory(UserFactory, email=factory.Sequence(lambda n: f"giving{n}@example.com"))
    receiving_user = factory.SubFactory(UserFactory, email=factory.Sequence(lambda n: f"receiving{n}@example.com"))
    ticket_img = "IMG_5777.jpeg"
    background_color = "rgb(250, 255, 255)"
