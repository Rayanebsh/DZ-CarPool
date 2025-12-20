import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from app.users.models import Role, Preference
from app.trajets.models import Trajet, FuelPrice
from app.reservations.models import Reservation

User = get_user_model()


def create_fixtures():
    print("Génération des fixtures de test...")

    # Créer les rôles
    user_role, _ = Role.objects.get_or_create(name="USER")
    admin_role, _ = Role.objects.get_or_create(name="ADMIN")
    print("✓ Rôles créés")

    # Créer des préférences
    prefs = []
    pref_names = ["Musique", "Silence", "Discussion", "Non-fumeur", "Climatisation"]
    for name in pref_names:
        pref, _ = Preference.objects.get_or_create(name=name)
        prefs.append(pref)
    print("✓ Préférences créées")

    # Créer des utilisateurs
    users = []
    for i in range(20):
        user, created = User.objects.get_or_create(
            email=f"user{i}@dzcarpool.com",
            defaults={
                "first_name": f"User{i}",
                "last_name": f"Test",
                "role": user_role,
            },
        )
        if created:
            user.set_password("password123")
            user.preferences.set(random.sample(prefs, k=2))
            user.save()
        users.append(user)
    print(f"✓ {len(users)} utilisateurs créés")

    # Créer des prix de carburant
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

    # Créer des trajets
    villes = ["Alger", "Oran", "Constantine", "Annaba", "Béjaïa", "Sétif"]
    trajets = []
    for i in range(50):
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

    # Créer des réservations
    reservations_count = 0
    for trajet in random.sample(trajets, min(30, len(trajets))):
        passager = random.choice([u for u in users if u != trajet.conducteur])
        try:
            reservation, created = Reservation.objects.get_or_create(
                trajet=trajet,
                passager=passager,
                defaults={
                    "nbr_places": random.randint(1, min(2, trajet.places_disponibles)),
                    "status": random.choice(["PENDING", "CONFIRMED"]),
                },
            )
            if created:
                reservations_count += 1
        except Exception:
            pass
    print(f"✓ {reservations_count} réservations créées")

    print("\n✅ Fixtures générées avec succès!")


if __name__ == "__main__":
    create_fixtures()
