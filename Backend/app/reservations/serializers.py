from rest_framework import serializers
from .models import Reservation, Rating
from app.users.serializers import UserSerializer
from app.trajets.serializers import TrajetListSerializer


class ReservationSerializer(serializers.ModelSerializer):
    """Serializer pour les réservations"""

    passager_detail = UserSerializer(source="passager", read_only=True)
    trajet_detail = TrajetListSerializer(source="trajet", read_only=True)
    can_rate = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "trajet",
            "trajet_detail",
            "passager",
            "passager_detail",
            "nbr_places",
            "status",
            "price_per_seat",
            "total_price",
            "created_at",
            "approved_at",
            "cancelled_at",
            "rejection_reason",
            "cancellation_reason",
            "can_rate",
        ]
        read_only_fields = [
            "id",
            "passager",
            "created_at",
            "approved_at",
            "cancelled_at",
            "price_per_seat",
            "total_price",
        ]

    def get_can_rate(self, obj):
        """Vérifie si l'utilisateur peut noter cette réservation"""
        request = self.context.get("request")
        if not request or not request.user:
            return False

        # Peut noter si réservation confirmée et terminée
        from django.utils import timezone

        is_completed = (
            obj.status == "CONFIRMED" and obj.trajet.date < timezone.now().date()
        )

        # Vérifier si une note existe déjà
        has_rated = Rating.objects.filter(reservation=obj, rater=request.user).exists()

        return is_completed and not has_rated


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'une réservation"""

    class Meta:
        model = Reservation
        fields = ["trajet", "nbr_places"]

    def validate(self, attrs):
        """Valide la réservation"""
        trajet = attrs["trajet"]
        nbr_places = attrs["nbr_places"]
        request = self.context.get("request")

        # Vérifier que l'utilisateur n'est pas le conducteur
        if trajet.conducteur == request.user:
            raise serializers.ValidationError(
                "Vous ne pouvez pas réserver votre propre trajet"
            )

        # Vérifier la disponibilité
        if not trajet.can_reserve(nbr_places):
            raise serializers.ValidationError(
                f"Seulement {trajet.places_disponibles} places disponibles"
            )

        # Vérifier qu'il n'y a pas déjà une réservation active
        existing = Reservation.objects.filter(
            trajet=trajet, passager=request.user, status__in=["PENDING", "CONFIRMED"]
        ).exists()

        if existing:
            raise serializers.ValidationError(
                "Vous avez déjà une réservation active pour ce trajet"
            )

        return attrs

    def create(self, validated_data):
        """Crée une nouvelle réservation"""
        request = self.context.get("request")

        reservation = Reservation.objects.create(
            passager=request.user, **validated_data
        )

        # Créer une notification pour le conducteur
        from app.notifications.models import Notification

        Notification.objects.create(
            recipient=reservation.trajet.conducteur,
            sender=request.user,
            type="RESERVATION_REQUEST",
            content=(
                f"{request.user.full_name} demande à réserver "
                f"{validated_data['nbr_places']} place(s)"
            ),
            related_model="Reservation",
            related_id=reservation.id,
        )

        return reservation


class RatingSerializer(serializers.ModelSerializer):
    """Serializer pour les évaluations"""

    rater_detail = UserSerializer(source="rater", read_only=True)
    rated_detail = UserSerializer(source="rated", read_only=True)
    reservation_detail = ReservationSerializer(source="reservation", read_only=True)

    class Meta:
        model = Rating
        fields = [
            "id",
            "reservation",
            "reservation_detail",
            "rater",
            "rater_detail",
            "rated",
            "rated_detail",
            "note",
            "comment",
            "ponctualite",
            "convivialite",
            "conduite",
            "created_at",
        ]
        read_only_fields = ["id", "rater", "rated", "created_at"]

    def validate(self, attrs):
        """Valide l'évaluation"""
        reservation = attrs["reservation"]
        request = self.context.get("request")

        # Vérifier que la réservation est confirmée
        if reservation.status != "CONFIRMED":
            raise serializers.ValidationError(
                "Vous pouvez seulement noter une réservation confirmée"
            )

        # Vérifier que le trajet est terminé
        from django.utils import timezone

        if reservation.trajet.date >= timezone.now().date():
            raise serializers.ValidationError(
                "Vous pouvez noter seulement après le trajet"
            )

        # Vérifier que l'utilisateur fait partie de la réservation
        if request.user not in [reservation.passager, reservation.trajet.conducteur]:
            raise serializers.ValidationError(
                "Vous ne pouvez noter que vos propres trajets"
            )

        # Vérifier qu'il n'a pas déjà noté
        if Rating.objects.filter(reservation=reservation, rater=request.user).exists():
            raise serializers.ValidationError("Vous avez déjà noté cette réservation")

        return attrs

    def create(self, validated_data):
        """Crée une nouvelle évaluation"""
        request = self.context.get("request")
        reservation = validated_data["reservation"]

        # Déterminer qui est noté
        if request.user == reservation.passager:
            rated = reservation.trajet.conducteur
        else:
            rated = reservation.passager

        rating = Rating.objects.create(
            rater=request.user, rated=rated, **validated_data
        )

        # Créer une notification
        from app.notifications.models import Notification

        Notification.objects.create(
            recipient=rated,
            sender=request.user,
            type="RATING_RECEIVED",
            content=f"{request.user.full_name} vous a noté {rating.note}/5",
            related_model="Rating",
            related_id=rating.id,
        )

        return rating
