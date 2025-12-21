"""
app/users/urls.py - URLs pour les utilisateurs MISES À JOUR
"""

from django.urls import include, path

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import PreferenceViewSet, RoleViewSet, UserViewSet

router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"preferences", PreferenceViewSet, basename="preference")

app_name = "users"

urlpatterns = [
    # JWT Token refresh
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Router URLs (inclut toutes les actions du ViewSet)
    path("", include(router.urls)),
]

# Les URLs générées automatiquement par le router :
# ========== AUTHENTIFICATION ==========
# POST   /api/v1/users/register/
# POST   /api/v1/users/login/
# POST   /api/v1/users/google_auth/
# GET    /api/v1/users/me/

# ========== PRÉFÉRENCES (NOUVELLES) ==========
# GET    /api/v1/users/preferences/           # Liste toutes les préférences disponibles
# POST   /api/v1/users/preferences/           # Mettre à jour les préférences de l'utilisateur
# GET    /api/v1/users/my_preferences/        # Récupérer les préférences de l'utilisateur connecté

# ========== VÉRIFICATIONS ==========
# POST   /api/v1/users/send_email_verification/
# POST   /api/v1/users/verify_email/
# POST   /api/v1/users/send_phone_verification/
# POST   /api/v1/users/verify_phone/
# GET    /api/v1/users/verification_status/

# ========== DOCUMENTS ==========
# POST   /api/v1/users/upload_document/
# GET    /api/v1/users/documents/

# ========== AUTRES ==========
# GET    /api/v1/users/roles/
