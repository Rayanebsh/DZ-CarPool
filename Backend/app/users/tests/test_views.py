# ============================================================================
# apps/users/tests/test_views.py
# ============================================================================

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestUserRegistration:
    """Tests pour l'inscription"""

    def test_register_user_success(self, api_client, user_role):
        """Test d'inscription réussie"""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123",
            "password_confirm": "SecurePass123",
            "first_name": "New",
            "last_name": "User",
        }
        response = api_client.post("/api/users/register/", data)

        assert response.status_code == status.HTTP_201_CREATED
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["user"]["email"] == "newuser@example.com"

    def test_register_user_password_mismatch(self, api_client, user_role):
        """Test d'inscription avec mots de passe différents"""
        data = {
            "email": "test@example.com",
            "password": "password123",
            "password_confirm": "different123",
            "first_name": "Test",
            "last_name": "User",
        }
        response = api_client.post("/api/users/register/", data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_duplicate_email(self, api_client, user, user_role):
        """Test d'inscription avec email existant"""
        data = {
            "email": user.email,
            "password": "password123",
            "password_confirm": "password123",
            "first_name": "Test",
            "last_name": "User",
        }
        response = api_client.post("/api/users/register/", data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Tests pour la connexion"""

    def test_login_success(self, api_client, user):
        """Test de connexion réussie"""
        data = {"email": "test@example.com", "password": "testpass123"}
        response = api_client.post("/api/users/login/", data)

        assert response.status_code == status.HTTP_200_OK
        assert "tokens" in response.data
        assert "access" in response.data["tokens"]

    def test_login_invalid_credentials(self, api_client, user):
        """Test de connexion avec mauvais identifiants"""
        data = {"email": "test@example.com", "password": "wrongpassword"}
        response = api_client.post("/api/users/login/", data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
