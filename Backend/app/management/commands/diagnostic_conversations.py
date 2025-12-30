# app/messaging/consumers.py
import json
import logging

from django.contrib.auth import get_user_model

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Gère la connexion WebSocket"""
        self.user = self.scope["user"]

        logger.info(f"[WS] Connexion de {self.user}")

        if not self.user.is_authenticated:
            logger.error(f"[WS] Utilisateur non authentifié")
            await self.close()
            return

        # Type de conversation: 'group' ou 'private'
        self.conversation_type = self.scope["url_route"]["kwargs"]["type"]
        self.conversation_id = self.scope["url_route"]["kwargs"]["id"]

        logger.info(f"[WS] Type: {self.conversation_type}, ID: {self.conversation_id}")

        # Nom du groupe WebSocket
        if self.conversation_type == "group":
            self.room_group_name = f"trip_{self.conversation_id}"
        else:
            self.room_group_name = f"private_{self.conversation_id}"

        # Vérifier les permissions
        try:
            has_permission = await self.check_permission()
            if not has_permission:
                logger.error(f"❌ Permission refusée pour {self.user}")
                await self.close(code=4003)
                return
        except Exception as e:
            logger.error(f"❌ Erreur vérification permission: {e}")
            await self.close(code=4000)
            return

        # Rejoindre le groupe
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # IMPORTANT: Accepter la connexion AVANT d'envoyer des messages
        await self.accept()
        logger.info(f"[WS] Connexion acceptée: {self.user}")

        # Envoyer l'historique (optionnel)
        try:
            await self.send_message_history()
        except Exception as e:
            logger.error(f"⚠️ Erreur envoi historique: {e}")

    async def disconnect(self, close_code):
        """Gère la déconnexion"""
        logger.info(f"[WS] Deconnexion: {self.user}, code: {close_code}")

        # Quitter le groupe
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def receive(self, text_data):
        """Reçoit un message du WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get("type", "message")

            logger.info(f"[WS] Message reçu: {message_type} de {self.user}")

            if message_type == "message":
                await self.handle_message(data)
            elif message_type == "typing":
                await self.handle_typing(data)
            elif message_type == "read":
                await self.handle_read(data)
        except json.JSONDecodeError as e:
            logger.error(f"❌ Erreur JSON: {e}")
        except Exception as e:
            logger.error(f"❌ Erreur receive: {e}")

    async def handle_message(self, data):
        """Gère l'envoi d'un message"""
        message_text = data.get("text", "")
        media = data.get("media")

        if not message_text.strip():
            return

        # Sauvegarder en DB
        message = await self.save_message(message_text, media)

        # Diffuser aux participants
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": message.id,
                    "sender": {
                        "id": self.user.id,
                        "full_name": self.user.full_name,
                        "email": self.user.email,
                        "photo": (
                            self.user.profile_picture.url
                            if self.user.profile_picture
                            else None
                        ),
                    },
                    "text": message.text,
                    "media": message.media.url if message.media else None,
                    "created_at": message.created_at.isoformat(),
                },
            },
        )

    async def chat_message(self, event):
        """Envoie un message au WebSocket"""
        await self.send(text_data=json.dumps(event["message"]))

    async def handle_typing(self, data):
        """Gère l'indicateur de saisie"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_typing",
                "user": {
                    "id": self.user.id,
                    "full_name": self.user.full_name,
                    "email": self.user.email,
                },
                "is_typing": data.get("is_typing", False),
            },
        )

    async def user_typing(self, event):
        """Envoie l'indicateur de saisie au WebSocket"""
        if event["user"]["id"] != self.user.id:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "typing",
                        "user": event["user"],
                        "is_typing": event["is_typing"],
                    }
                )
            )

    @database_sync_to_async
    def check_permission(self):
        """Vérifie si l'utilisateur peut accéder à cette conversation"""
        from app.reservations.models import Reservation
        from app.trajets.models import Trajet

        try:
            if self.conversation_type == "group":
                # Vérifier si l'utilisateur est conducteur ou a une réservation confirmée
                trajet = Trajet.objects.get(id=self.conversation_id)

                is_driver = trajet.conducteur == self.user
                has_reservation = Reservation.objects.filter(
                    trajet_id=self.conversation_id,
                    passager=self.user,
                    status="CONFIRMED",
                ).exists()

                return is_driver or has_reservation
            else:
                # Conversation privée - vérifier que l'utilisateur fait partie
                user_ids = self.conversation_id.split("_")
                return str(self.user.id) in user_ids
        except Exception as e:
            logger.error(f"❌ Erreur check_permission: {e}")
            return False

    @database_sync_to_async
    def save_message(self, text, media):
        """Sauvegarde un message en base de données"""
        from app.notifications.models import Message

        if self.conversation_type == "group":
            # Message de groupe
            message = Message.objects.create(
                sender=self.user,
                trajet_id=self.conversation_id,
                text=text,
                media=media,
                is_group_message=True,
            )
        else:
            # Message privé
            user_ids = self.conversation_id.split("_")
            receiver_id = [uid for uid in user_ids if uid != str(self.user.id)][0]

            message = Message.objects.create(
                sender=self.user,
                receiver_id=receiver_id,
                text=text,
                media=media,
                is_group_message=False,
            )

        return message

    @database_sync_to_async
    def get_message_history(self):
        """Récupère l'historique des messages"""
        from app.messaging.serializers import MessageSerializer
        from app.notifications.models import Message

        if self.conversation_type == "group":
            messages = (
                Message.objects.filter(
                    trajet_id=self.conversation_id, is_group_message=True
                )
                .select_related("sender")
                .order_by("created_at")[:50]
            )
        else:
            user_ids = self.conversation_id.split("_")
            messages = (
                Message.objects.filter(
                    sender_id__in=user_ids,
                    receiver_id__in=user_ids,
                    is_group_message=False,
                )
                .select_related("sender", "receiver")
                .order_by("created_at")[:50]
            )

        # Sérialiser les messages
        serialized = []
        for msg in messages:
            serialized.append(
                {
                    "id": msg.id,
                    "sender": {
                        "id": msg.sender.id,
                        "full_name": msg.sender.full_name,
                        "email": msg.sender.email,
                        "photo": (
                            msg.sender.profile_picture.url
                            if msg.sender.profile_picture
                            else None
                        ),
                    },
                    "text": msg.text,
                    "created_at": msg.created_at.isoformat(),
                    "is_read": msg.is_read,
                }
            )

        return serialized

    async def send_message_history(self):
        """Envoie l'historique des messages"""
        try:
            messages = await self.get_message_history()
            await self.send(
                text_data=json.dumps({"type": "history", "messages": messages})
            )
            logger.info(f"[WS] Historique envoyé: {len(messages)} messages")
        except Exception as e:
            logger.error(f"❌ Erreur envoi historique: {e}")
