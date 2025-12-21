"""
apps/users/tests/test_auth.py
Tests pour l'authentification (register, login, google_auth)
"""

from django.contrib.auth import get_user_model

import pytest
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Tests pour l'inscription d'utilisateurs"""

    def test_register_success(self, api_client, user_data, role_user):
        """Test inscription réussie"""
        url = "/api/v1/users/register/"
        response = api_client.post(url, user_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["user"]["email"] == user_data["email"]
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]

        # Vérifier que l'utilisateur existe en DB
        assert User.objects.filter(email=user_data["email"]).exists()

    def test_register_missing_email(self, api_client, user_data):
        """Test inscription sans email"""
        url = "/api/v1/users/register/"
        data = user_data.copy()
        del data["email"]

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in str(response.data).lower()

    def test_register_missing_password(self, api_client, user_data):
        """Test inscription sans mot de passe"""
        url = "/api/v1/users/register/"
        data = user_data.copy()
        del data["password"]

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client, user_data):
        """Test inscription avec mots de passe différents"""
        url = "/api/v1/users/register/"
        data = user_data.copy()
        data["password_confirm"] = "DifferentPassword123!"

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in str(response.data).lower()

    def test_register_weak_password(self, api_client, user_data):
        """Test inscription avec mot de passe faible"""
        url = "/api/v1/users/register/"
        data = user_data.copy()
        data["password"] = "123"
        data["password_confirm"] = "123"

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_duplicate_email(self, api_client, user_data, user):
        """Test inscription avec email déjà existant"""
        url = "/api/v1/users/register/"
        data = user_data.copy()
        data["email"] = user.email

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_invalid_email(self, api_client, user_data):
        """Test inscription avec email invalide"""
        url = "/api/v1/users/register/"
        data = user_data.copy()
        data["email"] = "invalid-email"

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Tests pour la connexion d'utilisateurs"""

    def test_login_success(self, api_client, user):
        """Test connexion réussie"""
        url = "/api/v1/users/login/"
        data = {"email": user.email, "password": "TestPassword123!"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["user"]["email"] == user.email

    def test_login_wrong_password(self, api_client, user):
        """Test connexion avec mauvais mot de passe"""
        url = "/api/v1/users/login/"
        data = {"email": user.email, "password": "WrongPassword123!"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "incorrect" in str(response.data).lower()

    def test_login_nonexistent_user(self, api_client):
        """Test connexion avec utilisateur inexistant"""
        url = "/api/v1/users/login/"
        data = {"email": "nonexistent@example.com", "password": "TestPassword123!"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "non trouvé" in str(response.data).lower()

    def test_login_inactive_user(self, api_client, inactive_user):
        """Test connexion avec utilisateur désactivé"""
        url = "/api/v1/users/login/"
        data = {"email": inactive_user.email, "password": "TestPassword123!"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "désactivé" in str(response.data).lower()

    def test_login_missing_email(self, api_client):
        """Test connexion sans email"""
        url = "/api/v1/users/login/"
        data = {"password": "TestPassword123!"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_password(self, api_client, user):
        """Test connexion sans mot de passe"""
        url = "/api/v1/users/login/"
        data = {"email": user.email}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestGoogleAuth:
    """Tests pour l'authentification Google OAuth"""

    def test_google_auth_new_user(
        self, api_client, mock_google_oauth, google_user_data
    ):
        """Test Google OAuth avec nouvel utilisateur"""
        url = "/api/v1/users/google_auth/"
        data = {"access_token": "fake_google_token"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["is_new_user"] is True
        assert response.data["redirect_url"] == "/preferences/"
        assert response.data["user"]["email"] == google_user_data["email"]

        # Vérifier création utilisateur
        user = User.objects.get(email=google_user_data["email"])
        assert user.email_verified is True
        assert user.first_name == google_user_data["given_name"]
        assert user.last_name == google_user_data["family_name"]

    def test_google_auth_existing_user(
        self, api_client, user, mock_google_oauth, google_user_data
    ):
        """Test Google OAuth avec utilisateur existant"""
        # Modifier les données Google pour correspondre à l'utilisateur existant
        google_user_data["email"] = user.email

        url = "/api/v1/users/google_auth/"
        data = {"access_token": "fake_google_token"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_new_user"] is False
        assert response.data["redirect_url"] == "/#hero"
        assert response.data["user"]["email"] == user.email

    def test_google_auth_missing_token(self, api_client):
        """Test Google OAuth sans token"""
        url = "/api/v1/users/google_auth/"
        data = {}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "token" in str(response.data).lower()

    def test_google_auth_invalid_token(self, api_client, mocker):
        """Test Google OAuth avec token invalide"""
        # Mock réponse Google invalide
        mock_response = mocker.Mock()
        mock_response.status_code = 401
        mocker.patch("requests.get", return_value=mock_response)

        url = "/api/v1/users/google_auth/"
        data = {"access_token": "invalid_token"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalide" in str(response.data).lower()

    def test_google_auth_incomplete_data(self, api_client, mocker):
        """Test Google OAuth avec données incomplètes"""
        # Mock réponse Google sans email
        mock_response = mocker.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"sub": "123456"}
        mocker.patch("requests.get", return_value=mock_response)

        url = "/api/v1/users/google_auth/"
        data = {"access_token": "fake_token"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "incomplètes" in str(response.data).lower()

    def test_google_auth_request_exception(self, api_client, mocker):
        """Test Google OAuth avec erreur réseau"""
        import requests

        mocker.patch(
            "requests.get", side_effect=requests.RequestException("Network error")
        )

        url = "/api/v1/users/google_auth/"
        data = {"access_token": "fake_token"}

        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "erreur" in str(response.data).lower()
