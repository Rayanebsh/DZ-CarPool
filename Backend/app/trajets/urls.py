from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrajetViewSet, FuelPriceViewSet

router = DefaultRouter()
router.register(r'', TrajetViewSet, basename='trajet')
router.register(r'fuel-prices', FuelPriceViewSet, basename='fuel-price')

app_name = 'trajets'

urlpatterns = [
    path('', include(router.urls)),
]