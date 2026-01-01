import os
import django

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django.setup()

from app.messaging.middleware import JWTAuthMiddleware  # noqa: E402
from app.messaging.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            JWTAuthMiddleware(
                URLRouter(websocket_urlpatterns)
            )
        ),
    }
)
