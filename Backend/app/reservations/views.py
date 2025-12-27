"""
app/reservations/views.py - ViewSet pour les réservations avec vérification des documents
"""

import logging

from django.db.models import Q

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from app.users.models import UserDocument

from .models import Reservation
from .serializers import ReservationSerializer
logger = logging.getLogger(__name__)


class ReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des réservations avec vérification des documents
    """

    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les réservations de l'utilisateur connecté"""
        user = self.request.user
        return (
            Reservation.objects.filter(Q(passager=user) | Q(trajet__conducteur=user))
            .select_related("trajet", "passager", "trajet__conducteur")
            .order_by("-created_at")
        )

    def create(self, request):
        user = request.user

        # ✅ VÉRIFICATION 1 : L'utilisateur doit avoir un document vérifié
        has_verified_document = UserDocument.objects.filter(
            user=user, verified=True
        ).exists()

        if not has_verified_document:
            logger.warning(
                f"❌ Tentative de réservation par utilisateur non vérifié: {user.email}"
            )
            return Response(
                {
                    "error": "Document non vérifié",
                    "message": (
                        "Vous devez avoir au moins un document vérifié "
                        "(CNI) pour effectuer une réservation."
                    ),
                    "can_book": False,
                    "action_required": "upload_document",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ✅ VÉRIFICATION 2 : Validation des données
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.error(f"❌ Erreur validation données: {str(e)}")
            return Response(
                {
                    "error": "Données invalides",
                    "message": str(e),
                    "details": (
                        serializer.errors if hasattr(serializer, "errors") else {}
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ VÉRIFICATION 3 : Pas de réservation active existante
        trajet_id = request.data.get("trajet")
        existing_reservation = Reservation.objects.filter(
            trajet_id=trajet_id, passager=user, status__in=["PENDING", "CONFIRMED"]
        ).first()

        if existing_reservation:
            logger.warning(f"⚠️ Réservation déjà existante: {existing_reservation.id}")
            return Response(
                {
                    "error": "Réservation déjà existante",
                    "message": f"Vous avez déjà une réservation {existing_reservation.get_status_display().lower()} pour ce trajet.",
                    "existing_reservation_id": existing_reservation.id,
                    "status": existing_reservation.status,
                },
                status=status.HTTP_409_CONFLICT,  # 409 = Conflict
            )

        # ✅ VÉRIFICATION 4 : Places disponibles
        from app.trajets.models import Trajet

        try:
            trajet = Trajet.objects.get(id=trajet_id)
            nbr_places = request.data.get("nbr_places", 1)

            if trajet.places_disponibles < nbr_places:
                return Response(
                    {
                        "error": "Places insuffisantes",
                        "message": f"Seulement {trajet.places_disponibles} place(s) disponible(s).",
                        "available_seats": trajet.places_disponibles,
                        "requested_seats": nbr_places,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Trajet.DoesNotExist:
            return Response(
                {
                    "error": "Trajet introuvable",
                    "message": "Le trajet demandé n'existe pas.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ✅ CRÉATION : Tout est OK, créer la réservation
        try:
            self.perform_create(serializer)
            logger.info(
                f"✅ Réservation créée avec succès pour {user.email} - Trajet {trajet_id}"
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Réservation créée avec succès",
                    "reservation": serializer.data,
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )

        except IntegrityError as e:
            # ❌ Erreur de contrainte DB (par sécurité si vérification ratée)
            logger.error(f"❌ IntegrityError lors de la création: {str(e)}")
            return Response(
                {
                    "error": "Conflit de réservation",
                    "message": "Une réservation existe déjà pour ce trajet. Veuillez actualiser la page.",
                },
                status=status.HTTP_409_CONFLICT,
            )

        except Exception as e:
            # ❌ Erreur inattendue
            logger.error(f"❌ Erreur inattendue lors de la création: {str(e)}")
            return Response(
                {
                    "error": "Erreur serveur",
                    "message": "Une erreur est survenue lors de la création de la réservation.",
                    "details": str(e) if settings.DEBUG else "Contactez le support",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def perform_create(self, serializer):
        """Enregistre la réservation avec le passager authentifié"""
        serializer.save(passager=self.request.user)

    @action(detail=False, methods=["get"], url_path="check-booking-permission")
    def check_booking_permission(self, request):
        """
        ✅ Vérifie si l'utilisateur peut effectuer des réservations
        GET /api/v1/reservations/check-booking-permission/
        """
        user = request.user

        has_verified_document = UserDocument.objects.filter(
            user=user, verified=True
        ).exists()

        pending_documents = UserDocument.objects.filter(
            user=user, verified=False
        ).count()

        total_documents = UserDocument.objects.filter(user=user).count()

        logger.info(
            f"🔍 Check booking permission for {user.email}: can_book={has_verified_document}"
        )

        return Response(
            {
                "can_book": has_verified_document,
                "is_verified": has_verified_document,
                "pending_documents": pending_documents,
                "total_documents": total_documents,
                "message": (
                    "Vous pouvez effectuer des réservations"
                    if has_verified_document
                    else "Vous devez télécharger et faire vérifier votre CNI pour réserver un trajet"
                ),
            }
        )

    @action(detail=False, methods=["get"], url_path="my-bookings")
    def my_bookings(self, request):
        """
        Récupère toutes les réservations de l'utilisateur en tant que passager
        GET /api/v1/reservations/my-bookings/
        """
        bookings = (
            Reservation.objects.filter(passager=request.user)
            .select_related("trajet", "trajet__conducteur")
            .order_by("-created_at")
        )

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="my-trips-bookings")
    def my_trips_bookings(self, request):
        """
        Récupère les réservations pour les trajets du conducteur
        GET /api/v1/reservations/my-trips-bookings/
        """
        bookings = (
            Reservation.objects.filter(trajet__conducteur=request.user)
            .select_related("trajet", "passager")
            .order_by("-created_at")
        )

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """
        Confirme une réservation (conducteur uniquement)
        POST /api/v1/reservations/{id}/confirm/
        """
        reservation = self.get_object()

        # Vérifier que c'est bien le conducteur
        if reservation.trajet.conducteur != request.user:
            return Response(
                {"error": "Seul le conducteur peut confirmer une réservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if reservation.status != "PENDING":
            return Response(
                {"error": "Cette réservation ne peut pas être confirmée"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.status = "CONFIRMED"
        reservation.save()

        logger.info(f"✅ Réservation {pk} confirmée par {request.user.email}")

        return Response(
            {
                "message": "Réservation confirmée avec succès",
                "reservation": self.get_serializer(reservation).data,
            }
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """
        Rejette une réservation (conducteur uniquement)
        POST /api/v1/reservations/{id}/reject/
        """
        reservation = self.get_object()

        # Vérifier que c'est bien le conducteur
        if reservation.trajet.conducteur != request.user:
            return Response(
                {"error": "Seul le conducteur peut rejeter une réservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if reservation.status != "PENDING":
            return Response(
                {"error": "Cette réservation ne peut pas être rejetée"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.status = "REJECTED"
        reservation.save()

        # Libérer les places
        trajet = reservation.trajet
        trajet.places_disponibles += reservation.nbr_places
        trajet.save()

        logger.info(f"❌ Réservation {pk} rejetée par {request.user.email}")

        return Response(
            {
                "message": "Réservation rejetée",
                "reservation": self.get_serializer(reservation).data,
            }
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """
        Annule une réservation (passager uniquement)
        POST /api/v1/reservations/{id}/cancel/
        """
        reservation = self.get_object()

        # Vérifier que c'est bien le passager
        if reservation.passager != request.user:
            return Response(
                {"error": "Seul le passager peut annuler sa réservation"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if reservation.status not in ["PENDING", "CONFIRMED"]:
            return Response(
                {"error": "Cette réservation ne peut pas être annulée"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = reservation.status
        reservation.status = "CANCELLED"
        reservation.save()

        # Libérer les places si la réservation était confirmée
        if old_status == "CONFIRMED":
            trajet = reservation.trajet
            trajet.places_disponibles += reservation.nbr_places
            trajet.save()

        logger.info(f"🚫 Réservation {pk} annulée par {request.user.email}")

        return Response(
            {
                "message": "Réservation annulée avec succès",
                "reservation": self.get_serializer(reservation).data,
            }
        )
