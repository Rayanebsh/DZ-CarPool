import base64
from datetime import timedelta
from decimal import Decimal
from unittest.mock import MagicMock, Mock, patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app.notifications.models import Conversation, Message, Notification
from app.notifications.serializers import NotificationSerializer
from app.notifications.utils import (
    create_notification,
    notify_reservation_approved,
    notify_reservation_cancelled,
    notify_reservation_rejected,
    notify_welcome,
)
from app.reservations.models import Reservation
from app.trajets.models import Trajet
from app.users.models import UserDocument

User = get_user_model()


# ============================================================================
# MIXINS ET CLASSES DE BASE
# ============================================================================


class NotificationTestMixin:
    """Mixin pour les tests de notifications avec données de test"""

    def setUp(self):
        """Configuration initiale"""
        self.client = APIClient()

        # Créer les utilisateurs
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            password="Test1234!",
            first_name="User",
            last_name="One",
            phone_number="+213555111111",
        )

        self.user2 = User.objects.create_user(
            email="user2@test.com",
            password="Test1234!",
            first_name="User",
            last_name="Two",
            phone_number="+213555222222",
        )

        self.user3 = User.objects.create_user(
            email="user3@test.com",
            password="Test1234!",
            first_name="User",
            last_name="Three",
            phone_number="+213555333333",
        )


# ============================================================================
# TESTS DES MODÈLES - Notification
# ============================================================================


class NotificationModelTest(NotificationTestMixin, TestCase):
    """Tests du modèle Notification"""

    def test_create_notification(self):
        """Test création d'une notification"""
        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            type="MESSAGE_RECEIVED",
            content="Test message",
        )

        self.assertEqual(notification.recipient, self.user1)
        self.assertEqual(notification.sender, self.user2)
        self.assertEqual(notification.type, "MESSAGE_RECEIVED")
        self.assertFalse(notification.is_read)

    def test_notification_str(self):
        """Test représentation string"""
        notification = Notification.objects.create(
            recipient=self.user1,
            type="WELCOME",
            content="Bienvenue",
        )

        expected = f"Notification pour {self.user1.full_name}: WELCOME"
        self.assertEqual(str(notification), expected)

    def test_mark_as_read(self):
        """Test marquer comme lu"""
        notification = Notification.objects.create(
            recipient=self.user1,
            type="WELCOME",
            content="Test",
        )

        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)

        notification.mark_as_read()

        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)

    def test_mark_as_read_already_read(self):
        """Test marquer comme lu une notification déjà lue"""
        notification = Notification.objects.create(
            recipient=self.user1,
            type="WELCOME",
            content="Test",
            is_read=True,
        )

        first_read_at = notification.read_at
        notification.mark_as_read()

        # read_at ne devrait pas changer
        self.assertEqual(notification.read_at, first_read_at)

    def test_get_related_object_reservation(self):
        """Test récupération d'objet lié (Reservation)"""
        # Créer un trajet et une réservation
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        reservation = Reservation.objects.create(
            trajet=trajet,
            passager=self.user2,
            nbr_places=1,
            status="PENDING",
            price_per_seat=trajet.price,
        )

        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            type="RESERVATION_REQUEST",
            content="Test",
            related_model="Reservation",
            related_id=reservation.id,
        )

        related = notification.get_related_object()
        self.assertEqual(related, reservation)

    def test_get_related_object_none(self):
        """Test récupération sans objet lié"""
        notification = Notification.objects.create(
            recipient=self.user1,
            type="WELCOME",
            content="Test",
        )

        related = notification.get_related_object()
        self.assertIsNone(related)

    def test_get_related_object_not_found(self):
        """Test récupération d'objet inexistant"""
        notification = Notification.objects.create(
            recipient=self.user1,
            type="RESERVATION_REQUEST",
            content="Test",
            related_model="Reservation",
            related_id=99999,
        )

        related = notification.get_related_object()
        self.assertIsNone(related)


# ============================================================================
# TESTS DES MODÈLES - Message et Conversation
# ============================================================================


class MessageModelTest(NotificationTestMixin, TestCase):
    """Tests du modèle Message"""

    def test_create_private_message(self):
        """Test création message privé"""
        message = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Hello!",
            is_group_message=False,
        )

        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.text, "Hello!")
        self.assertFalse(message.is_group_message)
        self.assertFalse(message.is_read)

    def test_create_group_message(self):
        """Test création message de groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        message = Message.objects.create(
            sender=self.user1,
            trajet=trajet,
            text="Rendez-vous à 8h!",
            is_group_message=True,
        )

        self.assertEqual(message.trajet, trajet)
        self.assertTrue(message.is_group_message)
        self.assertIsNone(message.receiver)

    def test_message_str_private(self):
        """Test représentation string message privé"""
        message = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Test",
            is_group_message=False,
        )

        expected = f"Message de {self.user1.full_name} à {self.user2.full_name}"
        self.assertEqual(str(message), expected)

    def test_message_str_group(self):
        """Test représentation string message groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        message = Message.objects.create(
            sender=self.user1,
            trajet=trajet,
            text="Test",
            is_group_message=True,
        )

        self.assertIn("groupe trajet", str(message))

    def test_mark_message_as_read(self):
        """Test marquer message comme lu"""
        message = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Test",
            is_group_message=False,
        )

        self.assertFalse(message.is_read)
        self.assertIsNone(message.read_at)

        message.mark_as_read()

        self.assertTrue(message.is_read)
        self.assertIsNotNone(message.read_at)

    def test_message_with_media(self):
        """Test message avec média"""
        media_file = SimpleUploadedFile(
            "test.jpg", b"file_content", content_type="image/jpeg"
        )

        message = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Photo!",
            media=media_file,
            media_type="image",
            is_group_message=False,
        )

        self.assertIsNotNone(message.media)
        self.assertEqual(message.media_type, "image")


class ConversationModelTest(NotificationTestMixin, TestCase):
    """Tests du modèle Conversation"""

    def test_create_private_conversation(self):
        """Test création conversation privée"""
        conversation = Conversation.objects.create(is_group=False)
        conversation.participants.add(self.user1, self.user2)

        self.assertFalse(conversation.is_group)
        self.assertEqual(conversation.participants.count(), 2)

    def test_create_group_conversation(self):
        """Test création conversation de groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        conversation = Conversation.objects.create(trajet=trajet, is_group=True)
        conversation.participants.add(self.user1, self.user2, self.user3)

        self.assertTrue(conversation.is_group)
        self.assertEqual(conversation.trajet, trajet)
        self.assertEqual(conversation.participants.count(), 3)

    def test_conversation_str_group(self):
        """Test représentation string groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        conversation = Conversation.objects.create(trajet=trajet, is_group=True)

        self.assertIn("Groupe:", str(conversation))
        self.assertIn("Alger", str(conversation))
        self.assertIn("Oran", str(conversation))

    def test_conversation_str_private(self):
        """Test représentation string privée"""
        conversation = Conversation.objects.create(is_group=False)
        conversation.participants.add(self.user1, self.user2)

        result = str(conversation)
        self.assertIn("Conversation:", result)

    def test_get_unread_count_private(self):
        """Test comptage messages non lus (privé)"""
        conversation = Conversation.objects.create(is_group=False)
        conversation.participants.add(self.user1, self.user2)

        # Créer des messages
        Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Message 1",
            is_read=False,
        )
        Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Message 2",
            is_read=False,
        )
        Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Message 3",
            is_read=True,
        )

        count = conversation.get_unread_count(self.user2)
        self.assertEqual(count, 2)

    def test_get_unread_count_group(self):
        """Test comptage messages non lus (groupe)"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        conversation = Conversation.objects.create(trajet=trajet, is_group=True)
        conversation.participants.add(self.user1, self.user2)

        # Créer des messages de groupe
        Message.objects.create(
            sender=self.user1,
            trajet=trajet,
            text="Message groupe 1",
            is_group_message=True,
            is_read=False,
        )
        Message.objects.create(
            sender=self.user1,
            trajet=trajet,
            text="Message groupe 2",
            is_group_message=True,
            is_read=False,
        )

        count = conversation.get_unread_count(self.user2)
        self.assertEqual(count, 2)


# ============================================================================
# TESTS DES UTILITAIRES (utils.py)
# ============================================================================


class NotificationUtilsTest(NotificationTestMixin, TestCase):
    """Tests des fonctions utilitaires de notifications"""

    @patch("app.notifications.utils.get_channel_layer")
    def test_create_notification(self, mock_channel_layer):
        """Test création de notification avec WebSocket"""
        mock_layer = MagicMock()
        mock_channel_layer.return_value = mock_layer

        notification = create_notification(
            recipient=self.user1,
            notification_type="WELCOME",
            content="Bienvenue!",
            sender=self.user2,
        )

        self.assertIsNotNone(notification)
        self.assertEqual(notification.recipient, self.user1)
        self.assertEqual(notification.sender, self.user2)
        self.assertEqual(notification.type, "WELCOME")

        # Vérifier que group_send a été appelé
        mock_layer.group_send.assert_called_once()

    @patch("app.notifications.utils.get_channel_layer")
    def test_create_notification_websocket_error(self, mock_channel_layer):
        """Test création avec erreur WebSocket"""
        mock_layer = MagicMock()
        mock_layer.group_send.side_effect = Exception("WebSocket error")
        mock_channel_layer.return_value = mock_layer

        # Ne devrait pas lever d'exception
        notification = create_notification(
            recipient=self.user1,
            notification_type="WELCOME",
            content="Test",
        )

        # La notification devrait quand même être créée
        self.assertIsNotNone(notification)

    @patch("app.notifications.utils.create_notification")
    def test_notify_reservation_approved(self, mock_create):
        """Test notification réservation approuvée"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        reservation = Reservation.objects.create(
            trajet=trajet,
            passager=self.user2,
            nbr_places=1,
            status="CONFIRMED",
            price_per_seat=trajet.price,
        )

        notify_reservation_approved(
            passenger=self.user2, driver=self.user1, reservation=reservation
        )

        mock_create.assert_called_once()
        call_args = mock_create.call_args[1]
        self.assertEqual(call_args["recipient"], self.user2)
        self.assertEqual(call_args["notification_type"], "RESERVATION_APPROVED")

    @patch("app.notifications.utils.create_notification")
    def test_notify_reservation_rejected(self, mock_create):
        """Test notification réservation rejetée"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        reservation = Reservation.objects.create(
            trajet=trajet,
            passager=self.user2,
            nbr_places=1,
            status="REJECTED",
            price_per_seat=trajet.price,
        )

        notify_reservation_rejected(
            passenger=self.user2, driver=self.user1, reservation=reservation
        )

        mock_create.assert_called_once()
        call_args = mock_create.call_args[1]
        self.assertEqual(call_args["notification_type"], "RESERVATION_REJECTED")

    @patch("app.notifications.utils.create_notification")
    def test_notify_reservation_cancelled(self, mock_create):
        """Test notification réservation annulée"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        reservation = Reservation.objects.create(
            trajet=trajet,
            passager=self.user2,
            nbr_places=1,
            status="CANCELLED",
            price_per_seat=trajet.price,
        )

        notify_reservation_cancelled(
            driver=self.user1, passenger=self.user2, reservation=reservation
        )

        mock_create.assert_called_once()
        call_args = mock_create.call_args[1]
        self.assertEqual(call_args["notification_type"], "RESERVATION_CANCELLED")

    @patch("app.notifications.utils.create_notification")
    def test_notify_welcome(self, mock_create):
        """Test notification de bienvenue"""
        notify_welcome(self.user1)

        mock_create.assert_called_once()
        call_args = mock_create.call_args[1]
        self.assertEqual(call_args["recipient"], self.user1)
        self.assertEqual(call_args["notification_type"], "WELCOME")


# ============================================================================
# TESTS DES VIEWSETS - Notifications
# ============================================================================


class NotificationViewSetTest(NotificationTestMixin, APITestCase):
    """Tests du NotificationViewSet"""

    def test_trip_group_messages_unauthorized(self):
        """Test accès non autorisé aux messages de groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        # user3 n'a pas de réservation
        self.client.force_authenticate(user=self.user3)
        url = reverse(
            "messaging:message-trip-group-messages", kwargs={"trajet_id": trajet.id}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mark_message_as_read(self):
        """Test marquer message comme lu"""
        message = Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Test", is_read=False
        )

        self.client.force_authenticate(user=self.user2)
        url = reverse("messaging:message-mark-as-read", kwargs={"pk": message.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        message.refresh_from_db()
        self.assertTrue(message.is_read)

    def test_mark_all_messages_read(self):
        """Test marquer tous les messages comme lus"""
        Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Test 1", is_read=False
        )
        Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Test 2", is_read=False
        )

        self.client.force_authenticate(user=self.user2)
        response = self.client.post(
            reverse("messaging:message-mark-all-read"), {"user_id": self.user1.id}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unread = Message.objects.filter(receiver=self.user2, is_read=False).count()
        self.assertEqual(unread, 0)

    def test_unread_count(self):
        """Test comptage messages non lus"""
        Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Test 1", is_read=False
        )
        Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Test 2", is_read=False
        )

        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse("messaging:message-unread-count"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 2)

    def test_upload_media_private(self):
        """Test upload média message privé"""
        # Créer une image de test en base64
        image_data = base64.b64encode(b"fake_image_data").decode("utf-8")

        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "Voici une photo",
            "media": f"data:image/jpeg;base64,{image_data}",
            "media_type": "image",
            "media_name": "test.jpg",
        }

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            reverse("messaging:message-upload-media"), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data.get("media"))

    def test_upload_media_group(self):
        """Test upload média message groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        image_data = base64.b64encode(b"fake_image_data").decode("utf-8")

        data = {
            "conversation_type": "group",
            "conversation_id": str(trajet.id),
            "text": "Photo du point de RDV",
            "media": f"data:image/jpeg;base64,{image_data}",
            "media_type": "image",
            "media_name": "rdv.jpg",
        }

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            reverse("messaging:message-upload-media"), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_media_missing_parameters(self):
        """Test upload média sans paramètres requis"""
        data = {"text": "Test"}

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            reverse("messaging:message-upload-media"), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_media_empty_message(self):
        """Test upload sans texte ni média"""
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "",
        }

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            reverse("messaging:message-upload-media"), data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ============================================================================
# TESTS DES VIEWSETS - Conversations
# ============================================================================


class ConversationViewSetTest(NotificationTestMixin, APITestCase):
    """Tests du ConversationViewSet"""

    def test_my_groups(self):
        """Test liste des groupes"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        conv_group = Conversation.objects.create(trajet=trajet, is_group=True)
        conv_group.participants.add(self.user1, self.user2)

        conv_private = Conversation.objects.create(is_group=False)
        conv_private.participants.add(self.user1, self.user2)

        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("messaging:conversation-my-groups"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Seulement le groupe

    def test_conversation_messages(self):
        """Test récupération messages d'une conversation"""
        conversation = Conversation.objects.create(is_group=False)
        conversation.participants.add(self.user1, self.user2)

        Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Message 1",
            conversation=conversation,
        )
        Message.objects.create(
            sender=self.user2,
            receiver=self.user1,
            text="Message 2",
            conversation=conversation,
        )

        self.client.force_authenticate(user=self.user1)
        url = reverse("messaging:conversation-messages", kwargs={"pk": conversation.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ============================================================================
# TESTS DES SIGNAUX
# ============================================================================


@override_settings(TESTING=True)
class NotificationSignalsTest(NotificationTestMixin, TestCase):
    """Tests des signaux de notifications"""

    @patch("app.notifications.signals.notify_new_message")
    def test_message_signal_private(self, mock_notify):
        mock_notify.assert_called_once()
        call_args = mock_notify.call_args[1]
        self.assertEqual(call_args["sender"], self.user1)
        self.assertEqual(call_args["recipient"], self.user2)

    @patch("app.notifications.signals.notify_new_message")
    def test_message_signal_group(self, mock_notify):
        """Test signal message groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        # Créer une réservation confirmée
        UserDocument.objects.create(user=self.user2, document_type="CNI", verified=True)
        Reservation.objects.create(
            trajet=trajet,
            passager=self.user2,
            nbr_places=1,
            status="CONFIRMED",
            price_per_seat=trajet.price,
        )
        # Devrait notifier le passager
        self.assertTrue(mock_notify.called)


# ============================================================================
# TESTS DES SERIALIZERS
# ============================================================================


class NotificationSerializerTest(NotificationTestMixin, TestCase):
    """Tests du NotificationSerializer"""

    def test_serialize_notification(self):
        """Test sérialisation notification"""
        notification = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            type="WELCOME",
            content="Test",
        )

        serializer = NotificationSerializer(notification)
        data = serializer.data

        self.assertEqual(data["type"], "WELCOME")
        self.assertEqual(data["content"], "Test")
        self.assertIn("sender_detail", data)
        self.assertEqual(data["sender_detail"]["id"], self.user2.id)

    def test_related_object_field(self):
        """Test champ related_object"""
        trajet = Trajet.objects.create(
            conducteur=self.user1,
            ville_depart="Alger",
            ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(),
            nbr_places=4,
            places_disponibles=4,
            price=Decimal("500.00"),
            status="ACTIVE",
            distance=Decimal("400.00"),
            fuel_type="gasoil",
        )

        reservation = Reservation.objects.create(
            trajet=trajet,
            passager=self.user2,
            nbr_places=1,
            status="PENDING",
            price_per_seat=trajet.price,
        )

        notification = Notification.objects.create(
            recipient=self.user1,
            type="RESERVATION_REQUEST",
            content="Test",
            related_model="Reservation",
            related_id=reservation.id,
        )

        serializer = NotificationSerializer(notification)
        data = serializer.data

        self.assertIsNotNone(data["related_object"])
        self.assertEqual(data["related_object"]["type"], "Reservation")
        self.assertEqual(data["related_object"]["id"], reservation.id)


# ============================================================================
# TESTS DES PERMISSIONS
# ============================================================================


class MessagePermissionsTest(NotificationTestMixin, TestCase):
    """Tests des permissions de messagerie"""

    def test_is_message_participant(self):
        """Test permission IsMessageParticipant"""
        from app.messaging.permissions import IsMessageParticipant

        message = Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Test"
        )

        permission = IsMessageParticipant()

        # Mock request
        request = Mock()
        request.user = self.user1

        # Le sender a la permission
        self.assertTrue(permission.has_object_permission(request, None, message))

        # Le receiver a la permission
        request.user = self.user2
        self.assertTrue(permission.has_object_permission(request, None, message))

        # Un autre utilisateur n'a pas la permission
        request.user = self.user3
        self.assertFalse(permission.has_object_permission(request, None, message))

    def test_is_conversation_participant(self):
        """Test permission IsConversationParticipant"""
        from app.messaging.permissions import IsConversationParticipant

        conversation = Conversation.objects.create(is_group=False)
        conversation.participants.add(self.user1, self.user2)

        permission = IsConversationParticipant()

        # Mock request
        request = Mock()
        request.user = self.user1

        # Participant a la permission
        self.assertTrue(permission.has_object_permission(request, None, conversation))

        # Non-participant n'a pas la permission
        request.user = self.user3
        self.assertFalse(permission.has_object_permission(request, None, conversation))


# ============================================================================
# TESTS D'INTÉGRATION
# ============================================================================


class NotificationIntegrationTest(NotificationTestMixin, APITestCase):
    """Tests d'intégration du système de notifications"""

    @patch("app.notifications.utils.get_channel_layer")
    def test_complete_notification_flow(self, mock_channel_layer):
        """Test flux complet de notification"""
        mock_layer = MagicMock()
        mock_channel_layer.return_value = mock_layer
        UserDocument.objects.create(user=self.user2, document_type="CNI", verified=True)
        # 2. Vérifier que la notification existe
        notifications = Notification.objects.filter(
            recipient=self.user1, type="RESERVATION_REQUEST"
        )
        self.assertTrue(notifications.exists())

        # 3. Lire la notification via API
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notifications:notification-unread"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

        # 4. Marquer comme lue
        notification = notifications.first()
        url = reverse(
            "notifications:notification-mark-as-read", kwargs={"pk": notification.id}
        )
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)


# ============================================================================
# TESTS DE SÉCURITÉ
# ============================================================================


class SecurityTest(NotificationTestMixin, APITestCase):
    """Tests de sécurité"""

    def test_cannot_access_other_user_notifications(self):
        """Test: ne peut pas accéder aux notifications d'un autre"""
        notification = Notification.objects.create(
            recipient=self.user1, type="WELCOME", content="Test"
        )

        self.client.force_authenticate(user=self.user2)
        url = reverse(
            "notifications:notification-detail", kwargs={"pk": notification.id}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_mark_other_user_notification_as_read(self):
        """Test: ne peut pas marquer la notification d'un autre comme lue"""
        notification = Notification.objects.create(
            recipient=self.user1, type="WELCOME", content="Test"
        )

        self.client.force_authenticate(user=self.user2)
        url = reverse(
            "notifications:notification-mark-as-read", kwargs={"pk": notification.id}
        )
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_read_other_user_messages(self):
        """Test: ne peut pas lire les messages d'un autre"""
        message = Message.objects.create(
            sender=self.user1, receiver=self.user2, text="Private"
        )

        self.client.force_authenticate(user=self.user3)
        url = reverse("messaging:message-detail", kwargs={"pk": message.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_xss_protection_in_message(self):
        """Test protection XSS dans les messages"""
        self.client.force_authenticate(user=self.user1)

        data = {
            "receiver": self.user2.id,
            "text": "<script>alert('XSS')</script>",
            "is_group_message": False,
        }

        response = self.client.post(
            reverse("messaging:message-list"), data, format="json"
        )

        # Le message doit être accepté (Django échappe automatiquement)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
