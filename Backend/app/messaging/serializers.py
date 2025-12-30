# app/messaging/serializers.py
from datetime import datetime

from django.contrib.auth import get_user_model

from rest_framework import serializers

from app.notifications.models import Conversation, Message

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour les utilisateurs"""

    photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "photo"]

    def get_photo(self, obj):
        """Récupère l'URL de la photo de profil"""
        if obj.profile_picture:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class MessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages"""

    sender = UserMinimalSerializer(read_only=True)
    receiver = UserMinimalSerializer(read_only=True)
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "receiver",
            "trajet",
            "text",
            "media",
            "media_url",
            "media_type",
            "is_group_message",
            "is_read",
            "created_at",
            "read_at",
        ]
        read_only_fields = ["sender", "created_at"]

    def get_media_url(self, obj):
        request = self.context.get("request")
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None

    def get_media_url(self, obj):
        if not obj.media:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.media.url)

        return obj.media.url


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer pour les conversations"""

    participants = UserMinimalSerializer(many=True, read_only=True)
    trajet = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "is_group",
            "trajet",
            "participants",
            "last_message",
            "last_activity",
            "unread_count",
            "created_at",
        ]

    def _combine_date_time(self, trajet):
        """Combine les champs date et heure_depart en un datetime ISO"""
        try:
            if trajet.date and trajet.heure_depart:
                combined = datetime.combine(trajet.date, trajet.heure_depart)
                return combined.isoformat()
            elif trajet.date:
                return trajet.date.isoformat()
            return None
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Erreur combinaison date/heure pour trajet {trajet.id}: {e}")
            return None

    def _get_user_photo_url(self, user):
        """Helper pour obtenir l'URL de la photo d'un utilisateur"""
        if user.profile_picture:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(user.profile_picture.url)
            return user.profile_picture.url
        return None

    def get_trajet(self, obj):
        """Retourne les infos du trajet si conversation de groupe"""
        if obj.is_group and obj.trajet:
            try:
                return {
                    "id": obj.trajet.id,
                    "ville_depart": obj.trajet.ville_depart,
                    "ville_arrivee": obj.trajet.ville_arrivee,
                    "date_depart": self._combine_date_time(obj.trajet),
                    "date": str(obj.trajet.date) if obj.trajet.date else None,
                    "heure_depart": (
                        str(obj.trajet.heure_depart)
                        if obj.trajet.heure_depart
                        else None
                    ),
                    "conducteur": {
                        "id": obj.trajet.conducteur.id,
                        "full_name": obj.trajet.conducteur.full_name,
                        "email": obj.trajet.conducteur.email,
                        "photo": self._get_user_photo_url(obj.trajet.conducteur),
                    },
                }
            except Exception as e:
                import logging

                logger = logging.getLogger(__name__)
                logger.error(f"Erreur sérialisation trajet {obj.trajet.id}: {e}")

                return {
                    "id": obj.trajet.id,
                    "ville_depart": getattr(obj.trajet, "ville_depart", "N/A"),
                    "ville_arrivee": getattr(obj.trajet, "ville_arrivee", "N/A"),
                    "date_depart": None,
                    "conducteur": {
                        "id": obj.trajet.conducteur.id,
                        "full_name": obj.trajet.conducteur.full_name,
                        "email": obj.trajet.conducteur.email,
                        "photo": None,
                    },
                }
        return None

    def get_last_message(self, obj):
        """Retourne le dernier message"""
        try:
            if obj.is_group and obj.trajet:
                last_msg = (
                    Message.objects.filter(trajet=obj.trajet, is_group_message=True)
                    .order_by("-created_at")
                    .first()
                )
            else:
                participants = obj.participants.all()
                if participants.count() < 2:
                    return None

                last_msg = (
                    Message.objects.filter(
                        sender__in=participants,
                        receiver__in=participants,
                        is_group_message=False,
                    )
                    .order_by("-created_at")
                    .first()
                )

            if last_msg:
                return {
                    "text": last_msg.text,
                    "created_at": last_msg.created_at.isoformat(),
                    "sender": {
                        "id": last_msg.sender.id,
                        "full_name": last_msg.sender.full_name,
                    },
                }
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Erreur récupération dernier message: {e}")

        return None

    def get_unread_count(self, obj):
        """Retourne le nombre de messages non lus"""
        try:
            request = self.context.get("request")
            if not request or not request.user.is_authenticated:
                return 0

            return obj.get_unread_count(request.user)
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Erreur calcul messages non lus: {e}")
            return 0
