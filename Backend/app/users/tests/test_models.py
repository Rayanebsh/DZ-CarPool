# ============================================================================
# apps/users/tests/test_models.py
# ============================================================================

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Tests pour le modèle User"""

    def test_create_user(self, user_role):
        """Test de création d'utilisateur"""
        user = User.objects.create_user(
            email="newuser@example.com", password="password123", role=user_role
        )
        assert user.email == "newuser@example.com"
        assert user.check_password("password123")
        assert user.is_active is True
        assert user.is_staff is False

    def test_create_superuser(self, user_role):
        """Test de création de superutilisateur"""
        superuser = User.objects.create_superuser(
            email="admin@example.com", password="admin123", role=user_role
        )
        assert superuser.is_staff is True
        assert superuser.is_superuser is True

    def test_user_full_name(self, user):
        """Test du nom complet"""
        assert user.full_name == "Test User"

    def test_user_string_representation(self, user):
        """Test de la représentation en string"""
        assert str(user) == "test@example.com"
