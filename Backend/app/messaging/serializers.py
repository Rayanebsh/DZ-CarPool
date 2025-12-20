from app.users.serializers import UserSerializer
from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages"""

    sender_detail = UserSerializer(source="sender", read_only=True)
    receiver_detail = UserSerializer(source="receiver", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "sender_detail",
            "receiver",
            "receiver_detail",
            "trajet",
            "text",
            "media",
            "media_type",
            "is_read",
            "created_at",
            "read_at",
        ]
        read_only_fields = ["id", "sender", "is_read", "created_at", "read_at"]

    def validate(self, attrs):
        """Valide le message"""
        text = attrs.get("text", "")
        media = attrs.get("media")

        if not text and not media:
            raise serializers.ValidationError(
                "Le message doit contenir du texte ou un média"
            )

        return attrs

    def create(self, validated_data):
        """Crée un nouveau message et une notification"""
        message = super().create(validated_data)

        # Créer une notification pour le destinataire
        from app.notifications.models import Notification

        Notification.objects.create(
            recipient=message.receiver,
            sender=message.sender,
            type="MESSAGE_RECEIVED",
            content=f"Nouveau message de {message.sender.full_name}",
            related_model="Message",
            related_id=message.id,
        )

        return message


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer pour les conversations"""

    participants_detail = UserSerializer(
        source="participants", many=True, read_only=True
    )
    last_message_detail = MessageSerializer(source="last_message", read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participants",
            "participants_detail",
            "trajet",
            "last_message",
            "last_message_detail",
            "last_activity",
            "unread_count",
            "created_at",
        ]
        read_only_fields = ["id", "last_activity", "created_at"]

    def get_unread_count(self, obj):
        """Compte les messages non lus pour l'utilisateur"""
        request = self.context.get("request")
        if not request or not request.user:
            return 0

        return obj.get_unread_count(request.user)
