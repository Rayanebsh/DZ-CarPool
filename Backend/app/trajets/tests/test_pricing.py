# ============================================================================
# apps/trajets/tests/test_pricing.py
# ============================================================================

from decimal import Decimal

import pytest
from utils.pricing import (
    calculate_fuel_cost,
    calculate_platform_commission,
    calculate_suggested_price,
)


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
