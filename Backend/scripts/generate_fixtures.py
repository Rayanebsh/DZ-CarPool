import random
from datetime import date, timedelta
from decimal import Decimal

import django

from app.trajets.models import FuelPrice, Reservation, Trajet
from app.users.models import Preference, Role, User

django.setup()


def create_roles():
    """Crée les rôles utilisateur de base"""
    user_role, _ = Role.objects.get_or_create(name="USER")
    admin_role, _ = Role.objects.get_or_create(name="ADMIN")
    print("✓ Rôles créés")
    return user_role, admin_role


def create_preferences():
    """Crée les préférences de covoiturage"""
    prefs = []
    pref_names = ["Musique", "Silence", "Discussion", "Non-fumeur", "Climatisation"]
    for name in pref_names:
        pref, _ = Preference.objects.get_or_create(name=name)
        prefs.append(pref)
    print("✓ Préférences créées")
    return prefs


def create_users(user_role, prefs, count=20):
    """Crée des utilisateurs de test"""
    users = []
    for i in range(count):
        user, created = User.objects.get_or_create(
            email=f"user{i}@dzcarpool.com",
            defaults={
                "first_name": f"User{i}",
                "last_name": f"Test{i}",
                "role": user_role,
            },
        )
        if created:
            user.set_password("password123")
            user.preferences.set(random.sample(prefs, k=2))
            user.save()
        users.append(user)
    print(f"✓ {len(users)} utilisateurs créés")
    return users


def create_fuel_prices():
    """Crée les prix du carburant par wilaya"""
    wilayas = ["Alger", "Oran", "Constantine", "Annaba", "Béjaïa"]
    for wilaya in wilayas:
        FuelPrice.objects.get_or_create(
            wilaya=wilaya,
            fuel_type="ESSENCE",
            defaults={"price_per_liter": Decimal("50.00")},
        )
        FuelPrice.objects.get_or_create(
            wilaya=wilaya,
            fuel_type="DIESEL",
            defaults={"price_per_liter": Decimal("40.00")},
        )
    print("✓ Prix du carburant créés")


def create_trips(users, count=50):
    """Crée des trajets de test"""
    villes = ["Alger", "Oran", "Constantine", "Annaba", "Béjaïa", "Sétif"]
    trajets = []

    for i in range(count):
        depart, arrivee = random.sample(villes, 2)
        trajet_date = date.today() + timedelta(days=random.randint(1, 30))

        trajet, created = Trajet.objects.get_or_create(
            conducteur=random.choice(users),
            ville_depart=depart,
            ville_arrivee=arrivee,
            date=trajet_date,
            defaults={
                "heure_depart": f"{random.randint(6, 20):02d}:00",
                "nbr_places": random.randint(2, 4),
                "price": Decimal(random.randint(500, 3000)),
                "distance": Decimal(random.randint(100, 800)),
                "is_confort": random.choice([True, False]),
            },
        )
        if created:
            trajets.append(trajet)

    print(f"✓ {len(trajets)} trajets créés")
    return trajets


def create_reservations(trajets, users, max_count=30):
    """Crée des réservations de test"""
    reservations_count = 0
    sample_size = min(max_count, len(trajets))

    for trajet in random.sample(trajets, sample_size):
        # Choisir un passager différent du conducteur
        available_passengers = [u for u in users if u != trajet.conducteur]
        if not available_passengers:
            continue

        passager = random.choice(available_passengers)
        max_places = min(2, trajet.places_disponibles)

        if max_places <= 0:
            continue

        try:
            reservation, created = Reservation.objects.get_or_create(
                trajet=trajet,
                passager=passager,
                defaults={
                    "nbr_places": random.randint(1, max_places),
                    "status": random.choice(["PENDING", "CONFIRMED"]),
                },
            )
            if created:
                reservations_count += 1
        except Exception:
            continue

    print(f"✓ {reservations_count} réservations créées")
    return reservations_count


def create_fixtures():
    """Fonction principale de génération des fixtures"""
    print("Génération des fixtures de test...")
    print("=" * 50)

    # Créer les données de base
    user_role, admin_role = create_roles()
    prefs = create_preferences()
    users = create_users(user_role, prefs, count=20)
    create_fuel_prices()

    # Créer les données transactionnelles
    trajets = create_trips(users, count=50)
    create_reservations(trajets, users, max_count=30)

    print("=" * 50)
    print("✅ Fixtures générées avec succès!")


if __name__ == "__main__":
    create_fixtures()
