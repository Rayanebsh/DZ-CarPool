from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone

import pytest

from app.reservations.models import Reservation
from app.trajets.models import Trajet
from app.users.models import Role, UserDocument

User = get_user_model()


@pytest.fixture
def driver_role():
    """Fixture pour le rôle conducteur"""
    role, _ = Role.objects.get_or_create(
        name="DRIVER", defaults={"description": "Conducteur"}
    )
    return role


@pytest.fixture
def passenger_role():
    """Fixture pour le rôle passager"""
    role, _ = Role.objects.get_or_create(
        name="PASSENGER", defaults={"description": "Passager"}
    )
    return role


@pytest.fixture
def conducteur(driver_role):
    """Fixture pour un conducteur"""
    user = User.objects.create_user(
        email="conducteur@test.com",
        password="Test1234!",
        first_name="Jean",
        last_name="Dupont",
        phone_number="+213555111111",
    )
    user.role = driver_role
    user.save()
    return user


@pytest.fixture
def passager(passenger_role):
    """Fixture pour un passager avec document vérifié"""
    user = User.objects.create_user(
        email="passager@test.com",
        password="Test1234!",
        first_name="Marie",
        last_name="Martin",
        phone_number="+213555222222",
    )
    user.role = passenger_role
    user.save()

    # Créer un document vérifié
    UserDocument.objects.create(
        user=user,
        document_type="CNI",
        verified=True,
    )

    return user


@pytest.fixture
def trajet(conducteur):
    """Fixture pour un trajet disponible"""
    return Trajet.objects.create(
        conducteur=conducteur,
        ville_depart="Alger",
        ville_arrivee="Oran",
        date=timezone.now().date() + timedelta(days=7),
        heure_depart=timezone.now().time(),
        nbr_places=4,
        places_disponibles=4,
        price=Decimal("500.00"),
        description="Trajet test",
        status="ACTIVE",
        distance=Decimal("400.00"),
        fuel_type="gasoil",
    )


@pytest.fixture
def reservation(trajet, passager):
    """Fixture pour une réservation"""
    return Reservation.objects.create(
        trajet=trajet,
        passager=passager,
        nbr_places=1,
        status="PENDING",
        price_per_seat=trajet.price,
    )


@pytest.fixture
def confirmed_reservation(trajet, passager):
    """Fixture pour une réservation confirmée"""
    return Reservation.objects.create(
        trajet=trajet,
        passager=passager,
        nbr_places=1,
        status="CONFIRMED",
        price_per_seat=trajet.price,
    )
