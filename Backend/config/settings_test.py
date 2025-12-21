"""
Configuration Django spécifique pour les tests
"""

import os

from .settings import DATABASES, MIDDLEWARE

# Désactiver le mode debug en test (sauf si explicitement activé)
DEBUG = os.getenv("DEBUG", "False") == "True"
# TOUJOURS utiliser le cache en mémoire pour les tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
}

# Session en base de données pour les tests
SESSION_ENGINE = "django.contrib.sessions.backends.db"

# Email backend pour les tests
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Hasher de mot de passe rapide pour les tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Désactiver les migrations pour accélérer les tests (optionnel)
# class DisableMigrations:
#     def __contains__(self, item):
#         return True
#     def __getitem__(self, item):
#         return None
# MIGRATION_MODULES = DisableMigrations()

# Logging minimal en test
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "ERROR",
    },
}

# Désactiver les middleware non essentiels pour les tests
MIDDLEWARE = [m for m in MIDDLEWARE if "SecurityMiddleware" not in m]

print("✅ Test settings loaded - Using in-memory cache")
print(f"📊 Database: {DATABASES['default']['NAME']}")
print(f"🗄️  Cache backend: {CACHES['default']['BACKEND']}")
