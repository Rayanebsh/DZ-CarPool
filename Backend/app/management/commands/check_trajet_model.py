# app/management/commands/check_trajet_model.py
from django.core.management.base import BaseCommand

from app.trajets.models import Trajet


class Command(BaseCommand):
    help = "Affiche tous les champs du modèle Trajet"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("\n🔍 CHAMPS DU MODÈLE TRAJET\n"))

        # Récupérer tous les champs
        fields = Trajet._meta.get_fields()

        self.stdout.write("📋 Liste des champs:")
        for field in fields:
            self.stdout.write(f"  - {field.name} ({type(field).__name__})")

        # Vérifier les champs de date spécifiquement
        self.stdout.write("\n📅 Champs de type Date/DateTime:")
        date_fields = [
            f for f in fields if "date" in f.name.lower() or "time" in f.name.lower()
        ]

        if date_fields:
            for field in date_fields:
                self.stdout.write(self.style.WARNING(f"  ✅ {field.name}"))
        else:
            self.stdout.write(self.style.ERROR("  ❌ Aucun champ de date trouvé"))

        # Vérifier un trajet existant
        self.stdout.write("\n🚗 Exemple d'un trajet:")
        trajet = Trajet.objects.first()

        if trajet:
            self.stdout.write(f"  Trajet #{trajet.id}")
            for field in fields:
                if not field.many_to_many and not field.one_to_many:
                    try:
                        value = getattr(trajet, field.name)
                        self.stdout.write(f"    - {field.name}: {value}")
                    except:
                        pass
        else:
            self.stdout.write("  Aucun trajet en base")

        self.stdout.write(self.style.SUCCESS("\n✅ Vérification terminée!\n"))
