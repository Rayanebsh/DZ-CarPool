"""
Views pour la gestion des utilisateurs
AVEC GOOGLE OAUTH - VERSION CORRIGÉE
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import get_user_model
from allauth.socialaccount.models import SocialAccount
import requests

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
    VerifyEmailSerializer,
    VerifyPhoneSerializer,
    ResendVerificationSerializer
)
from .models import EmailVerification, PhoneVerification
from .services import EmailService, SMSService

User = get_user_model()


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

            # Ajouter google_auth aux endpoints publics
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

    # ---------- GOOGLE OAUTH - CORRIGÉ ----------
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def google_auth(self, request):
        """
        Authentification avec Google OAuth
        Reçoit le token d'accès Google et crée/connecte l'utilisateur
        
        Expected payload:
        {
            "access_token": "..."
        }
        """
        access_token = request.data.get('access_token')
        
        if not access_token:
            return Response(
                {'error': 'Access token requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Vérifier le token avec Google
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if google_response.status_code != 200:
                return Response(
                    {'error': 'Token Google invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            google_data = google_response.json()
            uid = google_data.get('sub')
            email = google_data.get('email')
            given_name = google_data.get('given_name', '')
            family_name = google_data.get('family_name', '')
            
            if not email or not uid:
                return Response(
                    {'error': 'Données Google incomplètes'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier si l'utilisateur existe déjà via Google
            social_account = SocialAccount.objects.filter(
                provider='google',
                uid=uid
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
                        user=user,
                        provider='google',
                        uid=uid,
                        extra_data=google_data
                    )
                else:
                    # Créer un nouvel utilisateur
                    is_new_user = True
                    
                    # ✅ CORRECTION : Ne pas créer de username
                    user = User.objects.create(
                        email=email,
                        first_name=given_name,
                        last_name=family_name,
                        email_verified=True,  # Email vérifié via Google
                        email_verified_at=timezone.now(),
                        is_active=True
                    )
                    
                    # Créer le compte social
                    SocialAccount.objects.create(
                        user=user,
                        provider='google',
                        uid=uid,
                        extra_data=google_data
                    )
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            
            # Déterminer l'URL de redirection
            redirect_url = '/preferences/' if is_new_user else '/#hero'
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'is_new_user': is_new_user,
                'redirect_url': redirect_url
            }, status=status.HTTP_200_OK)
            
        except requests.RequestException as e:
            return Response(
                {'error': f'Erreur lors de la communication avec Google: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'Erreur serveur: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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

    # ---------- VERIFICATION EMAIL ----------
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_email_verification(self, request):
        """
        Envoie un code de vérification par email
        """
        user = request.user
    
        # Vérifier si l'email est déjà vérifié
        if user.email_verified:
            return Response(
                {"message": "Email déjà vérifié"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        # Invalider les codes précédents
        EmailVerification.objects.filter(
            user=user,
            is_verified=False
        ).update(is_verified=True)
        
        # Créer un nouveau code
        verification = EmailVerification.objects.create(user=user)
        
        # Envoyer l'email
        email_sent = EmailService.send_verification_code(
            user, 
            verification.code
        )
        
        if not email_sent:
            return Response(
                {"error": "Erreur lors de l'envoi de l'email"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "message": "Code de vérification envoyé par email",
            "expires_at": verification.expires_at
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_email(self, request):
        """
        Vérifie le code email
        """
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        user = request.user
        
        # Récupérer le code le plus récent
        try:
            verification = EmailVerification.objects.filter(
                user=user,
                code=code,
                is_verified=False
            ).latest('created_at')
        except EmailVerification.DoesNotExist:
            return Response(
                {"error": "Code invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Incrémenter les tentatives
        verification.attempts += 1
        verification.save()
        
        # Vérifier si le code est valide
        if not verification.is_valid():
            if verification.attempts >= 3:
                return Response(
                    {"error": "Trop de tentatives. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if verification.expires_at <= timezone.now():
                return Response(
                    {"error": "Code expiré. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"error": "Code invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer comme vérifié
        verification.is_verified = True
        verification.save()
        
        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.save()
        
        return Response({
            "message": "Email vérifié avec succès",
            "email_verified": True
        })

    # ---------- VERIFICATION TELEPHONE ----------
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_phone_verification(self, request):
        """
        Envoie un code de vérification par SMS
        """
        user = request.user
        
        # Vérifier si le téléphone est déjà vérifié
        if user.phone_verified:
            return Response(
                {"message": "Téléphone déjà vérifié"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que l'utilisateur a un numéro de téléphone
        if not user.phone_number:
            return Response(
                {"error": "Aucun numéro de téléphone enregistré"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Invalider les codes précédents
        PhoneVerification.objects.filter(
            user=user,
            is_verified=False
        ).update(is_verified=True)
        
        # Créer un nouveau code
        verification = PhoneVerification.objects.create(user=user)
        
        # Envoyer le SMS
        sms_sent = SMSService.send_verification_code(
            user, 
            verification.code
        )
        
        if not sms_sent:
            return Response(
                {"error": "Erreur lors de l'envoi du SMS"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "message": "Code de vérification envoyé par SMS",
            "expires_at": verification.expires_at
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_phone(self, request):
        """
        Vérifie le code téléphone
        """
        serializer = VerifyPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        user = request.user
        
        # Récupérer le code le plus récent
        try:
            verification = PhoneVerification.objects.filter(
                user=user,
                code=code,
                is_verified=False
            ).latest('created_at')
        except PhoneVerification.DoesNotExist:
            return Response(
                {"error": "Code invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Incrémenter les tentatives
        verification.attempts += 1
        verification.save()
        
        # Vérifier si le code est valide
        if not verification.is_valid():
            if verification.attempts >= 3:
                return Response(
                    {"error": "Trop de tentatives. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if verification.expires_at <= timezone.now():
                return Response(
                    {"error": "Code expiré. Demandez un nouveau code"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"error": "Code invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer comme vérifié
        verification.is_verified = True
        verification.save()
        
        user.phone_verified = True
        user.phone_verified_at = timezone.now()
        user.save()
        
        return Response({
            "message": "Téléphone vérifié avec succès",
            "phone_verified": True
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def verification_status(self, request):
        """
        Retourne le statut de vérification de l'utilisateur
        """
        user = request.user
        return Response({
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified,
            "email": user.email,
            "phone_number": user.phone_number
        })


# ---------- AUTRES VIEWSETS ----------
class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PreferenceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer
    permission_classes = [IsAuthenticated]