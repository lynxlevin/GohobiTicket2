# Generated by Django 3.2.11 on 2024-03-15 11:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('user_relations', '0003_userrelation2'),
        ('tickets', '0003_alter_ticket_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='giving_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ticket',
            name='user_relation_2',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='user_relations.userrelation2'),
        ),
    ]
