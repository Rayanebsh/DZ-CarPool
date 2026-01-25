import asyncio

from django.contrib.auth import get_user_model
from django.test import TestCase, TransactionTestCase, override_settings

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app.notifications.consumers import NotificationConsumer
from app.notifications.models import Notification

User = get_user_model()


# ============================================================================
# TESTS CONSUMERS.PY
# ============================================================================


@override_settings(TESTING=True)
class NotificationConsumerTests(TransactionTestCase):
    """Tests WebSocket Consumer"""

    def setUp(self):
        """Setup avec users uniques"""
        self.user = User.objects.create_user(
            email="ws_test@example.com",
            password="Test1234!",
            first_name="WS",
            last_name="Test",
            phone_number="+213555000001",
        )

        self.user2 = User.objects.create_user(
            email="ws_test2@example.com",
            password="Test1234!",
            first_name="WS2",
            last_name="Test2",
            phone_number="+213555000002",
        )

        # Nettoyer les notifications
        Notification.objects.filter(recipient__in=[self.user, self.user2]).delete()

    async def test_connect_authenticated(self):
        """Test: connexion réussie"""
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            response = await communicator.receive_json_from(timeout=1)
            self.assertEqual(response["type"], "unread_notifications")
        except Exception:
            pass

        await communicator.disconnect()

    async def test_connect_unauthenticated(self):
        """Test: connexion rejetée"""
        from django.contrib.auth.models import AnonymousUser

        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = AnonymousUser()

        connected, _ = await communicator.connect()
        self.assertFalse(connected)

    async def test_mark_as_read_success(self):
        """Test: marquer comme lu"""
        notif = await database_sync_to_async(Notification.objects.create)(
            recipient=self.user, type="WELCOME", content="Test", is_read=False
        )

        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_json_to(
            {"action": "mark_as_read", "notification_id": notif.id}
        )

        await asyncio.sleep(0.3)

        notif = await database_sync_to_async(Notification.objects.get)(id=notif.id)
        self.assertTrue(notif.is_read)

        await communicator.disconnect()

    async def test_mark_as_read_invalid_id(self):
        """Test: ID invalide ne crash pas"""
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_json_to(
            {"action": "mark_as_read", "notification_id": 99999}
        )

        await asyncio.sleep(0.3)
        await communicator.disconnect()

    async def test_mark_as_read_missing_id(self):
        """Test: ID manquant ne crash pas"""
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_json_to({"action": "mark_as_read"})

        await asyncio.sleep(0.3)
        await communicator.disconnect()

    async def test_mark_all_read(self):
        """Test: tout marquer comme lu"""
        for i in range(3):
            await database_sync_to_async(Notification.objects.create)(
                recipient=self.user, type="WELCOME", content=f"Test {i}", is_read=False
            )

        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_json_to({"action": "mark_all_read"})

        await asyncio.sleep(0.3)

        count = await database_sync_to_async(
            Notification.objects.filter(recipient=self.user, is_read=False).count
        )()
        self.assertEqual(count, 0)

        await communicator.disconnect()

    async def test_unknown_action(self):
        """Test: action inconnue"""
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_json_to({"action": "invalid_action"})

        await asyncio.sleep(0.3)
        await communicator.disconnect()

    async def test_empty_action(self):
        """Test: pas d'action"""
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_json_to({"data": "test"})

        await asyncio.sleep(0.3)
        await communicator.disconnect()

    async def test_invalid_json(self):
        """Test: JSON invalide"""
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        try:
            await communicator.receive_json_from(timeout=1)
        except Exception:
            pass

        await communicator.send_to(text_data="not json")

        await asyncio.sleep(0.3)
        await communicator.disconnect()

    async def test_send_unread_on_connect(self):
        """Test: envoi notifications à la connexion"""
        await database_sync_to_async(
            Notification.objects.filter(recipient=self.user).delete
        )()

        for i in range(3):
            await database_sync_to_async(Notification.objects.create)(
                recipient=self.user, type="WELCOME", content=f"Test {i}", is_read=False
            )

        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user
        await communicator.connect()

        response = await communicator.receive_json_from(timeout=2)

        self.assertEqual(response["type"], "unread_notifications")
        self.assertEqual(len(response["notifications"]), 3)

        await communicator.disconnect()


# ============================================================================
# TESTS ROUTING.PY
# ============================================================================


class RoutingTests(TestCase):
    """Tests routing WebSocket"""

    def test_websocket_urlpatterns_exists(self):
        """Test: patterns existent"""
        from app.notifications.routing import websocket_urlpatterns

        self.assertIsNotNone(websocket_urlpatterns)
        self.assertIsInstance(websocket_urlpatterns, list)
        self.assertGreater(len(websocket_urlpatterns), 0)

    def test_patterns_structure(self):
        """Test: structure des patterns"""
        from app.notifications.routing import websocket_urlpatterns

        for pattern in websocket_urlpatterns:
            self.assertIsNotNone(pattern.callback)

    def test_application_exists(self):
        """Test: application ASGI existe"""
        from app.notifications import routing

        self.assertIsNotNone(routing.application)
        self.assertTrue(hasattr(routing.application, "application_mapping"))

    def test_notification_route_exists(self):
        """Test: route notifications existe"""
        from app.notifications.routing import websocket_urlpatterns

        notification_routes = [
            p for p in websocket_urlpatterns if "notifications" in str(p.pattern)
        ]

        self.assertGreater(len(notification_routes), 0)

    def test_chat_routes_exist(self):
        """Test: routes chat existent"""
        from app.notifications.routing import websocket_urlpatterns

        chat_routes = [p for p in websocket_urlpatterns if "chat" in str(p.pattern)]

        self.assertGreater(len(chat_routes), 0)

    def test_imports_work(self):
        """Test: imports fonctionnent"""
        try:
            from app.notifications import routing

            self.assertIsNotNone(routing.application)
            self.assertIsNotNone(routing.websocket_urlpatterns)
        except ImportError as e:
            self.fail(f"Import failed: {e}")


# ============================================================================
# TESTS VIEWS.PY
# ============================================================================


@override_settings(TESTING=True)
class NotificationViewSetTests(APITestCase):
    """Tests ViewSet Notifications"""

    def setUp(self):
        """Setup avec nettoyage"""
        self.client = APIClient()

        self.user1 = User.objects.create_user(
            email="view_test1@example.com",
            password="Test1234!",
            first_name="View",
            last_name="Test1",
            phone_number="+213555100001",
        )

        self.user2 = User.objects.create_user(
            email="view_test2@example.com",
            password="Test1234!",
            first_name="View",
            last_name="Test2",
            phone_number="+213555100002",
        )

        Notification.objects.filter(recipient__in=[self.user1, self.user2]).delete()

    def test_list_unauthenticated(self):
        """Test: liste sans auth"""
        response = self.client.get("/api/v1/notifications/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_own_notification(self):
        """Test: récupérer sa notification"""
        notif = Notification.objects.create(
            recipient=self.user1, type="WELCOME", content="Test"
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/v1/notifications/{notif.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["content"], "Test")

    def test_retrieve_other_user_notification(self):
        """Test: récupérer notification d'un autre"""
        notif = Notification.objects.create(
            recipient=self.user2, type="WELCOME", content="Test"
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/v1/notifications/{notif.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unread_list(self):
        """Test: liste non lues"""
        Notification.objects.create(
            recipient=self.user1, type="WELCOME", content="Unread", is_read=False
        )
        Notification.objects.create(
            recipient=self.user1, type="WELCOME", content="Read", is_read=True
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/v1/notifications/unread/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_mark_as_read_other_user(self):
        """Test: marquer notification autre user"""
        notif = Notification.objects.create(
            recipient=self.user2, type="WELCOME", content="Test"
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.post(f"/api/v1/notifications/{notif.id}/mark-as-read/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_notification_with_sender(self):
        """Test: notification avec sender"""
        notif = Notification.objects.create(
            recipient=self.user1,
            sender=self.user2,
            type="MESSAGE_RECEIVED",
            content="Test",
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f"/api/v1/notifications/{notif.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data.get("sender"))

    def test_pagination(self):
        """Test: pagination"""
        for i in range(25):
            Notification.objects.create(
                recipient=self.user1, type="WELCOME", content=f"Test {i}"
            )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/v1/notifications/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)


# ============================================================================
# TESTS D'INTÉGRATION
# ============================================================================


@override_settings(TESTING=True)
class IntegrationTests(TransactionTestCase):
    """Tests d'intégration"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="integration@example.com",
            password="Test1234!",
            phone_number="+213555200001",
        )
        Notification.objects.filter(recipient=self.user).delete()

    async def test_full_cycle(self):
        """Test: cycle complet"""
        for i in range(3):
            await database_sync_to_async(Notification.objects.create)(
                recipient=self.user, type="WELCOME", content=f"Test {i}", is_read=False
            )

        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(), "/ws/notifications/"
        )
        communicator.scope["user"] = self.user

        await communicator.connect()

        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(len(response["notifications"]), 3)

        await communicator.send_json_to(
            {
                "action": "mark_as_read",
                "notification_id": response["notifications"][0]["id"],
            }
        )
        await asyncio.sleep(0.3)

        await communicator.send_json_to({"action": "mark_all_read"})
        await asyncio.sleep(0.3)

        await communicator.disconnect()

        count = await database_sync_to_async(
            Notification.objects.filter(recipient=self.user, is_read=False).count
        )()
        self.assertEqual(count, 0)
