from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("trajets", "0006_delete_trajetpreference"),
        ("users", "0003_alter_preference_options_preference_category_and_more"),
    ]

    operations = [
        # Étape 1 : Créer le modèle TrajetPreference
        migrations.CreateModel(
            name="TrajetPreference",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "trajet",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="trajet_preferences",
                        to="trajets.trajet",
                    ),
                ),
                (
                    "preference",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="preference_trajets",
                        to="users.preference",
                    ),
                ),
            ],
            options={
                "db_table": "trajets_preferences",
            },
        ),
        # Étape 2 : Ajouter la contrainte unique
        migrations.AlterUniqueTogether(
            name="trajetpreference",
            unique_together={("trajet", "preference")},
        ),
        # Étape 3 : Ajouter les index
        migrations.AddIndex(
            model_name="trajetpreference",
            index=models.Index(fields=["trajet"], name="trajets_pre_trajet_idx"),
        ),
        migrations.AddIndex(
            model_name="trajetpreference",
            index=models.Index(fields=["preference"], name="trajets_pre_pref_idx"),
        ),
        # Étape 4 : Ajouter le champ preferences au modèle Trajet
        migrations.AddField(
            model_name="trajet",
            name="preferences",
            field=models.ManyToManyField(
                blank=True,
                help_text="Préférences du conducteur pour ce trajet",
                related_name="trajets",
                through="trajets.TrajetPreference",
                to="users.preference",
            ),
        ),
    ]
