"""
Serializers pour la gestion des trajets
"""

from decimal import Decimal

from rest_framework import serializers

from app.users.serializers import UserSerializer
from utils.pricing import calculate_suggested_price

from .models import FuelPrice, Trajet, TrajetEtape


class TrajetEtapeSerializer(serializers.ModelSerializer):
    """Serializer pour les étapes de trajet"""

    class Meta:
        model = TrajetEtape
        fields = ["id", "ville", "adresse", "heure_arrivee", "ordre"]
        read_only_fields = ["id"]


class TrajetListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des trajets (vue simplifiée)"""

    conducteur_name = serializers.CharField(
        source="conducteur.full_name", read_only=True
    )
    conducteur_rating = serializers.DecimalField(
        source="conducteur.average_rating",
        max_digits=3,
        decimal_places=2,
        read_only=True,
    )
    conducteur_picture = serializers.ImageField(
        source="conducteur.profile_picture", read_only=True
    )

    class Meta:
        model = Trajet
        fields = [
            "id",
            "conducteur",
            "conducteur_name",
            "conducteur_rating",
            "conducteur_picture",
            "ville_depart",
            "ville_arrivee",
            "date",
            "heure_depart",
            "nbr_places",
            "places_disponibles",
            "price",
            "distance",
            "is_confort",
            "pause_required",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "conducteur", "created_at", "places_disponibles"]


class TrajetDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un trajet"""

    conducteur = UserSerializer(read_only=True)
    etapes = TrajetEtapeSerializer(many=True, read_only=True)
    total_reservations = serializers.SerializerMethodField()

    class Meta:
        model = Trajet
        fields = [
            "id",
            "conducteur",
            "ville_depart",
            "ville_arrivee",
            "adresse_depart",
            "adresse_arrivee",
            "date",
            "heure_depart",
            "nbr_places",
            "places_disponibles",
            "price",
            "price_platform",
            "price_driver",
            "suggested_price",
            "distance",
            "is_confort",
            "pause_required",
            "status",
            "description",
            "luggage_allowed",
            "etapes",
            "total_reservations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "conducteur",
            "price_platform",
            "price_driver",
            "places_disponibles",
            "pause_required",
            "created_at",
            "updated_at",
        ]

    def get_total_reservations(self, obj):
        """Retourne le nombre total de réservations confirmées"""
        return obj.reservations.filter(status="CONFIRMED").count()


class TrajetCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un trajet"""

    etapes = TrajetEtapeSerializer(many=True, required=False)

    class Meta:
        model = Trajet
        fields = [
            "ville_depart",
            "ville_arrivee",
            "adresse_depart",
            "adresse_arrivee",
            "date",
            "heure_depart",
            "nbr_places",
            "price",
            "distance",
            "is_confort",
            "description",
            "luggage_allowed",
            "etapes",
        ]

    def validate_date(self, value):
        """Valide que la date n'est pas dans le passé"""
        from django.utils import timezone

        if value < timezone.now().date():
            raise serializers.ValidationError("La date ne peut pas être dans le passé.")
        return value

    def validate_nbr_places(self, value):
        """Valide le nombre de places"""
        if value < 1 or value > 8:
            raise serializers.ValidationError(
                "Le nombre de places doit être entre 1 et 8."
            )
        return value

    def validate_distance(self, value):
        """Valide la distance"""
        if value < 1:
            raise serializers.ValidationError(
                "La distance doit être supérieure à 0 km."
            )
        return value

    def create(self, validated_data):
        """Crée un nouveau trajet avec calcul du prix suggéré"""
        etapes_data = validated_data.pop("etapes", [])

        # Récupérer l'utilisateur connecté comme conducteur
        request = self.context.get("request")
        conducteur = request.user

        # Calculer le prix suggéré basé sur le carburant
        suggested_price = calculate_suggested_price(
            distance=validated_data["distance"],
            ville_depart=validated_data["ville_depart"],
            nbr_places=validated_data["nbr_places"],
        )

        # Créer le trajet
        trajet = Trajet.objects.create(
            conducteur=conducteur, suggested_price=suggested_price, **validated_data
        )

        # Créer les étapes si fournies
        for ordre, etape_data in enumerate(etapes_data, start=1):
            TrajetEtape.objects.create(trajet=trajet, ordre=ordre, **etape_data)

        return trajet


class TrajetUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour d'un trajet"""

    class Meta:
        model = Trajet
        fields = [
            "adresse_depart",
            "adresse_arrivee",
            "date",
            "heure_depart",
            "nbr_places",
            "price",
            "is_confort",
            "description",
            "luggage_allowed",
            "status",
        ]

    def validate_status(self, value):
        """Valide le changement de statut"""
        if self.instance and self.instance.status == "COMPLETED":
            raise serializers.ValidationError(
                "Un trajet terminé ne peut pas être modifié."
            )
        return value

    def validate_nbr_places(self, value):
        """Valide que le nouveau nombre de places n'est pas inférieur aux réservations"""
        if self.instance:
            reserved = self.instance.nbr_places - self.instance.places_disponibles
            if value < reserved:
                raise serializers.ValidationError(
                    f"Impossible de réduire à {value} places. "
                    f"{reserved} places sont déjà réservées."
                )
        return value


class TrajetSearchSerializer(serializers.Serializer):
    """Serializer pour la recherche de trajets"""

    ville_depart = serializers.CharField(required=True)
    ville_arrivee = serializers.CharField(required=True)
    date = serializers.DateField(required=True)
    nbr_places = serializers.IntegerField(required=False, default=1, min_value=1)
    price_max = serializers.DecimalField(
        required=False, max_digits=10, decimal_places=2, min_value=Decimal("0.01")
    )
    is_confort = serializers.BooleanField(required=False)


class FuelPriceSerializer(serializers.ModelSerializer):
    """Serializer pour les prix du carburant"""

    class Meta:
        model = FuelPrice
        fields = ["id", "wilaya", "fuel_type", "price_per_liter", "effective_date"]
        read_only_fields = ["id", "effective_date"]
