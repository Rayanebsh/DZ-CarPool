# ============================================================================
# apps/trajets/tests/test_models.py
# ============================================================================

import pytest
from decimal import Decimal
from app.trajets.models import Trajet


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
