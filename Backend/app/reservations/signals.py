"""
app/reservations/signals.py - Signals pour les réservations
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reservation


print("=" * 80)
print("FICHIER app/reservations/signals.py CHARGÉ")
print("=" * 80)


@receiver(post_save, sender=Reservation)
def handle_reservation_notifications(sender, instance, created, **kwargs):
    """
    Gère les notifications ET la création de conversation de groupe
    """
    from app.notifications.utils import (
        notify_reservation_request,
        notify_reservation_approved,
        notify_reservation_rejected,
        notify_reservation_cancelled,
    )
    
    print("=" * 80)
    print(f"🔔 SIGNAL RESERVATION DÉCLENCHÉ")
    print(f"   ID: {instance.id}")
    print(f"   Status: {instance.status}")
    print(f"   Created: {created}")
    print(f"   Passager: {instance.passager.full_name}")
    print(f"   Conducteur: {instance.trajet.conducteur.full_name}")
    print("=" * 80)
    
    # ✅ Nouvelle demande de réservation
    if created and instance.status == "PENDING":
        print(f"📝 Nouvelle réservation - Notification au conducteur")
        
        try:
            notify_reservation_request(
                driver=instance.trajet.conducteur,
                passenger=instance.passager,
                reservation=instance,
            )
            print(f"✅ Notification RESERVATION_REQUEST envoyée")
        except Exception as e:
            print(f"❌ Erreur notification REQUEST: {e}")
            import traceback
            traceback.print_exc()
        
        return  # ⚠️ Important : sortir ici
    
    # ✅ Changement de statut (pas de created)
    if not created:
        print(f"🔄 Changement de statut détecté: {instance.status}")
        
        # 🟢 Réservation CONFIRMÉE
        if instance.status == "CONFIRMED":
            print(f"🟢 Réservation confirmée")
            
            # 1️⃣ Notification au passager
            try:
                notify_reservation_approved(
                    passenger=instance.passager,
                    driver=instance.trajet.conducteur,
                    reservation=instance,
                )
                print(f"✅ Notification CONFIRMED envoyée au passager")
            except Exception as e:
                print(f"❌ Erreur notification CONFIRMED: {e}")
                import traceback
                traceback.print_exc()
            
            # 2️⃣ Créer/Mettre à jour conversation de groupe
            try:
                create_or_update_group_conversation(instance)
                print(f"✅ Conversation de groupe créée/mise à jour")
            except Exception as e:
                print(f"❌ Erreur conversation groupe: {e}")
                import traceback
                traceback.print_exc()
        
        # 🔴 Réservation REJETÉE
        elif instance.status == "REJECTED":
            print(f"🔴 Réservation rejetée")
            
            try:
                notify_reservation_rejected(
                    passenger=instance.passager,
                    driver=instance.trajet.conducteur,
                    reservation=instance,
                )
                print(f"✅ Notification REJECTED envoyée au passager")
            except Exception as e:
                print(f"❌ Erreur notification REJECTED: {e}")
                import traceback
                traceback.print_exc()
        
        # ⚪ Réservation ANNULÉE
        elif instance.status == "CANCELLED":
            print(f"⚪ Réservation annulée")
            
            try:
                notify_reservation_cancelled(
                    driver=instance.trajet.conducteur,
                    passenger=instance.passager,
                    reservation=instance,
                )
                print(f"✅ Notification CANCELLED envoyée au conducteur")
            except Exception as e:
                print(f"❌ Erreur notification CANCELLED: {e}")
                import traceback
                traceback.print_exc()


def create_or_update_group_conversation(reservation):
    """
    Crée ou met à jour la conversation de groupe du trajet
    """
    from app.notifications.models import Conversation, Message
    
    print(f"📝 Création/MAJ conversation groupe pour trajet {reservation.trajet.id}")
    
    trajet = reservation.trajet
    
    # Récupérer ou créer la conversation de groupe
    conversation, created = Conversation.objects.get_or_create(
        trajet=trajet,
        is_group=True,
    )
    
    if created:
        print(f"   ✨ Nouvelle conversation créée (ID: {conversation.id})")
    else:
        print(f"   ♻️ Conversation existante (ID: {conversation.id})")
    
    # Ajouter le conducteur
    if not conversation.participants.filter(id=trajet.conducteur.id).exists():
        conversation.participants.add(trajet.conducteur)
        print(f"   👤 Conducteur ajouté: {trajet.conducteur.full_name}")
    
    # Ajouter TOUS les passagers confirmés
    confirmed_reservations = trajet.reservations.filter(status='CONFIRMED')
    print(f"   📊 Total réservations confirmées: {confirmed_reservations.count()}")
    
    for res in confirmed_reservations:
        if not conversation.participants.filter(id=res.passager.id).exists():
            conversation.participants.add(res.passager)
            print(f"   👤 Passager ajouté: {res.passager.full_name}")
    
    conversation.save()
    
    # Message de bienvenue si nouvelle conversation
    if created:
        try:
            Message.objects.create(
                sender=trajet.conducteur,
                conversation=conversation,
                trajet=trajet,
                is_group_message=True,
                text=f"Bienvenue dans la conversation du trajet {trajet.ville_depart} → {trajet.ville_arrivee} !",
            )
            print(f"   💬 Message de bienvenue créé")
        except Exception as e:
            print(f"   ⚠️ Erreur message bienvenue: {e}")
    
    # Message pour le nouveau passager
    try:
        Message.objects.create(
            sender=trajet.conducteur,
            conversation=conversation,
            trajet=trajet,
            is_group_message=True,
            text=f"🎉 {reservation.passager.first_name} a rejoint le trajet !",
        )
        print(f"   💬 Message d'annonce créé pour {reservation.passager.first_name}")
    except Exception as e:
        print(f"   ⚠️ Erreur message annonce: {e}")
    
    total = conversation.participants.count()
    print(f"✅ Conversation finalisée - {total} participants")
    
    return conversation