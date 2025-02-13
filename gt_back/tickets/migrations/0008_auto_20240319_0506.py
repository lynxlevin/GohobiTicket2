# Generated by Django 3.2.11 on 2024-03-19 05:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_relations', '0006_rename_userrelation2_userrelation'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tickets', '0007_alter_ticket_user_relation_old'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticket',
            name='user_relation_old',
        ),
        migrations.AlterField(
            model_name='ticket',
            name='giving_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user'),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='user_relation',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user_relations.userrelation'),
        ),
    ]
