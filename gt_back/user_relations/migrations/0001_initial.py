# Generated by Django 3.2.11 on 2022-07-09 02:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserRelation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ticket_img', models.CharField(max_length=13)),
                ('background_color', models.CharField(default='rgb(250, 255, 255)', max_length=18)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('giving_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='giving_user', to=settings.AUTH_USER_MODEL)),
                ('receiving_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receiving_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
