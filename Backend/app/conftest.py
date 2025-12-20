import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from app.users.models import Role
from app.trajets.models import Trajet, FuelPrice
from app.reservations.models import Reservation
from rest_framework import status
from utils.pricing import (
    calculate_fuel_cost,
    calculate_suggested_price,
    calculate_platform_commission,
)
from app.messaging.models import Message
from app.notifications.models import Notification

User = get_user_model()


@pytest.fixture
def api_client():
    """Client API pour les tests"""
    return APIClient()


@pytest.fixture
def user_role():
    """Rôle utilisateur par défaut"""
    return Role.objects.create(name="USER", description="Utilisateur standard")


@pytest.fixture
def user(user_role):
    """Utilisateur de test"""
    return User.objects.create_user(
        email="test@example.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
        role=user_role,
    )


@pytest.fixture
def conducteur(user_role):
    """Conducteur de test"""
    return User.objects.create_user(
        email="driver@example.com",
        password="driverpass123",
        first_name="Driver",
        last_name="Test",
        role=user_role,
    )


@pytest.fixture
def passager(user_role):
    """Passager de test"""
    return User.objects.create_user(
        email="passenger@example.com",
        password="passengerpass123",
        first_name="Passenger",
        last_name="Test",
        role=user_role,
    )


@pytest.fixture
def trajet(conducteur):
    """Trajet de test"""
    return Trajet.objects.create(
        conducteur=conducteur,
        ville_depart="Alger",
        ville_arrivee="Oran",
        date="2025-12-31",
        heure_depart="08:00",
        nbr_places=4,
        price=Decimal("1500.00"),
        distance=Decimal("450.00"),
    )


@pytest.fixture
def reservation(trajet, passager):
    """Réservation de test"""
    return Reservation.objects.create(trajet=trajet, passager=passager, nbr_places=2)


@pytest.fixture
def fuel_price():
    """Prix du carburant de test"""
    return FuelPrice.objects.create(
        wilaya="Alger", fuel_type="ESSENCE", price_per_liter=Decimal("50.00")
    )


# ============================================================================
# apps/users/tests/test_models.py
# ============================================================================


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


# ============================================================================
# apps/users/tests/test_views.py
# ============================================================================


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


# ============================================================================
# apps/trajets/tests/test_models.py
# ============================================================================


@pytest.mark.django_db
class TestTrajetModel:
    """Tests pour le modèle Trajet"""

    def test_create_trajet(self, conducteur):
        """Test de création de trajet"""
        trajet = Trajet.objects.create(
            conducteur=conducteur,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date="2025-12-31",
            heure_depart="08:00",
            nbr_places=4,
            price=Decimal("1500.00"),
            distance=Decimal("450.00"),
        )

        assert trajet.conducteur == conducteur
        assert trajet.places_disponibles == 4
        assert trajet.price_platform > 0  # Commission calculée
        assert trajet.price_driver > 0

    def test_trajet_pause_required(self, conducteur):
        """Test de pause obligatoire pour longue distance"""
        trajet = Trajet.objects.create(
            conducteur=conducteur,
            ville_depart="Alger",
            ville_arrivee="Tamanrasset",
            date="2025-12-31",
            heure_depart="08:00",
            nbr_places=3,
            price=Decimal("5000.00"),
            distance=Decimal("2000.00"),
        )

        assert trajet.pause_required is True

    def test_trajet_confort_pricing(self, conducteur):
        """Test de tarification avec option confort"""
        trajet = Trajet.objects.create(
            conducteur=conducteur,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date="2025-12-31",
            heure_depart="08:00",
            nbr_places=4,
            price=Decimal("1000.00"),
            distance=Decimal("450.00"),
            is_confort=True,
        )

        # Vérifier que le prix a augmenté de 30%
        assert trajet.price > Decimal("1000.00")

    def test_can_reserve(self, trajet):
        """Test de vérification de disponibilité"""
        assert trajet.can_reserve(2) is True
        assert trajet.can_reserve(5) is False


# ============================================================================
# apps/trajets/tests/test_pricing.py
# ============================================================================


@pytest.mark.django_db
class TestPricing:
    """Tests pour les calculs de prix"""

    def test_calculate_fuel_cost(self):
        """Test du calcul du coût carburant"""
        cost = calculate_fuel_cost(
            distance=100, fuel_price_per_liter=50.0, consumption=8.0
        )

        assert isinstance(cost, Decimal)
        assert cost == Decimal("400.00")  # (100/100) * 8 * 50

    def test_calculate_suggested_price(self, fuel_price):
        """Test du calcul du prix suggéré"""
        price = calculate_suggested_price(
            distance=100, ville_depart="Alger", nbr_places=4
        )

        assert isinstance(price, Decimal)
        assert price > 0

    def test_calculate_platform_commission(self):
        """Test du calcul de la commission"""
        base_price = Decimal("1000.00")

        final, commission, driver = calculate_platform_commission(
            base_price, is_confort=False
        )

        assert final == base_price
        assert commission == base_price * Decimal("0.15")
        assert driver == base_price - commission

    def test_calculate_commission_with_confort(self):
        """Test du calcul avec option confort"""
        base_price = Decimal("1000.00")

        final, commission, driver = calculate_platform_commission(
            base_price, is_confort=True
        )

        assert final > base_price  # Prix augmenté de 30%
        assert commission > 0
        assert driver > 0


# ============================================================================
# apps/reservations/tests/test_models.py
# ============================================================================


@pytest.mark.django_db
class TestReservationModel:
    """Tests pour le modèle Reservation"""

    def test_create_reservation(self, trajet, passager):
        """Test de création de réservation"""
        reservation = Reservation.objects.create(
            trajet=trajet, passager=passager, nbr_places=2
        )

        assert reservation.status == "PENDING"
        assert reservation.total_price > 0

    def test_approve_reservation(self, reservation):
        """Test d'approbation de réservation"""
        initial_places = reservation.trajet.places_disponibles

        reservation.approve()
        reservation.trajet.refresh_from_db()

        assert reservation.status == "CONFIRMED"
        assert reservation.approved_at is not None
        assert reservation.trajet.places_disponibles < initial_places

    def test_reject_reservation(self, reservation):
        """Test de rejet de réservation"""
        reservation.reject("Places insuffisantes")

        assert reservation.status == "REJECTED"
        assert reservation.rejection_reason == "Places insuffisantes"

    def test_cancel_reservation(self, reservation):
        """Test d'annulation de réservation"""
        reservation.approve()
        initial_places = reservation.trajet.places_disponibles

        reservation.cancel("Changement de plans")
        reservation.trajet.refresh_from_db()

        assert reservation.status == "CANCELLED"
        assert reservation.trajet.places_disponibles > initial_places


# ============================================================================
# apps/messaging/tests/test_models.py
# ============================================================================


@pytest.mark.django_db
class TestMessageModel:
    """Tests pour le modèle Message"""

    def test_create_message(self, user, conducteur):
        """Test de création de message"""
        message = Message.objects.create(
            sender=user,
            receiver=conducteur,
            text="Bonjour, je suis intéressé par votre trajet",
        )

        assert message.sender == user
        assert message.receiver == conducteur
        assert message.is_read is False

    def test_mark_as_read(self, user, conducteur):
        """Test de marquage comme lu"""
        message = Message.objects.create(
            sender=user, receiver=conducteur, text="Test message"
        )

        message.mark_as_read()

        assert message.is_read is True
        assert message.read_at is not None


# ============================================================================
# apps/notifications/tests/test_models.py
# ============================================================================


@pytest.mark.django_db
class TestNotificationModel:
    """Tests pour le modèle Notification"""

    def test_create_notification(self, user, conducteur):
        """Test de création de notification"""
        notification = Notification.objects.create(
            recipient=user,
            sender=conducteur,
            type="MESSAGE_RECEIVED",
            content="Nouveau message de Test Driver",
        )

        assert notification.recipient == user
        assert notification.is_read is False

    def test_mark_as_read(self, user, conducteur):
        """Test de marquage comme lu"""
        notification = Notification.objects.create(
            recipient=user,
            sender=conducteur,
            type="MESSAGE_RECEIVED",
            content="Test notification",
        )

        notification.mark_as_read()

        assert notification.is_read is True
        assert notification.read_at is not None


# ============================================================================
# pytest.ini - Configuration pytest
# ============================================================================

"""
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --verbose
    --tb=short
    --cov=apps
    --cov-report=html
    --cov-report=term-missing
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
"""
