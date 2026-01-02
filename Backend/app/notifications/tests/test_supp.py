"""
Tests exhaustifs pour NotificationViewSet et MessageViewSet
Objectif: Passer de 53% à 100% de couverture

Instructions d'utilisation:
1. Copiez ce fichier dans app/notifications/tests/test_viewsets_complete.py
2. Exécutez: pytest app/notifications/tests/test_viewsets_complete.py --cov=app/notifications/views --cov-report=html
"""

import base64
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from app.notifications.models import Conversation, Message, Notification
from app.reservations.models import Reservation
from app.trajets.models import Trajet

User = get_user_model()


# ============================================================================
# TESTS NOTIFICATION VIEWSET - COUVERTURE COMPLÈTE
# ============================================================================


class NotificationViewSetCompleteTest(APITestCase):
    """Tests exhaustifs NotificationViewSet pour 100% de couverture"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email="user1@test.com", password="Test1234!",
            first_name="User", last_name="One", phone_number="+213555111111"
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com", password="Test1234!",
            first_name="User", last_name="Two", phone_number="+213555222222"
        )

    # Tests GET /notifications/
    def test_list_filters_by_user_and_orders_correctly(self):
        """Test: liste filtre par user + ordre décroissant"""
        n1 = Notification.objects.create(recipient=self.user1, type="WELCOME", content="1")
        n2 = Notification.objects.create(recipient=self.user2, type="WELCOME", content="2")
        n3 = Notification.objects.create(recipient=self.user1, type="WELCOME", content="3")
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-list"))
        
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["id"], n3.id)  # Plus récente
        self.assertEqual(response.data[1]["id"], n1.id)

    def test_list_unauthenticated(self):
        """Test: liste sans auth = 401"""
        response = self.client.get(reverse("notification-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_empty(self):
        """Test: liste vide si aucune notification"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-list"))
        self.assertEqual(len(response.data), 0)

    # Tests GET /notifications/{id}/
    def test_retrieve_own_notification(self):
        """Test: retrieve notification propre"""
        notif = Notification.objects.create(recipient=self.user1, type="WELCOME", content="Test")
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-detail", kwargs={"pk": notif.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_other_user_notification_404(self):
        """Test: retrieve notification d'un autre = 404"""
        notif = Notification.objects.create(recipient=self.user2, type="WELCOME", content="Test")
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-detail", kwargs={"pk": notif.id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Tests GET /notifications/unread/
    def test_unread_returns_only_unread(self):
        """Test: unread retourne seulement is_read=False"""
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="U1", is_read=False)
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="R", is_read=True)
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="U2", is_read=False)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-unread"))
        self.assertEqual(len(response.data), 2)

    def test_unread_empty(self):
        """Test: unread vide si toutes lues"""
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="R", is_read=True)
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-unread"))
        self.assertEqual(len(response.data), 0)

    # Tests GET /notifications/unread_count/
    def test_unread_count_zero(self):
        """Test: unread_count = 0 si aucune"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-unread-count"))
        self.assertEqual(response.data["unread_count"], 0)

    def test_unread_count_correct(self):
        """Test: unread_count correct"""
        for i in range(5):
            Notification.objects.create(recipient=self.user1, type="WELCOME", content=f"{i}", is_read=False)
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="R", is_read=True)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-unread-count"))
        self.assertEqual(response.data["unread_count"], 5)

    def test_unread_count_only_current_user(self):
        """Test: unread_count seulement pour user courant"""
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="1", is_read=False)
        for i in range(3):
            Notification.objects.create(recipient=self.user2, type="WELCOME", content=f"{i}", is_read=False)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-unread-count"))
        self.assertEqual(response.data["unread_count"], 1)

    # Tests POST /notifications/{id}/mark_as_read/
    def test_mark_as_read_success(self):
        """Test: mark_as_read fonctionne"""
        notif = Notification.objects.create(recipient=self.user1, type="WELCOME", content="T", is_read=False)
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("notification-mark-as-read", kwargs={"pk": notif.id}))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_mark_as_read_already_read(self):
        """Test: mark_as_read sur déjà lue"""
        notif = Notification.objects.create(recipient=self.user1, type="WELCOME", content="T", is_read=True)
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("notification-mark-as-read", kwargs={"pk": notif.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_mark_as_read_other_user_404(self):
        """Test: mark_as_read notification autre user = 404"""
        notif = Notification.objects.create(recipient=self.user2, type="WELCOME", content="T")
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("notification-mark-as-read", kwargs={"pk": notif.id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Tests POST /notifications/mark_all_read/
    def test_mark_all_read_success(self):
        """Test: mark_all_read marque toutes"""
        for i in range(3):
            Notification.objects.create(recipient=self.user1, type="WELCOME", content=f"{i}", is_read=False)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("notification-mark-all-read"))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("3 notifications", response.data["message"])
        self.assertEqual(Notification.objects.filter(recipient=self.user1, is_read=False).count(), 0)

    def test_mark_all_read_none_unread(self):
        """Test: mark_all_read sans non lues"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("notification-mark-all-read"))
        self.assertIn("0 notifications", response.data["message"])

    def test_mark_all_read_only_current_user(self):
        """Test: mark_all_read seulement user courant"""
        for i in range(2):
            Notification.objects.create(recipient=self.user1, type="WELCOME", content=f"U1-{i}", is_read=False)
            Notification.objects.create(recipient=self.user2, type="WELCOME", content=f"U2-{i}", is_read=False)
        
        self.client.force_authenticate(user=self.user1)
        self.client.post(reverse("notification-mark-all-read"))
        
        self.assertEqual(Notification.objects.filter(recipient=self.user2, is_read=False).count(), 2)

    # Tests DELETE /notifications/clear_all/
    def test_clear_all_deletes_only_read(self):
        """Test: clear_all supprime seulement lues"""
        for i in range(2):
            Notification.objects.create(recipient=self.user1, type="WELCOME", content=f"R{i}", is_read=True)
            Notification.objects.create(recipient=self.user1, type="WELCOME", content=f"U{i}", is_read=False)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(reverse("notification-clear-all"))
        
        self.assertIn("2 notifications", response.data["message"])
        self.assertEqual(Notification.objects.filter(recipient=self.user1).count(), 2)

    def test_clear_all_none_read(self):
        """Test: clear_all sans lues"""
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="U", is_read=False)
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(reverse("notification-clear-all"))
        self.assertIn("0 notifications", response.data["message"])

    # Tests GET /notifications/by_type/?type=XXX
    def test_by_type_success(self):
        """Test: by_type filtre correctement"""
        Notification.objects.create(recipient=self.user1, type="WELCOME", content="W")
        Notification.objects.create(recipient=self.user1, type="MESSAGE_RECEIVED", content="M1")
        Notification.objects.create(recipient=self.user1, type="MESSAGE_RECEIVED", content="M2")
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-by-type"), {"type": "MESSAGE_RECEIVED"})
        self.assertEqual(len(response.data), 2)

    def test_by_type_missing_parameter(self):
        """Test: by_type sans paramètre = 400"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-by-type"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_by_type_empty_results(self):
        """Test: by_type sans résultats"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("notification-by-type"), {"type": "INVALID"})
        self.assertEqual(len(response.data), 0)

    # Tests Méthodes non autorisées
    def test_create_not_allowed(self):
        """Test: POST notification = 405"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("notification-list"), {"type": "WELCOME"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_not_allowed(self):
        """Test: PUT notification = 405"""
        notif = Notification.objects.create(recipient=self.user1, type="WELCOME", content="T")
        self.client.force_authenticate(user=self.user1)
        response = self.client.put(reverse("notification-detail", kwargs={"pk": notif.id}), {"content": "U"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_partial_update_not_allowed(self):
        """Test: PATCH notification = 405"""
        notif = Notification.objects.create(recipient=self.user1, type="WELCOME", content="T")
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(reverse("notification-detail", kwargs={"pk": notif.id}), {"content": "U"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_individual_not_allowed(self):
        """Test: DELETE notification individuelle = 405"""
        notif = Notification.objects.create(recipient=self.user1, type="WELCOME", content="T")
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(reverse("notification-detail", kwargs={"pk": notif.id}))
        self.assertEqual(response.status_HTTP_405_METHOD_NOT_ALLOWED)


# ============================================================================
# TESTS MESSAGE VIEWSET - BRANCHES MANQUANTES
# ============================================================================


class MessageViewSetCompleteTest(APITestCase):
    """Tests pour couvrir toutes les branches de MessageViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email="user1@test.com", password="Test1234!",
            first_name="User", last_name="One", phone_number="+213555111111"
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com", password="Test1234!",
            first_name="User", last_name="Two", phone_number="+213555222222"
        )

    # Tests upload_media - Toutes les branches
    def test_upload_media_private_success(self):
        """Test: upload média message privé"""
        image_data = base64.b64encode(b"fake_image_data").decode("utf-8")
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "Photo",
            "media": f"data:image/jpeg;base64,{image_data}",
            "media_type": "image",
            "media_name": "test.jpg",
        }
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_media_group_success(self):
        """Test: upload média message groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1, ville_depart="Alger", ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(), nbr_places=4, places_disponibles=4,
            price=Decimal("500.00"), status="ACTIVE", distance=Decimal("400.00"), fuel_type="gasoil"
        )
        
        image_data = base64.b64encode(b"data").decode("utf-8")
        data = {
            "conversation_type": "group",
            "conversation_id": str(trajet.id),
            "text": "Photo RDV",
            "media": f"data:image/jpeg;base64,{image_data}",
            "media_type": "image",
            "media_name": "rdv.jpg",
        }
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_upload_media_missing_conversation_type(self):
        """Test: upload sans conversation_type = 400"""
        data = {"conversation_id": "123", "text": "Test"}
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_media_missing_conversation_id(self):
        """Test: upload sans conversation_id = 400"""
        data = {"conversation_type": "private", "text": "Test"}
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_media_empty_message(self):
        """Test: upload sans text ni media = 400"""
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "",
        }
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_media_invalid_base64(self):
        """Test: upload avec base64 invalide = 400"""
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "Test",
            "media": "invalid_base64!!!",
            "media_type": "image",
        }
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_media_invalid_conversation_type(self):
        """Test: upload avec type conversation invalide = 400"""
        data = {
            "conversation_type": "invalid",
            "conversation_id": "123",
            "text": "Test",
        }
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_media_group_unauthorized(self):
        """Test: upload groupe sans autorisation = 403"""
        trajet = Trajet.objects.create(
            conducteur=self.user2, ville_depart="Alger", ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(), nbr_places=4, places_disponibles=4,
            price=Decimal("500.00"), status="ACTIVE", distance=Decimal("400.00"), fuel_type="gasoil"
        )
        
        data = {
            "conversation_type": "group",
            "conversation_id": str(trajet.id),
            "text": "Test",
        }
        
        self.client.force_authenticate(user=self.user1)  # Pas conducteur ni passager
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upload_media_group_nonexistent_trajet(self):
        """Test: upload groupe avec trajet inexistant = 404"""
        data = {
            "conversation_type": "group",
            "conversation_id": "99999",
            "text": "Test",
        }
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_upload_media_private_unauthorized(self):
        """Test: upload privé avec mauvais conversation_id = 403"""
        user3 = User.objects.create_user(
            email="user3@test.com", password="Test1234!", phone_number="+213555333333"
        )
        
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user2.id}_{user3.id}",  # user1 pas dedans
            "text": "Test",
        }
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upload_media_private_nonexistent_user(self):
        """Test: upload privé avec user inexistant = 404"""
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_99999",
            "text": "Test",
        }
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_upload_media_updates_conversation(self):
        """Test: upload met à jour la conversation"""
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "Test message",
        }
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(reverse("message-upload-media"), data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Vérifier qu'une conversation a été créée
        self.assertTrue(Conversation.objects.filter(is_group=False).exists())

    @patch('app.messaging.views.logger')
    def test_upload_media_exception_handling(self, mock_logger):
        """Test: upload avec exception interne = 500"""
        data = {
            "conversation_type": "private",
            "conversation_id": f"{self.user1.id}_{self.user2.id}",
            "text": "Test",
        }
        
        self.client.force_authenticate(user=self.user1)
        
        with patch('app.notifications.models.Message.objects.create', side_effect=Exception("DB Error")):
            response = self.client.post(reverse("message-upload-media"), data, format="json")
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            mock_logger.error.assert_called()

    # Tests autres endpoints
    def test_trip_group_messages_driver_access(self):
        """Test: conducteur accède messages groupe"""
        trajet = Trajet.objects.create(
            conducteur=self.user1, ville_depart="Alger", ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(), nbr_places=4, places_disponibles=4,
            price=Decimal("500.00"), status="ACTIVE", distance=Decimal("400.00"), fuel_type="gasoil"
        )
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("message-trip-group-messages", kwargs={"trajet_id": trajet.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_trip_group_messages_passenger_with_confirmed_reservation(self):
        """Test: passager avec réservation confirmée accède messages"""
        trajet = Trajet.objects.create(
            conducteur=self.user1, ville_depart="Alger", ville_arrivee="Oran",
            date=timezone.now().date() + timedelta(days=7),
            heure_depart=timezone.now().time(), nbr_places=4, places_disponibles=4,
            price=Decimal("500.00"), status="ACTIVE", distance=Decimal("400.00"), fuel_type="gasoil"
        )
        
        Reservation.objects.create(
            trajet=trajet, passager=self.user2, nbr_places=1,
            status="CONFIRMED", price_per_seat=trajet.price
        )
        
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(reverse("message-trip-group-messages", kwargs={"trajet_id": trajet.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_trip_group_messages_nonexistent_trajet(self):
        """Test: messages groupe trajet inexistant = 404"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("message-trip-group-messages", kwargs={"trajet_id": 99999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_private_messages_nonexistent_user(self):
        """Test: messages privés user inexistant = 404"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("message-private-messages", kwargs={"other_user_id": 99999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_private_messages_marks_as_read(self):
        """Test: messages privés marque comme lus"""
        Message.objects.create(sender=self.user2, receiver=self.user1, text="Test", is_read=False)
        
        self.client.force_authenticate(user=self.user1)
        self.client.get(reverse("message-private-messages", kwargs={"other_user_id": self.user2.id}))
        
        self.assertEqual(Message.objects.filter(receiver=self.user1, is_read=False).count(), 0)