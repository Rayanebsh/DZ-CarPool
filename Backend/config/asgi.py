# config/asgi.py
"""
Configuration ASGI pour le projet avec support WebSocket
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Initialiser Django AVANT d'importer Channels
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from app.messaging.middleware import JWTAuthMiddleware
from app.messaging.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        # HTTP normal
        "http": django_asgi_app,
        # WebSocket avec authentification JWT
        "websocket": AllowedHostsOriginValidator(
            JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
        ),
    }
)
