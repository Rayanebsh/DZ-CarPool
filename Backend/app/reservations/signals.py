# app/reservations/signals.py - CRÉER

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Reservation


@receiver(post_save, sender=Reservation)
def create_group_conversation(sender, instance, created, **kwargs):
    """Crée/met à jour la conversation de groupe quand réservation confirmée"""
    if instance.status == "CONFIRMED":
        from app.notifications.models import Conversation

        # Récupérer ou créer conversation de groupe
        conversation, created = Conversation.objects.get_or_create(
            trajet=instance.trajet, is_group=True  # ⚠️ Ajouter ce champ au modèle
        )

        # Ajouter le passager
        conversation.participants.add(instance.passager)

        # Ajouter le conducteur si pas déjà là
        conversation.participants.add(instance.trajet.conducteur)
