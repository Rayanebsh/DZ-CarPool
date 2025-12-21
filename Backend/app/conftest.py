"""
apps/users/conftest.py
Fixtures réutilisables pour les tests d'authentification
"""

from django.contrib.auth import get_user_model

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from app.users.models import (
    EmailVerification,
    PhoneVerification,
    Preference,
    Role,
    UserDocument,
)

User = get_user_model()


# ============================================
# FIXTURES DE BASE
# ============================================


@pytest.fixture
def api_client():
    """Client API non authentifié"""
    return APIClient()


@pytest.fixture
def authenticated_client(user):
    """Client API authentifié avec un utilisateur"""
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


# ============================================
# FIXTURES UTILISATEURS
# ============================================


@pytest.fixture
def user_data():
    """Données valides pour créer un utilisateur"""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "+213555123456",
    }


@pytest.fixture
def user(db, role_user):
    """Utilisateur simple sans vérifications"""
    return User.objects.create_user(
        email="user@example.com",
        password="TestPassword123!",
        first_name="John",
        last_name="Doe",
        phone_number="+213555111111",
        role=role_user,
    )


@pytest.fixture
def verified_user(db, role_user):
    """Utilisateur avec email et téléphone vérifiés"""
    from django.utils import timezone

    user = User.objects.create_user(
        email="verified@example.com",
        password="TestPassword123!",
        first_name="Verified",
        last_name="User",
        phone_number="+213555222222",
        email_verified=True,
        email_verified_at=timezone.now(),
        phone_verified=True,
        phone_verified_at=timezone.now(),
        role=role_user,
    )
    return user


@pytest.fixture
def admin_user(db, role_admin):
    """Utilisateur administrateur"""
    return User.objects.create_superuser(
        email="admin@example.com",
        password="AdminPassword123!",
        first_name="Admin",
        last_name="User",
        role=role_admin,
    )


@pytest.fixture
def inactive_user(db, role_user):
    """Utilisateur désactivé"""
    user = User.objects.create_user(
        email="inactive@example.com",
        password="TestPassword123!",
        first_name="Inactive",
        last_name="User",
        role=role_user,
    )
    user.is_active = False
    user.save()
    return user


# ============================================
# FIXTURES ROLES ET PREFERENCES
# ============================================


@pytest.fixture
def role_user(db):
    """Rôle utilisateur standard"""
    role, _ = Role.objects.get_or_create(
        name="USER", defaults={"description": "Utilisateur standard"}
    )
    return role


@pytest.fixture
def role_driver(db):
    """Rôle conducteur"""
    role, _ = Role.objects.get_or_create(
        name="DRIVER", defaults={"description": "Conducteur"}
    )
    return role


@pytest.fixture
def role_admin(db):
    """Rôle administrateur"""
    role, _ = Role.objects.get_or_create(
        name="ADMIN", defaults={"description": "Administrateur"}
    )
    return role


@pytest.fixture
def preferences(db):
    """Liste de préférences de trajet"""
    prefs = []
    pref_data = [
        ("NO_SMOKING", "Non fumeur"),
        ("MUSIC", "Musique autorisée"),
        ("PETS_ALLOWED", "Animaux acceptés"),
        ("SILENT_RIDE", "Trajet silencieux"),
    ]
    for name, desc in pref_data:
        pref, _ = Preference.objects.get_or_create(
            name=name, defaults={"description": desc}
        )
        prefs.append(pref)
    return prefs


# ============================================
# FIXTURES VERIFICATION
# ============================================


@pytest.fixture
def email_verification(user):
    """Code de vérification email valide"""
    return EmailVerification.objects.create(user=user)


@pytest.fixture
def expired_email_verification(user):
    """Code de vérification email expiré"""
    from datetime import timedelta

    from django.utils import timezone

    verification = EmailVerification.objects.create(user=user)
    verification.expires_at = timezone.now() - timedelta(hours=1)
    verification.save()
    return verification


@pytest.fixture
def phone_verification(user):
    """Code de vérification téléphone valide"""
    return PhoneVerification.objects.create(user=user)


@pytest.fixture
def expired_phone_verification(user):
    """Code de vérification téléphone expiré"""
    from datetime import timedelta

    from django.utils import timezone

    verification = PhoneVerification.objects.create(user=user)
    verification.expires_at = timezone.now() - timedelta(hours=1)
    verification.save()
    return verification


# ============================================
# FIXTURES DOCUMENTS
# ============================================


@pytest.fixture
def user_document(user):
    """Document utilisateur non vérifié"""
    from django.core.files.uploadedfile import SimpleUploadedFile

    fake_file = SimpleUploadedFile(
        "test_document.pdf", b"file_content", content_type="application/pdf"
    )

    return UserDocument.objects.create(
        user=user, document_type="CNI", file_path=fake_file
    )


@pytest.fixture
def verified_document(user, admin_user):
    """Document utilisateur vérifié"""
    from django.core.files.uploadedfile import SimpleUploadedFile
    from django.utils import timezone

    fake_file = SimpleUploadedFile(
        "verified_document.pdf", b"file_content", content_type="application/pdf"
    )

    return UserDocument.objects.create(
        user=user,
        document_type="PERMIS",
        file_path=fake_file,
        verified=True,
        verified_by=admin_user,
        verified_at=timezone.now(),
    )


# ============================================
# FIXTURES GOOGLE OAUTH
# ============================================


@pytest.fixture
def google_user_data():
    """Données utilisateur retournées par Google OAuth"""
    return {
        "sub": "123456789",
        "email": "google.user@gmail.com",
        "given_name": "Google",
        "family_name": "User",
        "picture": "https://example.com/photo.jpg",
        "email_verified": True,
    }


@pytest.fixture
def mock_google_response(google_user_data):
    """Mock de la réponse de l'API Google"""

    class MockResponse:
        status_code = 200

        def json(self):
            return google_user_data

    return MockResponse()


# ============================================
# FIXTURES MOCKING SERVICES
# ============================================


@pytest.fixture
def mock_email_service(mocker):
    """Mock du service d'envoi d'email"""
    return mocker.patch(
        "app.users.services.EmailService.send_verification_code", return_value=True
    )


@pytest.fixture
def mock_sms_service(mocker):
    """Mock du service d'envoi de SMS"""
    return mocker.patch(
        "app.users.services.SMSService.send_verification_code", return_value=True
    )


@pytest.fixture
def mock_google_oauth(mocker, mock_google_response):
    """Mock de l'authentification Google OAuth"""
    return mocker.patch("requests.get", return_value=mock_google_response)


# ============================================
# FIXTURES TOKENS JWT
# ============================================


@pytest.fixture
def jwt_tokens(user):
    """Génère des tokens JWT pour un utilisateur"""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@pytest.fixture
def expired_token(user):
    """Génère un token JWT expiré"""
    from datetime import timedelta

    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(user)
    # Modifier le temps d'expiration pour qu'il soit dans le passé
    refresh.access_token.set_exp(lifetime=timedelta(seconds=-10))
    return str(refresh.access_token)
