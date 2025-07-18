# Generated by Django 5.2.4 on 2025-07-15 10:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0002_organization'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='organization',
            field=models.ForeignKey(blank=True, default=1, help_text='The organization this user belongs to', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='documents.organization'),
        ),
    ]
