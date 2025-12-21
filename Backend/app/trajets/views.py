from django.db.models import Q
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from app.core.filters import TrajetFilter

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


class TrajetViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des trajets avec permissions complètes"""

    queryset = Trajet.objects.select_related("conducteur").prefetch_related("etapes")
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
        elif self.action == "search":
            return TrajetSearchSerializer
        return TrajetDetailSerializer

    def get_permissions(self):
        """Permissions dynamiques selon l'action"""
        if self.action == "create":
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ["update", "partial_update"]:
            permission_classes = [
                permissions.IsAuthenticated,
                IsDriverOrReadOnly,
                CanModifyTrajet,
            ]
        elif self.action == "destroy":
            permission_classes = [permissions.IsAuthenticated, IsDriverOrReadOnly]
        elif self.action == "cancel":
            permission_classes = [permissions.IsAuthenticated, CanCancelTrajet]
        elif self.action == "reservations":
            permission_classes = [
                permissions.IsAuthenticated,
                CanViewTrajetReservations,
            ]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filtre le queryset selon le contexte"""
        queryset = super().get_queryset()

        # Filtrer par statut actif par défaut pour la liste
        if self.action == "list":
            queryset = queryset.filter(status="ACTIVE")

        return queryset

    def perform_create(self, serializer):
        """Crée un trajet avec le conducteur authentifié"""
        serializer.save(conducteur=self.request.user)

    @action(detail=False, methods=["post"])
    def search(self, request):
        """Recherche avancée de trajets"""
        serializer = TrajetSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Requête de base
        queryset = Trajet.objects.filter(
            ville_depart__icontains=data["ville_depart"],
            ville_arrivee__icontains=data["ville_arrivee"],
            date=data["date"],
            status="ACTIVE",
            places_disponibles__gte=data.get("nbr_places", 1),
        )

        # Filtres optionnels
        if "price_max" in data:
            queryset = queryset.filter(price__lte=data["price_max"])

        if "is_confort" in data:
            queryset = queryset.filter(is_confort=data["is_confort"])

        # Exclure les trajets de l'utilisateur connecté
        if request.user.is_authenticated:
            queryset = queryset.exclude(conducteur=request.user)

        # Sérialiser et retourner
        results = TrajetListSerializer(queryset, many=True)
        return Response({"count": queryset.count(), "results": results.data})

    @action(detail=False, methods=["get"])
    def my_trips(self, request):
        """Liste les trajets de l'utilisateur connecté"""
        queryset = self.queryset.filter(conducteur=request.user)

        # Filtrer par statut si fourni
        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Pagination
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

        # Vérifier les permissions (géré par CanCancelTrajet)
        self.check_object_permissions(request, trajet)

        trajet.status = "CANCELLED"
        trajet.save()

        # Notifier tous les passagers
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
            # Annuler la réservation
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

        # Vérifier les permissions
        self.check_object_permissions(request, trajet)

        from app.reservations.serializers import ReservationSerializer

        reservations = trajet.reservations.select_related("passager").all()

        # Si c'est un passager, ne montrer que sa réservation
        if request.user != trajet.conducteur:
            reservations = reservations.filter(passager=request.user)

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Liste les trajets à venir de l'utilisateur"""
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
        """Liste les trajets passés de l'utilisateur"""
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

        # Vérifier que c'est le conducteur
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


class FuelPriceViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des prix du carburant"""

    queryset = FuelPrice.objects.all()
    serializer_class = FuelPriceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
