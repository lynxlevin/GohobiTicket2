import factory
from users.tests.user_factory import UserFactory

from ..models import UserSetting


class UserSettingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserSetting

    user = factory.SubFactory(UserFactory)
    default_page = factory.Sequence(lambda n: f"/user_relations/{n}")
