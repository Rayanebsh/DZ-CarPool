# ============================================================================
# apps/notifications/tests/test_models.py
# ============================================================================

import pytest
from app.notifications.models import Notification


@pytest.mark.django_db
class TestNotificationModel:
    """Tests pour le modèle Notification"""
    
    def test_create_notification(self, user, conducteur):
        """Test de création de notification"""
        notification = Notification.objects.create(
            recipient=user,
            sender=conducteur,
            type='MESSAGE_RECEIVED',
            content='Nouveau message de Test Driver'
        )
        
        assert notification.recipient == user
        assert notification.is_read is False
    
    def test_mark_as_read(self, user, conducteur):
        """Test de marquage comme lu"""
        notification = Notification.objects.create(
            recipient=user,
            sender=conducteur,
            type='MESSAGE_RECEIVED',
            content='Test notification'
        )
        
        notification.mark_as_read()
        
        assert notification.is_read is True
        assert notification.read_at is not None
