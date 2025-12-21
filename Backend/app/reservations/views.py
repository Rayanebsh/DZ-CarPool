from django.db.models import Q

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Rating, Reservation
from .permissions import IsReservationOwnerOrDriver
from .serializers import (
    RatingSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
)


class ReservationViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des réservations"""

    queryset = Reservation.objects.select_related(
        "trajet", "passager", "trajet__conducteur"
    ).all()
    permission_classes = [permissions.IsAuthenticated, IsReservationOwnerOrDriver]

    def get_serializer_class(self):
        if self.action == "create":
            return ReservationCreateSerializer
        return ReservationSerializer

    def get_queryset(self):
        """Filtre les réservations selon l'utilisateur"""
        user = self.request.user

        # Admin voit tout
        if user.is_staff:
            return self.queryset

        # Utilisateur voit ses réservations et celles de ses trajets
        return self.queryset.filter(Q(passager=user) | Q(trajet__conducteur=user))

    @action(detail=False, methods=["get"])
    def my_reservations(self, request):
        """Liste les réservations de l'utilisateur en tant que passager"""
        reservations = self.queryset.filter(passager=request.user)

        # Filtrer par statut si fourni
        status_filter = request.query_params.get("status")
        if status_filter:
            reservations = reservations.filter(status=status_filter)

        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending_requests(self, request):
        """Liste les demandes de réservation en attente pour les trajets du conducteur"""
        pending = self.queryset.filter(
            trajet__conducteur=request.user, status="PENDING"
        ).order_by("-created_at")

        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approuve une réservation"""
        reservation = self.get_object()

        # Vérifier que l'utilisateur est le conducteur
        if reservation.trajet.conducteur != request.user:
            return Response(
                {"error": "Seul le conducteur peut approuver une réservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            reservation.approve()
            return Response(
                {
                    "message": "Réservation approuvée avec succès",
                    "reservation": self.get_serializer(reservation).data,
                }
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Rejette une réservation"""
        reservation = self.get_object()

        # Vérifier que l'utilisateur est le conducteur
        if reservation.trajet.conducteur != request.user:
            return Response(
                {"error": "Seul le conducteur peut rejeter une réservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        reason = request.data.get("reason", "")

        try:
            reservation.reject(reason)
            return Response(
                {
                    "message": "Réservation rejetée",
                    "reservation": self.get_serializer(reservation).data,
                }
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Annule une réservation"""
        reservation = self.get_object()

        # Vérifier que l'utilisateur est le passager
        if reservation.passager != request.user:
            return Response(
                {"error": "Seul le passager peut annuler sa réservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        reason = request.data.get("reason", "")

        try:
            reservation.cancel(reason)
            return Response(
                {
                    "message": "Réservation annulée",
                    "reservation": self.get_serializer(reservation).data,
                }
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RatingViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des évaluations"""

    queryset = Rating.objects.select_related("reservation", "rater", "rated").all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les évaluations selon l'utilisateur"""
        user = self.request.user

        # Admin voit tout
        if user.is_staff:
            return self.queryset

        # Utilisateur voit les évaluations où il est impliqué
        return self.queryset.filter(Q(rater=user) | Q(rated=user))

    @action(detail=False, methods=["get"])
    def my_ratings(self, request):
        """Liste les évaluations reçues par l'utilisateur"""
        ratings = self.queryset.filter(rated=request.user)
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def given_ratings(self, request):
        """Liste les évaluations données par l'utilisateur"""
        ratings = self.queryset.filter(rater=request.user)
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)
