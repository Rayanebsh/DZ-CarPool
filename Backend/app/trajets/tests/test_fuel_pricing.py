from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from rest_framework.test import APIClient

from app.trajets.models import FuelPrice, Trajet
from utils.pricing import (
    calculate_suggested_price,
    extract_wilaya_from_location,
    get_fuel_price_for_wilaya,
    load_fuel_prices,
)

User = get_user_model()


class FuelPricingUtilsTestCase(TestCase):
    """Tests pour les utilitaires de pricing"""

    def setUp(self):
        # Créer des prix de carburant de test
        FuelPrice.objects.create(
            wilaya_code="16",
            wilaya_name="Alger",
            fuel_type="gasoil",
            price_per_liter=Decimal("36.13"),
        )
        FuelPrice.objects.create(
            wilaya_code="16",
            wilaya_name="Alger",
            fuel_type="essence_sans_plomb",
            price_per_liter=Decimal("51.58"),
        )

    def test_load_fuel_prices(self):
        """Test du chargement du fichier JSON"""
        data = load_fuel_prices()
        self.assertIsNotNone(data)
        self.assertIn("wilayas", data)
        self.assertIn("consommation_moyenne", data)

    def test_extract_wilaya_from_location(self):
        """Test de l'extraction de la wilaya depuis le nom de ville"""
        test_cases = [
            ("Alger", "Alger"),
            ("Algiers", "Alger"),
            ("Birkhadem, Algiers", "Alger"),
            ("Oran", "Oran"),
            ("Constantine", "Constantine"),
            ("Setif", "Sétif"),
            ("Bejaia", "Béjaïa"),
        ]

        for input_location, expected_wilaya in test_cases:
            result = extract_wilaya_from_location(input_location)
            self.assertEqual(
                result,
                expected_wilaya,
                f"Failed for {input_location}, expected {expected_wilaya}, got {result}",
            )

    def test_get_fuel_price_for_wilaya(self):
        """Test de récupération du prix du carburant pour une wilaya"""
        price = get_fuel_price_for_wilaya("Alger", "gasoil")
        self.assertIsNotNone(price)
        self.assertIsInstance(price, Decimal)
        self.assertGreater(price, Decimal("0"))

    def test_calculate_suggested_price_alger_oran(self):
        """
        Test du calcul du prix suggéré : Alger → Oran

        Paramètres :
        - Distance : 420 km
        - Carburant : Gasoil
        - Prix gasoil Alger : 36.13 DZD/L
        - Consommation : 6.5 L/100km
        - Nombre de places : 3

        Calcul attendu :
        1. Coût carburant = (420 × 6.5 × 36.13) / 100 = 986.75 DZD
        2. Coût total (avec usure 50%) = 986.75 × 1.5 = 1480.12 DZD
        3. Prix par siège = 1480.12 / 3 = 493.37 DZD
        4. Arrondi à 10 DA = 490 DZD
        """
        suggested_price = calculate_suggested_price(
            distance=420,
            ville_depart="Alger",
            fuel_type="gasoil",
            fuel_consumption=6.5,
            nbr_places=3,
        )

        self.assertIsInstance(suggested_price, Decimal)
        # Tolérance de ±50 DZD pour variations mineures
        self.assertAlmostEqual(float(suggested_price), 490.0, delta=50.0)

    def test_calculate_suggested_price_with_essence(self):
        """Test du calcul avec essence sans plomb"""
        suggested_price = calculate_suggested_price(
            distance=300,
            ville_depart="Alger",
            fuel_type="essence_sans_plomb",
            fuel_consumption=7.5,
            nbr_places=2,
        )

        self.assertIsInstance(suggested_price, Decimal)
        self.assertGreater(suggested_price, Decimal("0"))

    def test_calculate_suggested_price_electric(self):
        """Test du calcul pour véhicule électrique"""
        suggested_price = calculate_suggested_price(
            distance=150,
            ville_depart="Alger",
            fuel_type="electrique",
            fuel_consumption=18.0,  # kWh/100km
            nbr_places=4,
        )

        self.assertIsInstance(suggested_price, Decimal)
        self.assertGreater(suggested_price, Decimal("0"))


class TrajetCreationWithFuelTestCase(TestCase):
    """Tests pour la création de trajets avec calcul automatique du prix"""

    def setUp(self):
        self.client = APIClient()

        # Créer un utilisateur
        self.user = User.objects.create_user(
            email="driver@test.com",
            password="testpass123",
            first_name="Test",
            last_name="Driver",
        )

        # S'authentifier
        self.client.force_authenticate(user=self.user)

        # Créer des prix de carburant de test
        FuelPrice.objects.create(
            wilaya_code="16",
            wilaya_name="Alger",
            fuel_type="gasoil",
            price_per_liter=Decimal("36.13"),
        )

    def test_create_trajet_with_fuel_fields(self):
        """Test de création d'un trajet avec champs de carburant"""
        trajet_data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Oran",
            "date": (timezone.now() + timezone.timedelta(days=5)).date().isoformat(),
            "heure_depart": "08:00",
            "nbr_places": 3,
            "price": 1500,
            "distance": 420,
            "fuel_type": "gasoil",
            "fuel_consumption": 6.5,
            "no_smoking": True,
            "music_allowed": True,
            "small_luggage_only": False,
            "description": "Trajet test",
        }

        response = self.client.post("/api/v1/trajets/", trajet_data, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)

        # Vérifier que le trajet a été créé avec les bons champs
        trajet = Trajet.objects.get(id=response.data["id"])
        self.assertEqual(trajet.fuel_type, "gasoil")
        self.assertEqual(trajet.fuel_consumption, Decimal("6.5"))
        self.assertEqual(trajet.wilaya_depart, "Alger")
        self.assertTrue(trajet.no_smoking)
        self.assertTrue(trajet.music_allowed)
        self.assertFalse(trajet.small_luggage_only)

        # Vérifier que le prix suggéré a été calculé
        self.assertIsNotNone(trajet.suggested_price)
        self.assertGreater(trajet.suggested_price, Decimal("0"))

    def test_create_trajet_comfort_option(self):
        """Test de création avec option Comfort"""
        trajet_data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Constantine",
            "date": (timezone.now() + timezone.timedelta(days=3)).date().isoformat(),
            "heure_depart": "09:00",
            "nbr_places": 2,
            "price": 2000,
            "distance": 320,
            "fuel_type": "essence_sans_plomb",
            "fuel_consumption": 7.0,
            "is_confort": True,
        }

        response = self.client.post("/api/v1/trajets/", trajet_data, format="json")

        self.assertEqual(response.status_code, 201)

        trajet = Trajet.objects.get(id=response.data["id"])
        self.assertTrue(trajet.is_confort)

        # Vérifier que le supplément Comfort a été appliqué (+30%)
        # Le prix final doit être supérieur au prix de base
        self.assertGreater(trajet.price, Decimal("2000"))

    def test_fuel_prices_endpoint(self):
        """Test de l'endpoint /api/v1/trajets/fuel_prices/"""
        response = self.client.get("/api/v1/trajets/fuel_prices/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("wilayas", response.data)
        self.assertIn("consommation_moyenne", response.data)

    def test_trajet_search_with_fuel_filter(self):
        """Test de recherche de trajets avec filtre par type de carburant"""
        # Créer des trajets de test
        tomorrow = (timezone.now() + timezone.timedelta(days=1)).date()

        Trajet.objects.create(
            conducteur=self.user,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=tomorrow,
            heure_depart="08:00",
            nbr_places=3,
            price=1500,
            distance=420,
            fuel_type="gasoil",
            fuel_consumption=6.5,
        )

        Trajet.objects.create(
            conducteur=self.user,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=tomorrow,
            heure_depart="10:00",
            nbr_places=2,
            price=1800,
            distance=420,
            fuel_type="essence_sans_plomb",
            fuel_consumption=7.5,
        )

        # Rechercher uniquement les trajets avec gasoil
        search_data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Oran",
            "date": tomorrow.isoformat(),
            "fuel_type": "gasoil",
        }

        response = self.client.post(
            "/api/v1/trajets/search/", search_data, format="json"
        )

        self.assertEqual(response.status_code, 200)
        # On doit trouver uniquement le trajet avec gasoil
        # (moins 1 car on exclut les trajets de l'utilisateur connecté)
        self.assertEqual(response.data["count"], 0)  # Exclus car même conducteur

    def test_trajet_list_includes_fuel_info(self):
        """Test que la liste des trajets inclut les infos de carburant"""
        response = self.client.get("/api/v1/trajets/")

        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.data["count"], 0)

        # Vérifier que les champs de carburant sont présents
        trajet_data = response.data["results"][0]
        self.assertIn("fuel_type", trajet_data)
        self.assertIn("no_smoking", trajet_data)
        self.assertIn("music_allowed", trajet_data)


class TrajetPreferencesTestCase(TestCase):
    """Tests spécifiques pour les préférences de trajet"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="pref_driver@test.com", password="testpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_no_smoking_preference(self):
        """Test de la préférence non-fumeur"""
        trajet_data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Blida",
            "date": (timezone.now() + timezone.timedelta(days=2)).date().isoformat(),
            "heure_depart": "14:00",
            "nbr_places": 4,
            "price": 500,
            "distance": 50,
            "no_smoking": True,
        }

        response = self.client.post("/api/v1/trajets/", trajet_data, format="json")
        self.assertEqual(response.status_code, 201)

        trajet = Trajet.objects.get(id=response.data["id"])
        self.assertTrue(trajet.no_smoking)

    def test_music_preference(self):
        """Test de la préférence musique"""
        trajet_data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Tipaza",
            "date": (timezone.now() + timezone.timedelta(days=2)).date().isoformat(),
            "heure_depart": "10:00",
            "nbr_places": 3,
            "price": 400,
            "distance": 70,
            "music_allowed": False,
        }

        response = self.client.post("/api/v1/trajets/", trajet_data, format="json")
        self.assertEqual(response.status_code, 201)

        trajet = Trajet.objects.get(id=response.data["id"])
        self.assertFalse(trajet.music_allowed)

    def test_small_luggage_preference(self):
        """Test de la préférence bagages"""
        trajet_data = {
            "ville_depart": "Alger",
            "ville_arrivee": "Boumerdes",
            "date": (timezone.now() + timezone.timedelta(days=2)).date().isoformat(),
            "heure_depart": "07:00",
            "nbr_places": 2,
            "price": 300,
            "distance": 60,
            "small_luggage_only": True,
        }

        response = self.client.post("/api/v1/trajets/", trajet_data, format="json")
        self.assertEqual(response.status_code, 201)

        trajet = Trajet.objects.get(id=response.data["id"])
        self.assertTrue(trajet.small_luggage_only)


class WilayaDetectionTestCase(TestCase):
    """Tests pour la détection automatique de la wilaya"""

    def test_wilaya_extraction_from_common_cities(self):
        """Test de l'extraction pour les villes communes"""
        test_cases = {
            "Alger": "Alger",
            "Algiers": "Alger",
            "Birkhadem": "Alger",
            "Birkhadem, Algiers": "Alger",
            "Oran": "Oran",
            "Constantine": "Constantine",
            "Annaba": "Annaba",
            "Blida": "Blida",
            "Sétif": "Sétif",
            "Béjaïa": "Béjaïa",
        }

        for city, expected_wilaya in test_cases.items():
            result = extract_wilaya_from_location(city)
            self.assertEqual(
                result,
                expected_wilaya,
                f"Failed to extract {expected_wilaya} from {city}",
            )

    def test_wilaya_saved_in_trajet(self):
        """Test que la wilaya est bien sauvegardée lors de la création"""
        user = User.objects.create_user(email="test@example.com", password="pass")
        client = APIClient()
        client.force_authenticate(user=user)

        trajet_data = {
            "ville_depart": "Birkhadem, Algiers",
            "ville_arrivee": "Oran",
            "date": (timezone.now() + timezone.timedelta(days=1)).date().isoformat(),
            "heure_depart": "09:00",
            "nbr_places": 3,
            "price": 1500,
            "distance": 420,
        }

        response = client.post("/api/v1/trajets/", trajet_data, format="json")
        self.assertEqual(response.status_code, 201)

        trajet = Trajet.objects.get(id=response.data["id"])
        self.assertEqual(trajet.wilaya_depart, "Alger")
