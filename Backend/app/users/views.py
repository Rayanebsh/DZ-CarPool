"""
Views pour la gestion des utilisateurs
AVEC VÉRIFICATION DES PRÉFÉRENCES ET REDIRECTION
"""

from django.utils import timezone

import requests
from allauth.socialaccount.models import SocialAccount
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerification, PhoneVerification, Preference, Role, User
from .serializers import (
    ChangePasswordSerializer,
    PreferenceSerializer,
    RoleSerializer,
    UserDocumentSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    VerifyEmailSerializer,
    VerifyPhoneSerializer,
)
from .services import EmailService, SMSService


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des utilisateurs
    """

    queryset = User.objects.all()

    # ---------- AUTHENTICATION ----------
    def get_authenticators(self):
        """
        Désactiver l'authentification JWT pour les endpoints publics
        """
        request = getattr(self, "request", None)

        if request:
            path = request.path.lower()
            method = request.method.upper()

            if (
                (path.endswith("/register/") and method == "POST")
                or (path.endswith("/login/") and method == "POST")
                or (path.endswith("/google_auth/") and method == "POST")
                or (path.endswith("/users/") and method == "POST")
            ):
                return []

        return super().get_authenticators()

    # ---------- PERMISSIONS ----------
    def get_permissions(self):
        """
        Permissions selon l'action
        """
        if self.action in ["register", "login", "create", "google_auth"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    # ---------- SERIALIZERS ----------
    def get_serializer_class(self):
        if self.action in ["register", "create"]:
            return UserRegistrationSerializer
        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        if self.action in ["retrieve", "me"]:
            return UserProfileSerializer
        return UserSerializer

    # ---------- HELPER METHODS ----------
    def _check_user_preferences(self, user):
        """
        Vérifie si l'utilisateur a des préférences
        Retourne True s'il a des préférences, False sinon
        """
        return user.preferences.exists()

    def _get_redirect_url(self, user, is_new_user=False):
        """
        Détermine l'URL de redirection selon le statut de l'utilisateur
        """
        if is_new_user:
            return "/preferences"

        # Si l'utilisateur existe mais n'a pas de préférences
        if not self._check_user_preferences(user):
            return "/preferences"

        # Utilisateur avec préférences
        return "/#hero"

    def _generate_auth_response(self, user, is_new_user=False):
        """
        Génère la réponse d'authentification avec tokens et redirection
        """
        refresh = RefreshToken.for_user(user)
        has_preferences = self._check_user_preferences(user)
        redirect_url = self._get_redirect_url(user, is_new_user)

        return {
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "is_new_user": is_new_user,
            "has_preferences": has_preferences,
            "redirect_url": redirect_url,
        }

    # ---------- ACTIONS PUBLIQUES ----------
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        """
        Inscription d'un nouvel utilisateur
        """
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        response_data = self._generate_auth_response(user, is_new_user=True)

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """
        Connexion utilisateur avec vérification des préférences
        """
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email et mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()

        if not user:
            return Response(
                {"error": "Utilisateur non trouvé"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.check_password(password):
            return Response(
                {"error": "Mot de passe incorrect"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "Compte désactivé"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ✅ Génération de la réponse avec vérification des préférences
        response_data = self._generate_auth_response(user, is_new_user=False)

        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def google_auth(self, request):
        """
        Authentification avec Google OAuth
        """
        access_token = request.data.get("access_token")

        if not access_token:
            return Response(
                {"error": "Access token requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Vérifier le token avec Google
            google_response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if google_response.status_code != 200:
                return Response(
                    {"error": "Token Google invalide"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            google_data = google_response.json()
            uid = google_data.get("sub")
            email = google_data.get("email")
            given_name = google_data.get("given_name", "")
            family_name = google_data.get("family_name", "")

            if not email or not uid:
                return Response(
                    {"error": "Données Google incomplètes"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Vérifier si l'utilisateur existe déjà via Google
            social_account = SocialAccount.objects.filter(
                provider="google", uid=uid
            ).first()

            is_new_user = False

            if social_account:
                # Utilisateur existant via Google
                user = social_account.user
            else:
                # Vérifier si un utilisateur existe avec cet email
                user = User.objects.filter(email=email).first()

                if user:
                    # Lier le compte Google à l'utilisateur existant
                    SocialAccount.objects.create(
                        user=user, provider="google", uid=uid, extra_data=google_data
                    )
                else:
                    # Créer un nouvel utilisateur
                    is_new_user = True
                    user = User.objects.create(
                        email=email,
                        first_name=given_name,
                        last_name=family_name,
                        email_verified=True,
                        email_verified_at=timezone.now(),
                        is_active=True,
                    )

                    # Créer le compte social
                    SocialAccount.objects.create(
                        user=user, provider="google", uid=uid, extra_data=google_data
                    )

            # ✅ Génération de la réponse avec vérification des préférences
            response_data = self._generate_auth_response(user, is_new_user)

            return Response(response_data, status=status.HTTP_200_OK)

        except requests.RequestException as e:
            return Response(
                {"error": f"Erreur lors de la communication avec Google: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ---------- ACTIONS AUTHENTIFIÉES ----------
    @action(detail=False, methods=["get"])
    def me(self, request):
        """
        Récupère les informations de l'utilisateur connecté avec statut des préférences
        """
        user = request.user
        serializer = UserProfileSerializer(user)
        data = serializer.data

        # Ajouter le statut des préférences
        data["has_preferences"] = self._check_user_preferences(user)
        data["preferences_count"] = user.preferences.count()

        return Response(data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def check_preferences(self, request):
        """
        Vérifie si l'utilisateur a configuré ses préférences
        """
        user = request.user
        has_preferences = self._check_user_preferences(user)
        redirect_url = self._get_redirect_url(user)

        return Response(
            {
                "has_preferences": has_preferences,
                "preferences_count": user.preferences.count(),
                "redirect_url": redirect_url,
            }
        )

    @action(detail=False, methods=["put"])
    def update_profile(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)

    # ---------- GESTION DES PRÉFÉRENCES ----------
    @action(detail=False, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def preferences(self, request):
        """
        GET: Récupère TOUTES les préférences disponibles (pour la sélection)
        POST: Met à jour les préférences de l'utilisateur
        """
        user = request.user

        if request.method == "GET":
            # ✅ CORRECTION : Retourner TOUTES les préférences disponibles
            all_preferences = Preference.objects.all().order_by("category", "id")
            return Response(PreferenceSerializer(all_preferences, many=True).data)

        elif request.method == "POST":
            preference_ids = request.data.get("preference_ids", [])

            if not isinstance(preference_ids, list):
                return Response(
                    {"error": "preference_ids doit être une liste"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Vérifier que toutes les préférences existent
            preferences = Preference.objects.filter(id__in=preference_ids)

            if len(preferences) != len(preference_ids):
                return Response(
                    {"error": "Certaines préférences n'existent pas"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mettre à jour les préférences
            user.preferences.set(preferences)

            return Response(
                {
                    "message": "Préférences mises à jour avec succès",
                    "preference_ids": preference_ids,
                    "preferences": PreferenceSerializer(
                        user.preferences.all(), many=True
                    ).data,
                    "has_preferences": True,
                }
            )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_preferences(self, request):
        """
        Récupère uniquement les préférences de l'utilisateur connecté
        """
        user = request.user
        serializer = PreferenceSerializer(user.preferences.all(), many=True)
        return Response(
            {
                "count": user.preferences.count(),
                "preferences": serializer.data,
                "has_preferences": self._check_user_preferences(user),
            }
        )

    # ---------- AUTRES ACTIONS ----------
    @action(detail=False, methods=["post"])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()

        return Response({"message": "Mot de passe changé avec succès"})

    @action(detail=False, methods=["post"])
    def upload_document(self, request):
        serializer = UserDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def documents(self, request):
        documents = request.user.documents.all()
        serializer = UserDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    # ---------- VERIFICATION EMAIL ----------
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def send_email_verification(self, request):
        user = request.user

        if user.email_verified:
            return Response(
                {"message": "Email déjà vérifié"}, status=status.HTTP_400_BAD_REQUEST
            )

        EmailVerification.objects.filter(user=user, is_verified=False).update(
            is_verified=True
        )

        verification = EmailVerification.objects.create(user=user)
        email_sent = EmailService.send_verification_code(user, verification.code)

        if not email_sent:
            return Response(
                {"error": "Erreur lors de l'envoi de l'email"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Code de vérification envoyé par email",
                "expires_at": verification.expires_at,
            }
        )

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def verify_email(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        user = request.user

        try:
            verification = EmailVerification.objects.filter(
                user=user, code=code, is_verified=False
            ).latest("created_at")
        except EmailVerification.DoesNotExist:
            return Response(
                {"error": "Code invalide"}, status=status.HTTP_400_BAD_REQUEST
            )

        verification.attempts += 1
        verification.save()

        if not verification.is_valid():
            if verification.attempts >= 3:
                return Response(
                    {"error": "Trop de tentatives. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if verification.expires_at <= timezone.now():
                return Response(
                    {"error": "Code expiré. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"error": "Code invalide"}, status=status.HTTP_400_BAD_REQUEST
            )

        verification.is_verified = True
        verification.save()

        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.save()

        return Response(
            {"message": "Email vérifié avec succès", "email_verified": True}
        )

    # ---------- VERIFICATION TELEPHONE ----------
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def send_phone_verification(self, request):
        user = request.user

        if user.phone_verified:
            return Response(
                {"message": "Téléphone déjà vérifié"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.phone_number:
            return Response(
                {"error": "Aucun numéro de téléphone enregistré"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        PhoneVerification.objects.filter(user=user, is_verified=False).update(
            is_verified=True
        )

        verification = PhoneVerification.objects.create(user=user)
        sms_sent = SMSService.send_verification_code(user, verification.code)

        if not sms_sent:
            return Response(
                {"error": "Erreur lors de l'envoi du SMS"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "Code de vérification envoyé par SMS",
                "expires_at": verification.expires_at,
            }
        )

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def verify_phone(self, request):
        serializer = VerifyPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        user = request.user

        try:
            verification = PhoneVerification.objects.filter(
                user=user, code=code, is_verified=False
            ).latest("created_at")
        except PhoneVerification.DoesNotExist:
            return Response(
                {"error": "Code invalide"}, status=status.HTTP_400_BAD_REQUEST
            )

        verification.attempts += 1
        verification.save()

        if not verification.is_valid():
            if verification.attempts >= 3:
                return Response(
                    {"error": "Trop de tentatives. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if verification.expires_at <= timezone.now():
                return Response(
                    {"error": "Code expiré. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"error": "Code invalide"}, status=status.HTTP_400_BAD_REQUEST
            )

        verification.is_verified = True
        verification.save()

        user.phone_verified = True
        user.phone_verified_at = timezone.now()
        user.save()

        return Response(
            {"message": "Téléphone vérifié avec succès", "phone_verified": True}
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def verification_status(self, request):
        user = request.user
        return Response(
            {
                "email_verified": user.email_verified,
                "phone_verified": user.phone_verified,
                "email": user.email,
                "phone_number": user.phone_number,
            }
        )


# ---------- AUTRES VIEWSETS ----------
class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PreferenceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les préférences
    """

    queryset = Preference.objects.all().order_by("category", "id")
    serializer_class = PreferenceSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category", None)

        if category:
            queryset = queryset.filter(category=category)

        return queryset
