from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet, MessageViewSet

router = DefaultRouter()
router.register(r"messages", MessageViewSet, basename="message")
router.register(r"conversations", ConversationViewSet, basename="conversation")

app_name = "messaging"

urlpatterns = [
    path("", include(router.urls)),
]
