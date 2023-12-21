# Generated by Django 3.2.11 on 2023-12-21 12:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('diaries', '0002_auto_20231221_1140'),
    ]

    operations = [
        migrations.AddField(
            model_name='diary',
            name='tags',
            field=models.ManyToManyField(through='diaries.DiaryTagRelation', to='diaries.DiaryTag'),
        ),
    ]
