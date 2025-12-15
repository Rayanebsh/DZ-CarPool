# ============================================================================
# apps/reservations/tests/test_models.py
# ============================================================================

import pytest
from app.reservations.models import Reservation


@pytest.mark.django_db
class TestReservationModel:
    """Tests pour le modèle Reservation"""
    
    def test_create_reservation(self, trajet, passager):
        """Test de création de réservation"""
        reservation = Reservation.objects.create(
            trajet=trajet,
            passager=passager,
            nbr_places=2
        )
        
        assert reservation.status == 'PENDING'
        assert reservation.total_price > 0
    
    def test_approve_reservation(self, reservation):
        """Test d'approbation de réservation"""
        initial_places = reservation.trajet.places_disponibles
        
        reservation.approve()
        reservation.trajet.refresh_from_db()
        
        assert reservation.status == 'CONFIRMED'
        assert reservation.approved_at is not None
        assert reservation.trajet.places_disponibles < initial_places
    
    def test_reject_reservation(self, reservation):
        """Test de rejet de réservation"""
        reservation.reject("Places insuffisantes")
        
        assert reservation.status == 'REJECTED'
        assert reservation.rejection_reason == "Places insuffisantes"
    
    def test_cancel_reservation(self, reservation):
        """Test d'annulation de réservation"""
        reservation.approve()
        initial_places = reservation.trajet.places_disponibles
        
        reservation.cancel("Changement de plans")
        reservation.trajet.refresh_from_db()
        
        assert reservation.status == 'CANCELLED'
        assert reservation.trajet.places_disponibles > initial_places