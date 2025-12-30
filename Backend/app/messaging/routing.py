"""
app/messaging/routing.py ou config/routing.py
Configuration du routing WebSocket
"""

from django.urls import re_path

from app.messaging.consumers import ChatConsumer

websocket_urlpatterns = [
    # ✅ ANCIENNE URL (à supprimer si vous n'utilisez plus)
    # re_path(r'ws/chat/(?P<conversation_type>\w+)/(?P<conversation_id>\w+)/$', ChatConsumer.as_asgi()),
    # ✅ NOUVELLE URL simplifiée (groupes seulement)
    re_path(r"ws/chat/group/(?P<trajet_id>\d+)/$", ChatConsumer.as_asgi()),
    # ✅ Pour les conversations privées
    re_path(r"ws/chat/private/(?P<conversation_id>[\w_]+)/$", ChatConsumer.as_asgi()),
]
