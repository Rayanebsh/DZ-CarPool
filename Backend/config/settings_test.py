"""
Configuration Django spécifique pour les tests
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Charger le fichier .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

# Importer les settings de base
from .settings import *  # noqa: F403, F401, E402

# ==================== CONFIGURATION BASE DE DONNÉES ====================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "test_dzcarpool",
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
        "TEST": {
            "NAME": "test_dzcarpool",
        },
    }
}

# ==================== GARDER ALLAUTH MAIS SIMPLIFIER ====================
# Ne PAS retirer allauth des INSTALLED_APPS
# Les INSTALLED_APPS sont déjà définis dans settings.py

# Garder tous les middleware (requis pour allauth)
# Les MIDDLEWARE sont déjà définis dans settings.py

# ==================== DÉSACTIVER LA VÉRIFICATION EMAIL ====================
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_EMAIL_REQUIRED = False

# ==================== DÉSACTIVER LES SIGNAUX POUR LES TESTS ====================
TESTING = True  # ← Ajoutez cette ligne

# ==================== CONFIGURATION CACHE ====================
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
}

# ==================== CONFIGURATION EMAIL ====================
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# ==================== CONFIGURATION SESSION ====================
SESSION_ENGINE = "django.contrib.sessions.backends.db"

# ==================== HASHER RAPIDE ====================
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# ==================== LOGGING MINIMAL ====================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
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

# ==================== DÉSACTIVER DEBUG ====================
DEBUG = False
TEMPLATE_DEBUG = False

# ==================== MESSAGES ====================
print("=" * 80)
print("✅ TEST SETTINGS LOADED")
print(f"📊 Database: {DATABASES['default']['NAME']}")
print(f"👤 DB User: {DATABASES['default']['USER']}")
db_password = DATABASES['default']['PASSWORD']
password_display = '*' * len(db_password) if db_password else 'NONE'
print(f"🔐 DB Password: {password_display}")
print(f"🗄️  Cache: {CACHES['default']['BACKEND']}")
print(f"📧 Email: {EMAIL_BACKEND}")
print("🔐 Allauth: ENABLED (simplified)")
print("🔕 Signals: DISABLED for testing")
print("=" * 80)