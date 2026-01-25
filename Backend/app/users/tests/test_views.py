"""
Tests COMPLETS pour app/users/views.py
Objectif: Atteindre 90%+ de couverture
Placer dans: app/users/tests/test_views.py
"""

from datetime import timedelta
from io import BytesIO
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone

from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app.users.models import (
    EmailVerification,
    PhoneVerification,
    Preference,
    UserDocument,
)

User = get_user_model()


def create_test_image():
    """Créer une image de test"""
    file = BytesIO()
    image = Image.new("RGB", (100, 100), color="red")
    image.save(file, "JPEG")
    file.seek(0)
    return SimpleUploadedFile(
        "test_image.jpg", file.getvalue(), content_type="image/jpeg"
    )


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class UserRegistrationTests(APITestCase):
    """Tests pour l'inscription"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/v1/users/register/"

    def test_register_success(self):
        """Test inscription réussie"""
        data = {
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.client.post(self.register_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertIn("tokens", response.data)
        self.assertTrue(response.data["is_new_user"])
        self.assertEqual(response.data["redirect_url"], "/preferences")

    def test_register_with_phone(self):
        """Test inscription avec numéro de téléphone"""
        data = {
            "email": "user@example.com",
            "password": "Pass123!",
            "password_confirm": "Pass123!",
            "phone_number": "+213555123456",
        }

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email=data["email"])
        self.assertEqual(user.phone_number, data["phone_number"])

    def test_register_password_mismatch(self):
        """Test mots de passe différents"""
        data = {
            "email": "user@example.com",
            "password": "Pass123!",
            "password_confirm": "Different123!",
        }

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        """Test mot de passe faible"""
        data = {
            "email": "user@example.com",
            "password": "123",
            "password_confirm": "123",
        }

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Test email existant"""
        User.objects.create_user(email="existing@example.com", password="pass123")

        data = {
            "email": "existing@example.com",
            "password": "Pass123!",
            "password_confirm": "Pass123!",
        }

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class UserLoginTests(APITestCase):
    """Tests pour la connexion"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = "/api/v1/users/login/"
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            is_active=True,
        )

        # Créer des préférences pour tester la redirection
        self.preference = Preference.objects.create(
            name="Musique",
            name_fr="Musique",
            name_en="Music",
            category="interests",
        )

    def test_login_success(self):
        """Test connexion réussie"""
        data = {"email": "test@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertFalse(response.data["is_new_user"])

    def test_login_with_preferences(self):
        """Test connexion avec préférences configurées"""
        self.user.preferences.add(self.preference)

        data = {"email": "test@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["has_preferences"])
        self.assertEqual(response.data["redirect_url"], "/#hero")

    def test_login_without_preferences(self):
        """Test connexion sans préférences"""
        data = {"email": "test@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["has_preferences"])
        self.assertEqual(response.data["redirect_url"], "/preferences")

    def test_login_wrong_password(self):
        """Test mauvais mot de passe"""
        data = {"email": "test@example.com", "password": "wrongpass"}

        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_user_not_found(self):
        """Test utilisateur inexistant"""
        data = {"email": "nonexistent@example.com", "password": "pass"}

        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_login_inactive_user(self):
        """Test compte désactivé"""
        self.user.is_active = False
        self.user.save()

        data = {"email": "test@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_missing_email(self):
        """Test sans email"""
        data = {"password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_password(self):
        """Test sans mot de passe"""
        data = {"email": "test@example.com"}

        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class GoogleAuthTests(APITestCase):
    """Tests pour Google OAuth"""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/users/google_auth/"

    @patch("app.users.views.requests.get")
    def test_google_auth_new_user(self, mock_get):
        """Test nouvel utilisateur Google"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "sub": "google123",
            "email": "newuser@gmail.com",
            "given_name": "John",
            "family_name": "Doe",
        }
        mock_get.return_value = mock_response

        data = {"access_token": "valid_token"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_new_user"])
        self.assertEqual(response.data["redirect_url"], "/preferences")

        user = User.objects.get(email="newuser@gmail.com")
        self.assertTrue(user.email_verified)

    @patch("app.users.views.requests.get")
    def test_google_auth_existing_social_account(self, mock_get):
        """Test utilisateur Google existant"""
        from allauth.socialaccount.models import SocialAccount

        user = User.objects.create_user(email="existing@gmail.com", password="pass")
        SocialAccount.objects.create(
            user=user, provider="google", uid="google123", extra_data={}
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "sub": "google123",
            "email": "existing@gmail.com",
        }
        mock_get.return_value = mock_response

        data = {"access_token": "token"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_new_user"])

    @patch("app.users.views.requests.get")
    def test_google_auth_link_account(self, mock_get):
        """Test liaison compte existant"""
        user = User.objects.create_user(email="existing@gmail.com", password="pass")

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "sub": "newgoogle456",
            "email": "existing@gmail.com",
        }
        mock_get.return_value = mock_response

        data = {"access_token": "token"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        from allauth.socialaccount.models import SocialAccount

        self.assertTrue(
            SocialAccount.objects.filter(user=user, uid="newgoogle456").exists()
        )

    def test_google_auth_missing_token(self):
        """Test sans token"""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("app.users.views.requests.get")
    def test_google_auth_invalid_token(self, mock_get):
        """Test token invalide"""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response

        data = {"access_token": "invalid"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("app.users.views.requests.get")
    def test_google_auth_missing_email(self, mock_get):
        """Test données Google incomplètes"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"sub": "google123"}  # Pas d'email
        mock_get.return_value = mock_response

        data = {"access_token": "token"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("app.users.views.requests.get")
    def test_google_auth_request_exception(self, mock_get):
        """Test erreur de communication"""
        import requests

        mock_get.side_effect = requests.RequestException("Network error")

        data = {"access_token": "token"}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class UserProfileTests(APITestCase):
    """Tests pour le profil"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="pass", first_name="John"
        )
        self.client.force_authenticate(user=self.user)

    def test_get_me(self):
        """Test récupération profil"""
        response = self.client.get("/api/v1/users/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertIn("has_preferences", response.data)

    def test_update_profile_basic(self):
        """Test mise à jour basique"""
        data = {"first_name": "Jane", "last_name": "Smith", "bio": "New bio"}

        response = self.client.put("/api/v1/users/update_profile/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Jane")
        self.assertEqual(self.user.bio, "New bio")

    def test_update_profile_with_image(self):
        """Test avec image"""
        image = create_test_image()

        data = {"profile_picture": image, "first_name": "Test"}

        response = self.client.put(
            "/api/v1/users/update_profile/", data, format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.profile_picture)

    def test_update_profile_partial(self):
        """Test mise à jour partielle"""
        response = self.client.patch(
            "/api/v1/users/update_profile/", {"bio": "Updated"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_check_preferences_endpoint(self):
        """Test vérification préférences"""
        response = self.client.get("/api/v1/users/check_preferences/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("has_preferences", response.data)
        self.assertIn("redirect_url", response.data)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class PreferencesTests(APITestCase):
    """Tests pour les préférences"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="test@example.com", password="pass")
        self.client.force_authenticate(user=self.user)

        # Créer des préférences de test
        self.pref1 = Preference.objects.create(
            name="Musique",
            name_fr="Musique",
            name_en="Music",
            category="interests",
        )
        self.pref2 = Preference.objects.create(
            name="Sport", name_fr="Sport", name_en="Sport", category="interests"
        )

    def test_get_all_preferences(self):
        """Test récupération toutes les préférences"""
        response = self.client.get("/api/v1/users/preferences/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_my_preferences(self):
        """Test mes préférences"""
        self.user.preferences.add(self.pref1)

        response = self.client.get("/api/v1/users/my_preferences/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertTrue(response.data["has_preferences"])


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EmailVerificationTests(APITestCase):
    """Tests vérification email"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="pass", email_verified=False
        )
        self.client.force_authenticate(user=self.user)

    @patch("app.users.views.EmailService.send_verification_code")
    def test_send_verification(self, mock_send):
        """Test envoi code"""
        mock_send.return_value = True

        response = self.client.post("/api/v1/users/send-email-verification/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(EmailVerification.objects.filter(user=self.user).exists())

    def test_send_already_verified(self):
        """Test déjà vérifié"""
        self.user.email_verified = True
        self.user.save()

        response = self.client.post("/api/v1/users/send-email-verification/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("app.users.views.EmailService.send_verification_code")
    def test_send_verification_email_fails(self, mock_send):
        mock_send.return_value = False

        response = self.client.post("/api/v1/users/send-email-verification/")
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_verify_email_success(self):
        """Test vérification réussie"""
        verification = EmailVerification.objects.create(user=self.user)

        response = self.client.post(
            "/api/v1/users/verify-email/", {"code": verification.code}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)

    def test_verify_invalid_code(self):
        """Test code invalide"""
        response = self.client.post(
            "/api/v1/users/verify-email/", {"code": "000000"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_expired_code(self):
        """Test code expiré"""
        verification = EmailVerification.objects.create(user=self.user)
        verification.expires_at = timezone.now() - timedelta(hours=1)
        verification.save()

        response = self.client.post(
            "/api/v1/users/verify-email/", {"code": verification.code}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_max_attempts(self):
        """Test tentatives maximales"""
        verification = EmailVerification.objects.create(user=self.user)
        verification.attempts = 3
        verification.save()

        response = self.client.post(
            "/api/v1/users/verify-email/", {"code": verification.code}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class PhoneVerificationTests(APITestCase):
    """Tests vérification téléphone"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            password="pass",
            phone_number="+213555123456",
            phone_verified=False,
        )
        self.client.force_authenticate(user=self.user)

    @patch("app.users.views.SMSService.send_verification_code")
    def test_send_phone_verification(self, mock_send):
        """Test envoi SMS"""
        mock_send.return_value = True

        response = self.client.post("/api/v1/users/send-phone-verification/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_send_already_verified(self):
        """Test téléphone déjà vérifié"""
        self.user.phone_verified = True
        self.user.save()

        response = self.client.post("/api/v1/users/send-phone-verification/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_no_phone(self):
        """Test sans numéro"""
        self.user.phone_number = ""
        self.user.save()

        response = self.client.post("/api/v1/users/send-phone-verification/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("app.users.views.SMSService.send_verification_code")
    def test_send_sms_fails(self, mock_send):
        """Test échec envoi SMS"""
        mock_send.return_value = False

        response = self.client.post("/api/v1/users/send-phone-verification/")
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_verify_phone_success(self):
        """Test vérification réussie"""
        verification = PhoneVerification.objects.create(user=self.user)

        response = self.client.post(
            "/api/v1/users/verify-phone/", {"code": verification.code}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.phone_verified)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class DocumentTests(APITestCase):
    """Tests documents"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="test@example.com", password="pass")
        self.client.force_authenticate(user=self.user)

    def test_upload_document(self):
        """Test upload document"""
        file = create_test_image()

        data = {"document_type": "CNI", "file_path": file}

        response = self.client.post(
            "/api/v1/users/upload_document/", data, format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_documents(self):
        """Test liste documents"""
        UserDocument.objects.create(user=self.user, document_type="CNI", verified=True)

        response = self.client.get("/api/v1/users/documents/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_check_document_status_verified(self):
        """Test statut avec document vérifié"""
        UserDocument.objects.create(user=self.user, document_type="CNI", verified=True)

        response = self.client.get("/api/v1/users/check-document-status/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["can_publish_trip"])
        self.assertTrue(response.data["has_verified_document"])

    def test_check_document_status_pending(self):
        """Test statut avec document en attente"""
        UserDocument.objects.create(user=self.user, document_type="CNI", verified=False)

        response = self.client.get("/api/v1/users/check-document-status/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["can_publish_trip"])
        self.assertEqual(response.data["pending_documents_count"], 1)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class VerificationStatusTests(APITestCase):
    """Tests statut vérification"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            password="pass",
            email_verified=True,
            phone_verified=False,
        )
        self.client.force_authenticate(user=self.user)

    def test_verification_status(self):
        """Test récupération statut"""
        response = self.client.get("/api/v1/users/verification-status/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["email_verified"])
        self.assertFalse(response.data["phone_verified"])
        self.assertEqual(response.data["email"], self.user.email)
