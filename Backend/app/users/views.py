"""
Views pour la gestion des utilisateurs
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Role, Preference
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    UserProfileSerializer,
    RoleSerializer,
    PreferenceSerializer,
    UserDocumentSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des utilisateurs
    """
    queryset = User.objects.all()

    # ---------- AUTHENTICATION ----------
    def get_authenticators(self):
        """
        Désactiver l'authentification JWT
        pour les endpoints publics
        """
        request = getattr(self, "request", None)

        if request:
            path = request.path.lower()
            method = request.method.upper()

            if (
                (path.endswith("/register/") and method == "POST")
                or (path.endswith("/login/") and method == "POST")
                or (path.endswith("/users/") and method == "POST")
            ):
                return []

        return super().get_authenticators()

    # ---------- PERMISSIONS ----------
    def get_permissions(self):
        """
        Permissions selon l'action
        """
        if self.action in ["register", "login", "create"]:
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

    # ---------- ACTIONS PUBLIQUES ----------
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        """
        Inscription d'un nouvel utilisateur
        """
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """
        Connexion utilisateur
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

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK,
        )

    # ---------- ACTIONS AUTHENTIFIÉES ----------
    @action(detail=False, methods=["get"])
    def me(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=["put"])
    def update_profile(self, request):
        serializer = UserUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)

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


# ---------- AUTRES VIEWSETS ----------
class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PreferenceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer
    permission_classes = [IsAuthenticated]
