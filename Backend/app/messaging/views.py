from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des messages"""

    queryset = Message.objects.select_related("sender", "receiver", "trajet").all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les messages selon l'utilisateur"""
        user = self.request.user
        return self.queryset.filter(Q(sender=user) | Q(receiver=user)).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        """Crée un message avec l'expéditeur automatique"""
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=["get"])
    def conversation(self, request):
        """Récupère la conversation avec un utilisateur spécifique"""
        other_user_id = request.query_params.get("user_id")
        trajet_id = request.query_params.get("trajet_id")

        if not other_user_id:
            return Response(
                {"error": "user_id requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        messages = self.queryset.filter(
            Q(sender=request.user, receiver_id=other_user_id)
            | Q(sender_id=other_user_id, receiver=request.user)
        )

        if trajet_id:
            messages = messages.filter(trajet_id=trajet_id)

        messages = messages.order_by("created_at")

        # Marquer comme lus les messages reçus
        messages.filter(receiver=request.user, is_read=False).update(is_read=True)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Compte les messages non lus"""
        count = self.queryset.filter(receiver=request.user, is_read=False).count()

        return Response({"unread_count": count})

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        """Marque un message comme lu"""
        message = self.get_object()

        if message.receiver != request.user:
            return Response(
                {"error": "Vous ne pouvez marquer que vos propres messages"},
                status=status.HTTP_403_FORBIDDEN,
            )

        message.mark_as_read()
        return Response({"message": "Message marqué comme lu"})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Marque tous les messages comme lus"""
        user_id = request.data.get("user_id")

        messages = self.queryset.filter(receiver=request.user, is_read=False)

        if user_id:
            messages = messages.filter(sender_id=user_id)

        count = messages.update(is_read=True)

        return Response({"message": f"{count} messages marqués comme lus"})


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour la gestion des conversations"""

    queryset = Conversation.objects.prefetch_related("participants").all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les conversations de l'utilisateur"""
        return self.queryset.filter(participants=self.request.user).order_by(
            "-last_activity"
        )

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        """Récupère les messages d'une conversation"""
        conversation = self.get_object()

        messages = Message.objects.filter(
            Q(sender__in=conversation.participants.all())
            & Q(receiver__in=conversation.participants.all())
        )

        if conversation.trajet:
            messages = messages.filter(trajet=conversation.trajet)

        messages = messages.order_by("-created_at")

        from .serializers import MessageSerializer

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
