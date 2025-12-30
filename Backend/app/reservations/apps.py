from django.apps import AppConfig


class ReservationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.reservations"
    verbose_name = "Réservations"

    def ready(self):
        """Importer les signals au démarrage de l'application"""
        import app.reservations.signals  # noqa: F401
