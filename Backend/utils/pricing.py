"""
Utilitaires pour le calcul des prix et de la tarification
"""
from decimal import Decimal
from django.conf import settings
import json
import os


def calculate_fuel_cost(distance, fuel_price_per_liter=None, consumption=None):
    """
    Calcule le coût du carburant pour un trajet
    
    Args:
        distance (float): Distance du trajet en km
        fuel_price_per_liter (float): Prix du carburant par litre
        consumption (float): Consommation en L/100km
    
    Returns:
        Decimal: Coût total du carburant
    """
    if fuel_price_per_liter is None:
        fuel_price_per_liter = 50.0  # Prix par défaut en DA
    
    if consumption is None:
        consumption = settings.FUEL_CONSUMPTION_L_PER_100KM
    
    # Calcul: (distance / 100) * consommation * prix_litre
    fuel_cost = (Decimal(str(distance)) / 100) * Decimal(str(consumption)) * Decimal(str(fuel_price_per_liter))
    
    return fuel_cost.quantize(Decimal('0.01'))


def calculate_suggested_price(distance, ville_depart, nbr_places, fuel_type='ESSENCE'):
    """
    Calcule le prix suggéré par siège basé sur le coût du carburant
    
    Args:
        distance (float): Distance du trajet en km
        ville_depart (str): Wilaya de départ
        nbr_places (int): Nombre de places disponibles
        fuel_type (str): Type de carburant (ESSENCE ou DIESEL)
    
    Returns:
        Decimal: Prix suggéré par siège
    """
    from app.trajets.models import FuelPrice
    
    # Récupérer le prix du carburant pour la wilaya
    try:
        fuel_price = FuelPrice.objects.filter(
            wilaya__iexact=ville_depart,
            fuel_type=fuel_type
        ).order_by('-effective_date').first()
        
        if fuel_price:
            price_per_liter = float(fuel_price.price_per_liter)
        else:
            price_per_liter = 50.0  # Prix par défaut si non trouvé
    except Exception:
        price_per_liter = 50.0
    
    # Calculer le coût total du carburant
    total_fuel_cost = calculate_fuel_cost(distance, price_per_liter)
    
    # Diviser par le nombre de places pour obtenir le prix par siège
    # Ajouter une marge de 20% pour couvrir l'usure et autres frais
    margin = Decimal('1.20')
    price_per_seat = (total_fuel_cost * margin) / Decimal(str(nbr_places))
    
    return price_per_seat.quantize(Decimal('0.01'))


def calculate_platform_commission(price, is_confort=False):
    """
    Calcule la commission de la plateforme
    
    Args:
        price (Decimal): Prix de base du siège
        is_confort (bool): Si c'est un trajet confort
    
    Returns:
        tuple: (prix_final, commission, prix_conducteur)
    """
    commission_rate = Decimal(str(settings.PLATFORM_COMMISSION_RATE))
    
    # Prix final pour le passager
    if is_confort:
        confort_rate = Decimal(str(settings.CONFORT_SUPPLEMENT_RATE))
        final_price = price * (1 + confort_rate)
    else:
        final_price = price
    
    # Calcul de la commission
    commission = final_price * commission_rate
    driver_price = final_price - commission
    
    return (
        final_price.quantize(Decimal('0.01')),
        commission.quantize(Decimal('0.01')),
        driver_price.quantize(Decimal('0.01'))
    )


def load_fuel_prices_from_json(json_path='prix_carburants.json'):
    """
    Charge les prix du carburant depuis un fichier JSON
    
    Format attendu du JSON:
    {
        "Alger": {"essence": 50.5, "diesel": 40.2},
        "Oran": {"essence": 51.0, "diesel": 41.0},
        ...
    }
    
    Args:
        json_path (str): Chemin vers le fichier JSON
    
    Returns:
        dict: Dictionnaire des prix par wilaya
    """
    from app.trajets.models import FuelPrice
    from django.utils import timezone
    
    if not os.path.exists(json_path):
        return {}
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Mettre à jour la base de données
        today = timezone.now().date()
        
        for wilaya, prices in data.items():
            # Essence
            if 'essence' in prices:
                FuelPrice.objects.update_or_create(
                    wilaya=wilaya,
                    fuel_type='ESSENCE',
                    effective_date=today,
                    defaults={'price_per_liter': Decimal(str(prices['essence']))}
                )
            
            # Diesel
            if 'diesel' in prices:
                FuelPrice.objects.update_or_create(
                    wilaya=wilaya,
                    fuel_type='DIESEL',
                    effective_date=today,
                    defaults={'price_per_liter': Decimal(str(prices['diesel']))}
                )
        
        return data
    
    except Exception as e:
        print(f"Erreur lors du chargement des prix: {e}")
        return {}


def validate_reservation_price(reservation_price, trajet_price, tolerance=0.01):
    """
    Valide que le prix de réservation correspond au prix du trajet
    
    Args:
        reservation_price (Decimal): Prix de la réservation
        trajet_price (Decimal): Prix du trajet
        tolerance (float): Tolérance de différence acceptée
    
    Returns:
        bool: True si les prix correspondent
    """
    difference = abs(float(reservation_price) - float(trajet_price))
    return difference <= tolerance


def calculate_total_price_with_confort(base_price, nbr_places, is_confort=False):
    """
    Calcule le prix total avec l'option confort
    
    Args:
        base_price (Decimal): Prix de base par siège
        nbr_places (int): Nombre de places
        is_confort (bool): Si c'est un trajet confort
    
    Returns:
        Decimal: Prix total
    """
    total = base_price * Decimal(str(nbr_places))
    
    if is_confort:
        confort_rate = Decimal(str(settings.CONFORT_SUPPLEMENT_RATE))
        total = total * (1 + confort_rate)
    
    # Ajouter la commission de la plateforme
    commission_rate = Decimal(str(settings.PLATFORM_COMMISSION_RATE))
    total = total * (1 + commission_rate)
    
    return total.quantize(Decimal('0.01'))