# app/management/commands/check_websocket.py
import os

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Vérifie la configuration WebSocket"

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("\n🔍 VÉRIFICATION CONFIGURATION WEBSOCKET\n")
        )

        # 1. Vérifier INSTALLED_APPS
        self.stdout.write("📦 INSTALLED_APPS:")
        required_apps = ["channels", "app.messaging"]
        for app in required_apps:
            if app in settings.INSTALLED_APPS:
                self.stdout.write(self.style.SUCCESS(f"  ✅ {app}"))
            else:
                self.stdout.write(self.style.ERROR(f"  ❌ {app} MANQUANT"))

        # 2. Vérifier ASGI_APPLICATION
        self.stdout.write("\n⚙️ ASGI Configuration:")
        if hasattr(settings, "ASGI_APPLICATION"):
            self.stdout.write(
                self.style.SUCCESS(
                    f"  ✅ ASGI_APPLICATION: {settings.ASGI_APPLICATION}"
                )
            )
        else:
            self.stdout.write(self.style.ERROR("  ❌ ASGI_APPLICATION non défini"))

        # 3. Vérifier CHANNEL_LAYERS
        self.stdout.write("\n🔌 CHANNEL_LAYERS:")
        if hasattr(settings, "CHANNEL_LAYERS"):
            self.stdout.write(self.style.SUCCESS(f"  ✅ CHANNEL_LAYERS configuré"))
            backend = settings.CHANNEL_LAYERS.get("default", {}).get(
                "BACKEND", "Non défini"
            )
            self.stdout.write(f"     Backend: {backend}")
        else:
            self.stdout.write(self.style.ERROR("  ❌ CHANNEL_LAYERS non défini"))

        # 4. Vérifier le fichier routing.py
        self.stdout.write("\n📂 Fichiers WebSocket:")

        files_to_check = [
            ("app/messaging/routing.py", "Routing WebSocket"),
            ("app/messaging/consumers.py", "Consumer WebSocket"),
            ("app/messaging/middleware.py", "Middleware JWT"),
            ("config/asgi.py", "Configuration ASGI"),
        ]

        for file_path, description in files_to_check:
            full_path = os.path.join(settings.BASE_DIR, file_path)
            if os.path.exists(full_path):
                self.stdout.write(
                    self.style.SUCCESS(f"  ✅ {description}: {file_path}")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"  ❌ {description} MANQUANT: {file_path}")
                )

        # 5. Vérifier WEBSOCKET_URL
        self.stdout.write("\n🌐 Configuration URLs:")
        if hasattr(settings, "WEBSOCKET_URL"):
            self.stdout.write(
                self.style.SUCCESS(f"  ✅ WEBSOCKET_URL: {settings.WEBSOCKET_URL}")
            )
        else:
            self.stdout.write(
                self.style.WARNING("  ⚠️  WEBSOCKET_URL non défini (optionnel)")
            )

        # 6. Instructions pour tester
        self.stdout.write("\n📋 INSTRUCTIONS DE TEST:\n")
        self.stdout.write("1. Démarrer le serveur avec Daphne ou Uvicorn:")
        self.stdout.write("   daphne -b 0.0.0.0 -p 8000 config.asgi:application")
        self.stdout.write("   OU")
        self.stdout.write(
            "   uvicorn config.asgi:application --host 0.0.0.0 --port 8000"
        )
        self.stdout.write("")
        self.stdout.write("2. Tester la connexion WebSocket depuis le navigateur:")
        self.stdout.write("   - Ouvrir la console DevTools")
        self.stdout.write("   - Vérifier les requêtes WebSocket dans Network > WS")
        self.stdout.write(
            "   - URL attendue: ws://localhost:8000/ws/chat/group/{id}/?token=..."
        )
        self.stdout.write("")
        self.stdout.write("3. Vérifier les logs Django pour les erreurs de connexion")

        self.stdout.write(self.style.SUCCESS("\n✅ Vérification terminée!\n"))
