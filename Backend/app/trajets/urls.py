from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import FuelPriceViewSet, TrajetViewSet

router = DefaultRouter()
router.register(r"", TrajetViewSet, basename="trajet")
router.register(r"fuel-prices", FuelPriceViewSet, basename="fuel-price")

app_name = "trajets"

urlpatterns = [
    path("", include(router.urls)),
]
