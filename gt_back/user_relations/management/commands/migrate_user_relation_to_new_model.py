from pathlib import Path

from diaries.models import Diary, DiaryTag
from django.core.management.base import BaseCommand
from django.db.models import Q
from tickets.models import Ticket
from user_relations.models import UserRelation, UserRelationOld
from user_settings.models import UserSetting


class Command(BaseCommand):
    def handle(self, *args, **options):
        old_relations: list[UserRelationOld] = UserRelationOld.objects.all()
        user_settings: list[UserSetting] = UserSetting.objects.all()

        for old in old_relations:
            existing_new_relations = UserRelation.objects.filter(
                Q(user_1=old.giving_user, user_2=old.receiving_user)
                | Q(user_1=old.receiving_user, user_2=old.giving_user)
            )

            if existing_new_relations.exists():
                existing_new_relation: UserRelation = existing_new_relations.first()
                if existing_new_relation.user_2 == old.giving_user:
                    existing_new_relation.user_2_giving_ticket_img = old.ticket_img
                else:
                    existing_new_relation.user_1_giving_ticket_img = old.ticket_img
                existing_new_relation.save()
                Ticket.objects.filter_eq_user_relation_id(old.id, use_old=True).update(
                    user_relation=existing_new_relation, giving_user=old.giving_user
                )
                Diary.objects.filter_eq_user_relation_id(old.id, use_old=True).update(
                    user_relation=existing_new_relation
                )
                DiaryTag.objects.filter_eq_user_relation_id(old.id, use_old=True).update(
                    user_relation=existing_new_relation
                )
                self.update_user_settings(user_settings, old, existing_new_relation)
            else:
                new_relation = UserRelation.objects.create(
                    user_1=old.giving_user,
                    user_2=old.receiving_user,
                    user_1_giving_ticket_img=old.ticket_img,
                    user_2_giving_ticket_img="",
                )
                Ticket.objects.filter_eq_user_relation_id(old.id, use_old=True).update(
                    user_relation=new_relation, giving_user=old.giving_user
                )
                Diary.objects.filter_eq_user_relation_id(old.id, use_old=True).update(user_relation=new_relation)
                DiaryTag.objects.filter_eq_user_relation_id(old.id, use_old=True).update(user_relation=new_relation)
                self.update_user_settings(user_settings, old, new_relation)

    def update_user_settings(self, user_settings, old_relation, new_relation):
        for setting in user_settings:
            default_relation_id = Path(setting.default_page).name
            if default_relation_id == str(old_relation.id):
                setting.default_page = Path(setting.default_page).with_name(str(new_relation.id)).as_posix()
                setting.save()
