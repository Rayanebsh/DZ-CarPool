"""
app/trajets/views.py - ViewSet avec APIs enrichies pour conducteur et passagers
"""

import logging
import traceback
from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from app.core.filters import TrajetFilter
from app.reservations.models import Rating as Avis
from app.reservations.models import Reservation
from app.users.models import Preference, UserDocument
from utils.pricing import get_fuel_prices_summary

from .models import FuelPrice, Trajet
from .permissions import (
    CanCancelTrajet,
    CanModifyTrajet,
    CanViewTrajetReservations,
    IsDriverOrReadOnly,
)
from .serializers import (
    FuelPriceSerializer,
    TrajetCreateSerializer,
    TrajetDetailSerializer,
    TrajetListSerializer,
    TrajetSearchSerializer,
    TrajetUpdateSerializer,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_trip_places(request, trajet_id):
    """Retourne le nombre de places disponibles en temps réel"""
    try:
        trajet = Trajet.objects.get(id=trajet_id)
        return Response(
            {"places_disponibles": trajet.places_disponibles, "trajet_id": trajet.id}
        )
    except Trajet.DoesNotExist:
        return Response({"error": "Trajet not found"}, status=404)


class TrajetViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des trajets avec recherche intelligente"""

    queryset = Trajet.objects.select_related("conducteur").prefetch_related(
        "etapes", "preferences"
    )
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = TrajetFilter
    search_fields = ["ville_depart", "ville_arrivee", "description"]
    ordering_fields = ["date", "heure_depart", "price", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == "list":
            return TrajetListSerializer
        elif self.action == "create":
            return TrajetCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return TrajetUpdateSerializer
        elif self.action == "intelligent_search":
            return TrajetSearchSerializer
        return TrajetDetailSerializer

    def get_permissions(self):
        """✅ Permissions selon l'action"""
        if self.action in [
            "list",
            "retrieve",
            "search",
            "intelligent_search",
            "driver_info",
            "passengers",
            "fuel_prices",
        ]:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_authenticators(self):
        """✅ Désactiver JWT pour les recherches publiques"""
        action = getattr(self, "action", None)
        if action in [
            "list",
            "retrieve",
            "search",
            "intelligent_search",
            "driver_info",
            "passengers",
        ]:
            return []
        return super().get_authenticators()

    def get_queryset(self):
        """Filtre le queryset selon le contexte"""
        queryset = super().get_queryset()
        if self.action == "list":
            queryset = queryset.filter(status="ACTIVE")
        return queryset

    def perform_create(self, serializer):
        """Crée un trajet avec le conducteur authentifié"""
        serializer.save()

    # ========== 🆕 API ENRICHIE - INFOS CONDUCTEUR ==========
    @action(
        detail=True,
        methods=["get"],
        url_path="driver_info",
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="driver_info",
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def driver_info(self, request, pk=None):
        """
        API pour récupérer les informations enrichies du conducteur d'un trajet
        GET /api/v1/trajets/{id}/driver_info/
        """
        try:
            trajet = self.get_object()
            conducteur = trajet.conducteur

            # 1️⃣ Photo de profil
            profile_picture_url = None
            if conducteur.profile_picture:
                try:
                    profile_picture_url = request.build_absolute_uri(
                        conducteur.profile_picture.url
                    )
                except Exception as e:
                    logger.warning(f"Erreur photo profil: {str(e)}")

            # 2️⃣ Nombre de trajets en tant que conducteur
            trips_as_driver = Trajet.objects.filter(
                conducteur=conducteur, status__in=["ACTIVE", "COMPLETED"]
            ).count()

            # 3️⃣ Nombre de trajets en tant que passager
            trips_as_passenger = Reservation.objects.filter(
                passager=conducteur, status="CONFIRMED"
            ).count()

            # 4️⃣ Note moyenne (avis reçus) - FIX: utiliser 'rated' au lieu de 'destinataire'
            average_rating = (
                Avis.objects.filter(rated=conducteur).aggregate(  # ✅ CORRIGÉ ICI
                    Avg("note")
                )["note__avg"]
                or 5.0
            )

            # 5️⃣ Statut de vérification (documents vérifiés)
            is_verified = UserDocument.objects.filter(
                user=conducteur, verified=True
            ).exists()

            # 6️⃣ Date d'inscription
            member_since = None
            date_joined_iso = None
            try:
                if hasattr(conducteur, "date_joined") and conducteur.date_joined:
                    member_since = conducteur.date_joined.strftime("%Y-%m-%d")
                    date_joined_iso = conducteur.date_joined.isoformat()
            except Exception as e:
                logger.warning(f"Erreur date inscription: {str(e)}")

            data = {
                "id": conducteur.id,
                "first_name": conducteur.first_name or "",
                "last_name": conducteur.last_name or "",
                "full_name": f"{conducteur.first_name or ''} {conducteur.last_name or ''}".strip()
                or "Utilisateur",
                "profile_picture": profile_picture_url,
                "date_joined": date_joined_iso,
                "member_since": member_since,
                "trips_as_driver": trips_as_driver,
                "trips_as_passenger": trips_as_passenger,
                "total_trips": trips_as_driver + trips_as_passenger,
                "rating": round(average_rating, 1),
                "is_verified": is_verified,
            }

            logger.info(
                f"[OK] Driver info retrieved for trajet {pk}: {data['full_name']}"
            )
            return Response(data, status=status.HTTP_200_OK)

        except Trajet.DoesNotExist:
            logger.error(f"Trajet {pk} non trouve")
            return Response(
                {"error": "Trajet non trouve"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"[ERROR] driver_info: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {
                    "error": "Erreur lors de la recuperation des informations du conducteur"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ========== 🆕 API ENRICHIE - INFOS PASSAGERS ==========
    @action(
        detail=True,
        methods=["get"],
        url_path="passengers",
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def passengers(self, request, pk=None):
        """
        🎯 API pour récupérer les passagers confirmés d'un trajet avec leurs infos
        GET /api/v1/trajets/{id}/passengers/
        """
        try:
            trajet = self.get_object()

            # Récupérer toutes les réservations confirmées
            reservations = Reservation.objects.filter(
                trajet=trajet, status="CONFIRMED"
            ).select_related("passager")

            passengers_data = []
            for reservation in reservations:
                passager = reservation.passager

                # Photo de profil
                profile_picture_url = None
                if passager.profile_picture:
                    profile_picture_url = request.build_absolute_uri(
                        passager.profile_picture.url
                    )

                passengers_data.append(
                    {
                        "id": passager.id,
                        "first_name": passager.first_name,
                        "last_name": passager.last_name,
                        "full_name": f"{passager.first_name} {passager.last_name}",
                        "profile_picture": profile_picture_url,
                        "nbr_places": reservation.nbr_places,
                        "reservation_id": reservation.id,
                    }
                )

            logger.info(
                f"✅ {len(passengers_data)} passengers retrieved for trajet {pk}"
            )
            return Response(
                {
                    "trajet_id": trajet.id,
                    "passengers_count": len(passengers_data),
                    "passengers": passengers_data,
                },
                status=status.HTTP_200_OK,
            )

        except Trajet.DoesNotExist:
            return Response(
                {"error": "Trajet non trouvé"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"❌ Erreur passengers: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Erreur lors de la récupération des passagers"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ========== RECHERCHE SIMPLE (PUBLIC) ==========
    @action(
        detail=False,
        methods=["post"],
        url_path="search",
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def search(self, request):
        """
        🔍 RECHERCHE SIMPLE - Pour la recherche initiale (page d'accueil)
        POST /api/v1/trajets/search/
        """
        data = request.data

        ville_depart = data.get("ville_depart", "").strip()
        ville_arrivee = data.get("ville_arrivee", "").strip()
        date = data.get("date")
        nbr_places = data.get("nbr_places", 1)

        if not ville_depart or not ville_arrivee:
            return Response(
                {"error": "ville_depart et ville_arrivee sont obligatoires"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Recherche flexible
        depart_parts = [p.strip() for p in ville_depart.split(",") if p.strip()]
        arrivee_parts = [p.strip() for p in ville_arrivee.split(",") if p.strip()]

        depart_q = Q()
        for part in depart_parts:
            depart_q |= Q(ville_depart__icontains=part)

        arrivee_q = Q()
        for part in arrivee_parts:
            arrivee_q |= Q(ville_arrivee__icontains=part)

        queryset = (
            Trajet.objects.filter(status="ACTIVE", places_disponibles__gte=nbr_places)
            .filter(depart_q)
            .filter(arrivee_q)
            .select_related("conducteur")
        )

        if date:
            queryset = queryset.filter(date=date)

        queryset = queryset.order_by("date", "heure_depart", "price")
        serializer = TrajetListSerializer(queryset, many=True)

        logger.info(f"🔍 Recherche simple: {queryset.count()} trajet(s) trouvé(s)")

        return Response(
            {
                "results": serializer.data,
                "count": queryset.count(),
                "search_params": {
                    "depart": ville_depart,
                    "arrivee": ville_arrivee,
                    "date": date,
                    "places": nbr_places,
                },
            },
            status=status.HTTP_200_OK,
        )

    # ========== RECHERCHE INTELLIGENTE (PUBLIC) ==========
    @action(
        detail=False,
        methods=["post"],
        url_path="intelligent_search",
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def intelligent_search(self, request):
        """
        🎯 RECHERCHE INTELLIGENTE - Avec filtres avancés
        POST /api/v1/trajets/intelligent_search/
        """
        try:
            data = request.data
            logger.info(f"🔍 INTELLIGENT SEARCH - Données reçues: {data}")

            ville_depart = data.get("ville_depart", "").strip()
            ville_arrivee = data.get("ville_arrivee", "").strip()

            if not ville_depart or not ville_arrivee:
                return Response(
                    {"error": "ville_depart et ville_arrivee sont obligatoires"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            date = data.get("date")
            nbr_places = data.get("nbr_places", 1)

            # Recherche flexible sur les villes
            depart_parts = [p.strip() for p in ville_depart.split(",") if p.strip()]
            arrivee_parts = [p.strip() for p in ville_arrivee.split(",") if p.strip()]

            depart_q = Q()
            for part in depart_parts:
                depart_q |= Q(ville_depart__icontains=part)

            arrivee_q = Q()
            for part in arrivee_parts:
                arrivee_q |= Q(ville_arrivee__icontains=part)

            # Requête de base
            queryset = (
                Trajet.objects.filter(
                    status="ACTIVE", places_disponibles__gte=nbr_places
                )
                .filter(depart_q)
                .filter(arrivee_q)
                .select_related("conducteur")
                .prefetch_related("preferences")
            )

            # ✅ FILTRES AVANCÉS
            if date:
                queryset = queryset.filter(date=date)

            price_max = data.get("price_max")
            if price_max:
                queryset = queryset.filter(price__lte=price_max)

            departure_time = data.get("departure_time")
            if departure_time:
                if departure_time == "morning":
                    queryset = queryset.filter(heure_depart__lt="12:00")
                elif departure_time == "afternoon":
                    queryset = queryset.filter(
                        heure_depart__gte="12:00", heure_depart__lt="18:00"
                    )
                elif departure_time == "evening":
                    queryset = queryset.filter(heure_depart__gte="18:00")

            is_confort = data.get("is_confort")
            if is_confort:
                queryset = queryset.filter(is_confort=True)

            preference_ids = data.get("preference_ids", [])
            if preference_ids and len(preference_ids) > 0:
                queryset = queryset.filter(
                    preferences__id__in=preference_ids
                ).distinct()

            # Tri
            queryset = queryset.order_by("date", "heure_depart", "price")

            # Sérialisation
            serializer = TrajetListSerializer(queryset, many=True)

            logger.info(f"✅ Résultats finaux: {len(serializer.data)} trajets")

            return Response(
                {
                    "results": serializer.data,
                    "count": queryset.count(),
                    "search_params": {
                        "depart": ville_depart,
                        "arrivee": ville_arrivee,
                        "date": date,
                        "places": nbr_places,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"❌ Erreur intelligent_search: {str(e)}")
            logger.error(traceback.format_exc())

            return Response(
                {
                    "error": "Erreur lors de la recherche",
                    "detail": str(e),
                    "type": "server_error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ========== AUTRES ACTIONS ==========
    @action(detail=False, methods=["get"])
    def my_trips(self, request):
        """Liste les trajets de l'utilisateur connecté"""
        queryset = self.queryset.filter(conducteur=request.user)
        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TrajetListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TrajetListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, CanCancelTrajet],
    )
    def cancel(self, request, pk=None):
        """Annule un trajet"""
        trajet = self.get_object()
        self.check_object_permissions(request, trajet)

        trajet.status = "CANCELLED"
        trajet.save()

        from app.notifications.models import Notification

        for reservation in trajet.reservations.filter(
            status__in=["PENDING", "CONFIRMED"]
        ):
            Notification.objects.create(
                recipient=reservation.passager,
                sender=request.user,
                type="TRAJET_CANCELLED",
                content=f"Le trajet {trajet} a été annulé par le conducteur",
                related_model="Trajet",
                related_id=trajet.id,
            )
            reservation.cancel("Trajet annulé par le conducteur")

        return Response(
            {
                "message": "Trajet annulé avec succès",
                "trajet": TrajetDetailSerializer(trajet).data,
            }
        )

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated, CanViewTrajetReservations],
    )
    def reservations(self, request, pk=None):
        """Liste les réservations d'un trajet"""
        trajet = self.get_object()
        self.check_object_permissions(request, trajet)

        from app.reservations.serializers import ReservationSerializer

        reservations = trajet.reservations.select_related("passager").all()

        if request.user != trajet.conducteur:
            reservations = reservations.filter(passager=request.user)

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Liste les trajets à venir"""
        today = timezone.now().date()
        queryset = self.queryset.filter(
            conducteur=request.user, date__gte=today, status="ACTIVE"
        ).order_by("date", "heure_depart")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TrajetListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TrajetListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def past(self, request):
        """Liste les trajets passés"""
        today = timezone.now().date()
        queryset = self.queryset.filter(
            Q(conducteur=request.user),
            Q(date__lt=today) | Q(status__in=["COMPLETED", "CANCELLED"]),
        ).order_by("-date", "-heure_depart")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TrajetListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TrajetListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        """Statistiques d'un trajet (conducteur uniquement)"""
        trajet = self.get_object()

        if trajet.conducteur != request.user:
            return Response(
                {"error": "Accès non autorisé"}, status=status.HTTP_403_FORBIDDEN
            )

        reservations = trajet.reservations.all()

        stats = {
            "total_reservations": reservations.count(),
            "pending": reservations.filter(status="PENDING").count(),
            "confirmed": reservations.filter(status="CONFIRMED").count(),
            "rejected": reservations.filter(status="REJECTED").count(),
            "cancelled": reservations.filter(status="CANCELLED").count(),
            "places_reserved": sum(
                r.nbr_places for r in reservations.filter(status="CONFIRMED")
            ),
            "places_disponibles": trajet.places_disponibles,
            "revenue_estimate": sum(
                r.total_price for r in reservations.filter(status="CONFIRMED")
            ),
        }

        return Response(stats)

    @action(
        detail=False,
        methods=["get"],
        url_path="fuel_prices",
        permission_classes=[AllowAny],
        authentication_classes=[],  # ✅ AJOUT CRITIQUE: Désactiver l'authentification
    )
    def fuel_prices(self, request):
        """
        🔓 Endpoint PUBLIC pour récupérer les prix du carburant
        GET /api/v1/trajets/fuel_prices/

        Accessible sans authentification
        """
        data = get_fuel_prices_summary()

        if data:
            return Response(data)
        else:
            return Response(
                {
                    "error": "Impossible de charger les prix du carburant",
                    "message": "Le fichier prix_carburants.json est introuvable",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class FuelPriceViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des prix du carburant"""

    queryset = FuelPrice.objects.all()
    serializer_class = FuelPriceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
