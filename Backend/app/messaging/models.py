"""
Compatibility shim: the messaging models are defined in `app.notifications.models`
in this repository layout (historical/packaging reasons). Re-export them here
so imports from `app.messaging.models` continue to work.
"""

from app.notifications.models import Message, Conversation  # noqa: F401
