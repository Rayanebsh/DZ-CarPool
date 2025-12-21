"""
Tests pour app/users/views.py - VERSION CORRIGÉE
Placer dans: app/users/tests/test_views.py
"""

from datetime import timedelta
from unittest.mock import MagicMock, patch

from app.users.models import EmailVerification, PhoneVerification
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="test@dzcarpool.com",
)
class UserRegistrationTests(APITestCase):
    """Tests pour l'inscription d'utilisateurs"""

    def setUp(self):
        self.client = APIClient()
        # CORRECTION: Utiliser /api/v1/ au lieu de /api/
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
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])

        user = User.objects.get(email=data["email"])
        self.assertEqual(user.first_name, data["first_name"])
        self.assertEqual(user.last_name, data["last_name"])

    def test_register_password_mismatch(self):
        """Test inscription avec mots de passe différents"""
        data = {
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "password_confirm": "DifferentPass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Test inscription avec email existant"""
        User.objects.create_user(email="existing@example.com", password="testpass123")

        data = {
            "email": "existing@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_required_fields(self):
        """Test inscription avec champs manquants"""
        data = {"email": "newuser@example.com"}

        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class UserLoginTests(APITestCase):
    """Tests pour la connexion d'utilisateurs"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = "/api/v1/users/login/"
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="John",
            is_active=True,
        )

    def test_login_success(self):
        """Test connexion réussie"""
        data = {"email": "test@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        self.assertIn("tokens", response.data)
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_login_wrong_password(self):
        """Test connexion avec mauvais mot de passe"""
        data = {"email": "test@example.com", "password": "wrongpassword"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

    def test_login_user_not_found(self):
        """Test connexion avec utilisateur inexistant"""
        data = {"email": "nonexistent@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_login_inactive_user(self):
        """Test connexion avec compte désactivé"""
        self.user.is_active = False
        self.user.save()

        data = {"email": "test@example.com", "password": "testpass123"}

        response = self.client.post(self.login_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_missing_credentials(self):
        """Test connexion sans identifiants"""
        response = self.client.post(self.login_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class GoogleAuthTests(APITestCase):
    """Tests pour l'authentification Google OAuth"""

    def setUp(self):
        self.client = APIClient()
        self.google_auth_url = "/api/v1/users/google_auth/"

    @patch("app.users.views.requests.get")
    def test_google_auth_new_user(self, mock_get):
        """Test authentification Google avec nouvel utilisateur"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "sub": "google123",
            "email": "newuser@gmail.com",
            "given_name": "John",
            "family_name": "Doe",
        }
        mock_get.return_value = mock_response

        data = {"access_token": "valid_google_token"}
        response = self.client.post(self.google_auth_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        self.assertIn("tokens", response.data)
        self.assertTrue(response.data["is_new_user"])
        self.assertEqual(response.data["redirect_url"], "/preferences/")

        user = User.objects.get(email="newuser@gmail.com")
        self.assertTrue(user.email_verified)
        self.assertEqual(user.first_name, "John")

    @patch("app.users.views.requests.get")
    def test_google_auth_existing_user(self, mock_get):
        """Test authentification Google avec utilisateur existant"""
        from allauth.socialaccount.models import SocialAccount

        user = User.objects.create_user(
            email="existing@gmail.com", password="testpass123"
        )
        SocialAccount.objects.create(
            user=user, provider="google", uid="google123", extra_data={}
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "sub": "google123",
            "email": "existing@gmail.com",
            "given_name": "John",
            "family_name": "Doe",
        }
        mock_get.return_value = mock_response

        data = {"access_token": "valid_google_token"}
        response = self.client.post(self.google_auth_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_new_user"])
        self.assertEqual(response.data["redirect_url"], "/#hero")

    @patch("app.users.views.requests.get")
    def test_google_auth_link_existing_email(self, mock_get):
        """Test liaison compte Google à utilisateur existant"""
        from allauth.socialaccount.models import SocialAccount

        user = User.objects.create_user(
            email="existing@gmail.com", password="testpass123"
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "sub": "newgoogle456",
            "email": "existing@gmail.com",
            "given_name": "John",
            "family_name": "Doe",
        }
        mock_get.return_value = mock_response

        data = {"access_token": "valid_google_token"}
        response = self.client.post(self.google_auth_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        social_account = SocialAccount.objects.get(user=user, provider="google")
        self.assertEqual(social_account.uid, "newgoogle456")

    def test_google_auth_missing_token(self):
        """Test authentification Google sans token"""
        response = self.client.post(self.google_auth_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("app.users.views.requests.get")
    def test_google_auth_invalid_token(self, mock_get):
        """Test authentification Google avec token invalide"""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response

        data = {"access_token": "invalid_token"}
        response = self.client.post(self.google_auth_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class UserProfileTests(APITestCase):
    """Tests pour la gestion du profil utilisateur"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123", first_name="John"
        )
        self.client.force_authenticate(user=self.user)
        self.me_url = "/api/v1/users/me/"
        self.update_url = "/api/v1/users/update_profile/"

    def test_get_user_profile(self):
        """Test récupération du profil"""
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_update_user_profile(self):
        """Test mise à jour du profil"""
        data = {"first_name": "Jane", "last_name": "Smith"}

        response = self.client.put(self.update_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Jane")
        self.assertEqual(self.user.last_name, "Smith")

    def test_get_profile_unauthenticated(self):
        """Test accès profil sans authentification"""
        self.client.force_authenticate(user=None)

        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class ChangePasswordTests(APITestCase):
    """Tests pour le changement de mot de passe"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="oldpassword123"
        )
        self.client.force_authenticate(user=self.user)
        self.url = "/api/v1/users/change_password/"

    def test_change_password_success(self):
        """Test changement de mot de passe réussi"""
        data = {
            "old_password": "oldpassword123",
            "new_password": "NewStrongPass123!",
            "new_password_confirm": "NewStrongPass123!",
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrongPass123!"))

    def test_change_password_wrong_old_password(self):
        """Test changement avec mauvais ancien mot de passe"""
        data = {
            "old_password": "wrongpassword",
            "new_password": "NewStrongPass123!",
            "new_password_confirm": "NewStrongPass123!",
        }

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EmailVerificationTests(APITestCase):
    """Tests pour la vérification d'email"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123", email_verified=False
        )
        self.client.force_authenticate(user=self.user)
        self.send_url = "/api/v1/users/send_email_verification/"
        self.verify_url = "/api/v1/users/verify_email/"

    @patch("app.users.views.EmailService.send_verification_code")
    def test_send_email_verification(self, mock_send):
        """Test envoi code de vérification email"""
        mock_send.return_value = True
        response = self.client.post(self.send_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(EmailVerification.objects.filter(user=self.user).exists())

    def test_send_email_verification_already_verified(self):
        """Test envoi code quand email déjà vérifié"""
        self.user.email_verified = True
        self.user.save()

        response = self.client.post(self.send_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email_success(self):
        """Test vérification email réussie"""
        verification = EmailVerification.objects.create(user=self.user)

        data = {"code": verification.code}

        response = self.client.post(self.verify_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)

    def test_verify_email_invalid_code(self):
        """Test vérification avec code invalide"""
        data = {"code": "000000"}

        response = self.client.post(self.verify_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email_expired_code(self):
        """Test vérification avec code expiré"""
        verification = EmailVerification.objects.create(user=self.user)
        verification.expires_at = timezone.now() - timedelta(hours=1)
        verification.save()

        data = {"code": verification.code}

        response = self.client.post(self.verify_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email_max_attempts(self):
        """Test vérification avec trop de tentatives"""
        data = {"code": "wrongcode"}

        # 3 tentatives
        for _ in range(3):
            self.client.post(self.verify_url, data, format="json")

        response = self.client.post(self.verify_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class PhoneVerificationTests(APITestCase):
    """Tests pour la vérification de téléphone"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            phone_number="+213555123456",
            phone_verified=False,
        )
        self.client.force_authenticate(user=self.user)
        self.send_url = "/api/v1/users/send_phone_verification/"
        self.verify_url = "/api/v1/users/verify_phone/"
        self.status_url = "/api/v1/users/verification_status/"

    @patch("app.users.views.SMSService.send_verification_code")
    def test_send_phone_verification(self, mock_send):
        """Test envoi code de vérification SMS"""
        mock_send.return_value = True
        response = self.client.post(self.send_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(PhoneVerification.objects.filter(user=self.user).exists())

    def test_send_phone_verification_no_phone_number(self):
        """Test envoi SMS sans numéro"""
        # Créer un nouvel utilisateur sans numéro de téléphone
        user_no_phone = User.objects.create_user(
            email="nophone@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=user_no_phone)

        response = self.client.post(self.send_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_phone_success(self):
        """Test vérification téléphone réussie"""
        verification = PhoneVerification.objects.create(user=self.user)

        data = {"code": verification.code}

        response = self.client.post(self.verify_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.phone_verified)

    def test_verification_status(self):
        """Test récupération du statut de vérification"""
        response = self.client.get(self.status_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("email_verified", response.data)
        self.assertIn("phone_verified", response.data)
