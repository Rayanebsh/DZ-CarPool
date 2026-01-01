from app.notifications.models import Conversation, Notification
from app.reservations.models import Reservation

print("\n" + "=" * 80)
print("TEST DU FLUX DE RESERVATION")
print("=" * 80)

# 1. Récupérer une réservation en attente
try:
    reservation = Reservation.objects.filter(status="PENDING").first()

    if not reservation:
        print("Aucune reservation en attente trouvee")
        exit()

    print("\nReservation trouvee:")
    print(f"  ID: {reservation.id}")
    print(f"  Passager: {reservation.passager.full_name}")
    print(f"  Conducteur: {reservation.trajet.conducteur.full_name}")
    print(f"  Status: {reservation.status}")

    # 2. Confirmer la réservation
    print("\n--- CONFIRMATION DE LA RESERVATION ---")
    reservation.status = "CONFIRMED"
    reservation.save()

    print(f"Status change vers: {reservation.status}")

    # 3. Vérifier les notifications
    print("\n--- VERIFICATION DES NOTIFICATIONS ---")
    notifications = Notification.objects.filter(
        recipient=reservation.passager, type="RESERVATION_APPROVED"
    ).order_by("-created_at")[:5]

    print(f"Notifications trouvees: {notifications.count()}")
    for notif in notifications:
        print(f"  - [{notif.created_at}] {notif.content}")

    # 4. Vérifier la conversation de groupe
    print("\n--- VERIFICATION DE LA CONVERSATION ---")
    conversation = Conversation.objects.filter(
        trajet=reservation.trajet, is_group=True
    ).first()

    if conversation:
        print(f"Conversation de groupe trouvee (ID: {conversation.id})")
        participants = conversation.participants.all()
        print(f"Participants ({participants.count()}):")
        for participant in participants:
            print(f"  - {participant.full_name} ({participant.email})")
    else:
        print("ERREUR: Aucune conversation de groupe trouvee!")

    # 5. Statistiques
    print("\n--- STATISTIQUES ---")
    total_confirmed = Reservation.objects.filter(
        trajet=reservation.trajet, status="CONFIRMED"
    ).count()
    print(f"Total reservations confirmees pour ce trajet: {total_confirmed}")

    print("\n" + "=" * 80)
    print("TEST TERMINE")
    print("=" * 80 + "\n")

except Exception as e:
    print(f"\nERREUR: {e}")
    import traceback

    traceback.print_exc()
