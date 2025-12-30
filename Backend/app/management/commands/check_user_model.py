# app/management/commands/check_user_model.py
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Affiche tous les champs du modèle User"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("\n🔍 CHAMPS DU MODÈLE USER\n"))

        # Récupérer tous les champs
        fields = User._meta.get_fields()

        self.stdout.write("📋 Liste des champs:")
        for field in fields:
            self.stdout.write(f"  - {field.name} ({type(field).__name__})")

        # Vérifier les champs liés aux images/photos
        self.stdout.write("\n📷 Champs image/photo:")
        photo_fields = [
            f
            for f in fields
            if "photo" in f.name.lower()
            or "image" in f.name.lower()
            or "avatar" in f.name.lower()
            or "picture" in f.name.lower()
        ]

        if photo_fields:
            for field in photo_fields:
                self.stdout.write(self.style.WARNING(f"  ✅ {field.name}"))
        else:
            self.stdout.write(self.style.ERROR("  ❌ Aucun champ photo trouvé"))

        # Vérifier un utilisateur existant
        self.stdout.write("\n👤 Exemple d'un utilisateur:")
        user = User.objects.first()

        if user:
            self.stdout.write(f"  User #{user.id}")
            for field in fields:
                if not field.many_to_many and not field.one_to_many:
                    try:
                        value = getattr(user, field.name)
                        if value and len(str(value)) < 100:
                            self.stdout.write(f"    - {field.name}: {value}")
                    except:
                        pass
        else:
            self.stdout.write("  Aucun utilisateur en base")

        self.stdout.write(self.style.SUCCESS("\n✅ Vérification terminée!\n"))
