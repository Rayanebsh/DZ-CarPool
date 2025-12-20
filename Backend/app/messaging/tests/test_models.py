# ============================================================================
# apps/messaging/tests/test_models.py
# ============================================================================

import pytest
from app.messaging.models import Message


@pytest.mark.django_db
class TestMessageModel:
    """Tests pour le modèle Message"""

    def test_create_message(self, user, conducteur):
        """Test de création de message"""
        message = Message.objects.create(
            sender=user,
            receiver=conducteur,
            text="Bonjour, je suis intéressé par votre trajet",
        )

        assert message.sender == user
        assert message.receiver == conducteur
        assert message.is_read is False

    def test_mark_as_read(self, user, conducteur):
        """Test de marquage comme lu"""
        message = Message.objects.create(
            sender=user, receiver=conducteur, text="Test message"
        )

        message.mark_as_read()

        assert message.is_read is True
        assert message.read_at is not None
