# Generated by Django 3.2.11 on 2022-09-01 13:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0002_auto_20220711_0613'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='status',
            field=models.CharField(choices=[('unread', 'unread'), ('read', 'read'), ('edited', 'edited'), ('draft', 'draft')], default='unread', max_length=8),
        ),
    ]
