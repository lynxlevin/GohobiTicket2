# Generated by Django 3.2.11 on 2023-12-19 12:04

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user_relations', '0002_auto_20220829_0615'),
    ]

    operations = [
        migrations.CreateModel(
            name='Diary',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('entry', models.TextField(blank=True, default='')),
                ('date', models.DateField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user_relation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user_relations.userrelation')),
            ],
        ),
    ]
