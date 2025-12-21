from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import RatingViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r"", ReservationViewSet, basename="reservation")
router.register(r"ratings", RatingViewSet, basename="rating")

app_name = "reservations"

urlpatterns = [
    path("", include(router.urls)),
]
