# Generated by Django 5.0.2 on 2025-03-10 23:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_projeto', '0003_alter_usuario_crm'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='crm',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
