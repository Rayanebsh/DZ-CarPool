from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "trajets",
            "0004_trajet_preferences_alter_trajet_fuel_consumption",
        ),  # Remplacez par votre 0004
        (
            "users",
            "0003_alter_preference_options_preference_category_and_more",
        ),  # Ajustez selon votre migration users
    ]

    operations = [
        # Supprimer les anciens champs
        migrations.RemoveField(
            model_name="trajet",
            name="music_allowed",
        ),
        migrations.RemoveField(
            model_name="trajet",
            name="no_smoking",
        ),
        migrations.RemoveField(
            model_name="trajet",
            name="small_luggage_only",
        ),
        # Ajouter le nouveau champ ManyToMany
        migrations.AddField(
            model_name="trajet",
            name="preferences",
            field=models.ManyToManyField(
                blank=True, related_name="trajets", to="users.preference"
            ),
        ),
    ]
