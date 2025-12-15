from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, RatingViewSet

router = DefaultRouter()
router.register(r'', ReservationViewSet, basename='reservation')
router.register(r'ratings', RatingViewSet, basename='rating')

app_name = 'reservations'

urlpatterns = [
    path('', include(router.urls)),
]