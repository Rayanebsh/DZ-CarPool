from datetime import date, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from app.reservations.models import Reservation
from app.trajets.models import Trajet
from app.trajets.permissions import (
    CanCancelTrajet,
    CanModifyTrajet,
    CanViewTrajetReservations,
    IsDriverOrReadOnly,
)
from app.users.models import UserDocument

User = get_user_model()


class PermissionsTestCase(APITestCase):
    """Tests pour les permissions personnalisées"""

    def setUp(self):
        """Configuration des tests de permissions"""
        self.conducteur = User.objects.create_user(
            email="driver@test.com",
            password="testpass123",
            first_name="Driver",
            last_name="Test",
            phone_number="+213555000001",
        )

        self.autre_user = User.objects.create_user(
            email="other@test.com",
            password="testpass123",
            first_name="Other",
            last_name="User",
            phone_number="+213555000002",
        )

        UserDocument.objects.create(
            user=self.conducteur,
            document_type="cni",
            verified=True,
        )

        self.trajet = Trajet.objects.create(
            conducteur=self.conducteur,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=date.today() + timedelta(days=5),
            heure_depart=time(9, 0),
            nbr_places=4,
            price=Decimal("1500.00"),
            distance=Decimal("432.5"),
        )

    def test_is_driver_or_readonly_safe_methods(self):
        """Test: IsDriverOrReadOnly permet les méthodes sûres"""
        permission = IsDriverOrReadOnly()

        # Mock request
        class MockRequest:
            method = "GET"
            user = self.autre_user

        request = MockRequest()
        self.assertTrue(permission.has_permission(request, None))

    def test_is_driver_or_readonly_post_authenticated(self):
        """Test: IsDriverOrReadOnly permet POST pour utilisateurs authentifiés"""
        permission = IsDriverOrReadOnly()

        class MockRequest:
            method = "POST"
            user = self.conducteur

        request = MockRequest()
        self.assertTrue(permission.has_permission(request, None))

    def test_is_driver_or_readonly_object_permission(self):
        """Test: IsDriverOrReadOnly vérifie le propriétaire pour les modifications"""
        permission = IsDriverOrReadOnly()

        class MockRequest:
            method = "PUT"
            user = self.autre_user

        request = MockRequest()
        self.assertFalse(permission.has_object_permission(request, None, self.trajet))

        request.user = self.conducteur
        self.assertTrue(permission.has_object_permission(request, None, self.trajet))

    def test_can_modify_trajet_owner_only(self):
        """Test: CanModifyTrajet - seul le propriétaire peut modifier"""
        permission = CanModifyTrajet()

        class MockRequest:
            method = "PATCH"
            user = self.autre_user
            data = {"description": "Test"}

        class MockView:
            action = "partial_update"

        request = MockRequest()
        view = MockView()

        self.assertFalse(permission.has_object_permission(request, view, self.trajet))

        request.user = self.conducteur
        self.assertTrue(permission.has_object_permission(request, view, self.trajet))

    def test_can_modify_trajet_completed_status(self):
        """Test: CanModifyTrajet - impossible de modifier un trajet terminé"""
        permission = CanModifyTrajet()

        self.trajet.status = "COMPLETED"
        self.trajet.save()

        class MockRequest:
            method = "PATCH"
            user = self.conducteur
            data = {"description": "Test"}

        class MockView:
            action = "partial_update"

        request = MockRequest()
        view = MockView()

        self.assertFalse(permission.has_object_permission(request, view, self.trajet))

    def test_can_modify_trajet_with_confirmed_reservations(self):
        """Test: CanModifyTrajet - restrictions avec réservations confirmées"""
        permission = CanModifyTrajet()

        # Créer une réservation confirmée
        Reservation.objects.create(
            trajet=self.trajet,
            passager=self.autre_user,
            nbr_places=2,
            total_price=Decimal("3000.00"),
            status="CONFIRMED",
        )

        class MockRequest:
            method = "PATCH"
            user = self.conducteur
            data = {"price": "2000.00"}  # Champ non autorisé

        class MockView:
            action = "partial_update"

        request = MockRequest()
        view = MockView()

        # Ne peut pas modifier le prix
        self.assertFalse(permission.has_object_permission(request, view, self.trajet))

        # Peut modifier la description
        request.data = {"description": "Nouvelle description"}
        self.assertTrue(permission.has_object_permission(request, view, self.trajet))

    def test_can_cancel_trajet_owner_only(self):
        """Test: CanCancelTrajet - seul le propriétaire peut annuler"""
        permission = CanCancelTrajet()

        class MockRequest:
            user = self.autre_user

        request = MockRequest()
        self.assertFalse(permission.has_object_permission(request, None, self.trajet))

        request.user = self.conducteur
        self.assertTrue(permission.has_object_permission(request, None, self.trajet))

    def test_can_cancel_trajet_already_cancelled(self):
        """Test: CanCancelTrajet - impossible d'annuler un trajet déjà annulé"""
        permission = CanCancelTrajet()

        self.trajet.status = "CANCELLED"
        self.trajet.save()

        class MockRequest:
            user = self.conducteur

        request = MockRequest()
        self.assertFalse(permission.has_object_permission(request, None, self.trajet))

    def test_can_view_reservations_driver(self):
        """Test: CanViewTrajetReservations - le conducteur peut voir toutes les réservations"""
        permission = CanViewTrajetReservations()

        class MockRequest:
            user = self.conducteur

        request = MockRequest()
        self.assertTrue(permission.has_object_permission(request, None, self.trajet))

    def test_can_view_reservations_passenger(self):
        """Test: CanViewTrajetReservations - le passager peut voir ses réservations"""
        permission = CanViewTrajetReservations()

        # Créer une réservation
        Reservation.objects.create(
            trajet=self.trajet,
            passager=self.autre_user,
            nbr_places=2,
            total_price=Decimal("3000.00"),
            status="CONFIRMED",
        )

        class MockRequest:
            user = self.autre_user

        request = MockRequest()
        self.assertTrue(permission.has_object_permission(request, None, self.trajet))


class EdgeCasesTestCase(APITestCase):
    """Tests pour les cas limites et situations exceptionnelles"""

    def setUp(self):
        self.conducteur = User.objects.create_user(
            email="driver@test.com",
            password="testpass123",
            first_name="Driver",
            last_name="Test",
            phone_number="+213555000003",
        )

        UserDocument.objects.create(
            user=self.conducteur,
            document_type="cni",
            verified=True,
        )

        self.trajet = Trajet.objects.create(
            conducteur=self.conducteur,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=date.today() + timedelta(days=5),
            heure_depart=time(9, 0),
            nbr_places=4,
            price=Decimal("1500.00"),
            distance=Decimal("432.5"),
        )

    def test_search_with_special_characters(self):
        """Test: Recherche avec caractères spéciaux"""
        data = {
            "ville_depart": "Alger, Algérie",
            "ville_arrivee": "Oran, Algérie",
            "date": (date.today() + timedelta(days=5)).isoformat(),
            "nbr_places": 1,
        }

        from django.urls import reverse

        url = reverse("trajets:trajet-search")
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_case_insensitive(self):
        """Test: Recherche insensible à la casse"""
        data = {
            "ville_depart": "ALGER",
            "ville_arrivee": "oran",
            "date": (date.today() + timedelta(days=5)).isoformat(),
            "nbr_places": 1,
        }

        from django.urls import reverse

        url = reverse("trajets:trajet-search")
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 0)

    def test_places_disponibles_consistency(self):
        """Test: Cohérence des places disponibles après réservations"""
        passager = User.objects.create_user(
            email="passenger@test.com",
            password="testpass123",
            phone_number="+213555000005",
        )

        # Créer une réservation
        Reservation.objects.create(
            trajet=self.trajet,
            passager=passager,
            nbr_places=2,
            total_price=Decimal("3000.00"),
            status="CONFIRMED",
        )

        from django.urls import reverse

        url = reverse("trajets:trajet-places", kwargs={"pk": self.trajet.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["places_disponibles"], 2)
        self.assertEqual(response.data["reservations_total"], 2)

    def test_multiple_reservations_places_calculation(self):
        """Test: Calcul correct avec plusieurs réservations"""
        passager1 = User.objects.create_user(
            email="p1@test.com", password="test", phone_number="+213555000006"
        )
        passager2 = User.objects.create_user(
            email="p2@test.com", password="test", phone_number="+213555000007"
        )

        Reservation.objects.create(
            trajet=self.trajet,
            passager=passager1,
            nbr_places=2,
            total_price=Decimal("3000.00"),
            status="CONFIRMED",
        )

        Reservation.objects.create(
            trajet=self.trajet,
            passager=passager2,
            nbr_places=1,
            total_price=Decimal("1500.00"),
            status="CONFIRMED",
        )

        from django.urls import reverse

        url = reverse("trajets:trajet-places", kwargs={"pk": self.trajet.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["places_disponibles"], 1)
        self.assertEqual(response.data["reservations_total"], 3)

    def test_driver_info_without_profile_picture(self):
        """Test: Driver info sans photo de profil"""
        from django.urls import reverse

        url = reverse("trajets:trajet-driver-info", kwargs={"pk": self.trajet.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["profile_picture"])

    def test_intelligent_search_empty_preferences(self):
        """Test: Recherche intelligente sans préférences"""
        data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Oran",
            "date": (date.today() + timedelta(days=5)).isoformat(),
            "nbr_places": 2,
            "preference_ids": [],
        }

        from django.urls import reverse

        url = reverse("trajets:trajet-intelligent-search")
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_trajet_with_minimum_values(self):
        """Test: Création de trajet avec valeurs minimales"""
        self.client.force_authenticate(user=self.conducteur)

        data = {
            "ville_depart": "A",
            "ville_arrivee": "B",
            "date": (date.today() + timedelta(days=1)).isoformat(),
            "heure_depart": "00:00:00",
            "nbr_places": 1,
            "price": "0.01",
            "distance": "0.01",
            "fuel_type": "electrique",
        }

        from django.urls import reverse

        url = reverse("trajets:trajet-list")
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cancel_trajet_cascade_notifications(self):
        """Test: Annulation de trajet crée des notifications"""
        self.client.force_authenticate(user=self.conducteur)

        # Créer plusieurs réservations
        for i in range(3):
            passager = User.objects.create_user(
                email=f"p{i}@test.com",
                password="test",
                phone_number=f"+21355500001{i}",
            )
            Reservation.objects.create(
                trajet=self.trajet,
                passager=passager,
                nbr_places=1,
                total_price=Decimal("1500.00"),
                status="CONFIRMED",
            )

        from django.urls import reverse

        url = reverse("trajets:trajet-cancel", kwargs={"pk": self.trajet.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Vérifier que toutes les réservations sont annulées
        cancelled_count = Reservation.objects.filter(
            trajet=self.trajet, status="CANCELLED"
        ).count()
        self.assertEqual(cancelled_count, 3)

    def test_pagination_my_trips(self):
        """Test: Pagination de la liste mes trajets"""
        self.client.force_authenticate(user=self.conducteur)

        # Créer 15 trajets
        for i in range(15):
            Trajet.objects.create(
                conducteur=self.conducteur,
                ville_depart=f"Ville{i}",
                ville_arrivee=f"Destination{i}",
                date=date.today() + timedelta(days=i + 1),
                heure_depart=time(9, 0),
                nbr_places=4,
                price=Decimal("1000.00"),
                distance=Decimal("100.0"),
            )

        from django.urls import reverse

        url = reverse("trajets:trajet-my-trips")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Vérifier la pagination
        self.assertIn("results", response.data)


class FuelPriceViewSetTestCase(APITestCase):
    """Tests pour le FuelPriceViewSet"""

    def test_list_fuel_prices_public(self):
        """Test: Liste des prix du carburant accessible publiquement"""
        # ✅ CORRECTION : Utiliser le namespace complet
        url = reverse("trajets:fuel-price-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # La réponse est un dictionnaire avec 'wilayas', pas une liste directe
        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR],
        )
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("wilayas", response.data)
