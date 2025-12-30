from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from app.notifications.consumers import NotificationConsumer
from app.messaging.consumers import ChatConsumer

websocket_urlpatterns = [
    # Notifications
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    
    # Messagerie - Groupe
    path("ws/chat/group/<int:trajet_id>/", ChatConsumer.as_asgi()),
    
    # Messagerie - Privée
    path("ws/chat/private/<str:conversation_id>/", ChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})

