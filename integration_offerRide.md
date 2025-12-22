# 🚀 Guide Complet d'Intégration - Système de Carburant

## 📋 Vue d'ensemble

Cette intégration ajoute le support complet pour :
- ✅ Sélection du type de carburant et consommation
- ✅ Calcul automatique du prix suggéré basé sur `prix_carburants.json`
- ✅ Extraction automatique de la wilaya depuis l'adresse
- ✅ Préférences de trajet (non-fumeur, musique, bagages)
- ✅ Intégration complète frontend ↔️ backend

---

## 🗂️ Structure des fichiers

```
projet/
├── prix_carburants.json                    # À la racine du projet
├── backend/
│   ├── app/
│   │   ├── trajets/
│   │   │   ├── models.py                  # ✅ Modifié
│   │   │   ├── serializers.py             # ✅ Modifié
│   │   │   ├── views.py                   # ✅ Modifié
│   │   │   └── migrations/
│   │   │       └── 0002_add_fuel_fields.py # ⭐ NOUVEAU
│   │   └── utils/
│   │       └── pricing.py                  # ⭐ NOUVEAU
│   └── prix_carburants.json               # Copie optionnelle
└── frontend/
    └── src/
        └── pages/
            └── OfferRidePage.tsx           # ✅ Modifié
```

---

## 🔧 ÉTAPE 1 : Backend - Modifications de la base de données

### 1.1 Créer la migration

```bash
cd backend
python manage.py makemigrations trajets --name add_fuel_and_preferences_fields
```

### 1.2 Fichier de migration généré

Créer manuellement si nécessaire : `app/trajets/migrations/0002_add_fuel_and_preferences_fields.py`

```python
from django.db import migrations, models
import django.core.validators
from decimal import Decimal


class Migration(migrations.Migration):

    dependencies = [
        ('trajets', '0001_initial'),
    ]

    operations = [
        # Ajouter les champs de carburant
        migrations.AddField(
            model_name='trajet',
            name='fuel_type',
            field=models.CharField(
                choices=[
                    ('essence_sans_plomb', 'Essence Sans Plomb'),
                    ('gasoil', 'Gasoil'),
                    ('gpl', 'GPL'),
                    ('electrique', 'Électrique')
                ],
                default='gasoil',
                help_text='Type de carburant utilisé par le véhicule',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='trajet',
            name='fuel_consumption',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('8.00'),
                help_text='Consommation du véhicule (L/100km ou kWh/100km pour électrique) - défaut 8L/100km',
                max_digits=4,
                validators=[django.core.validators.MinValueValidator(Decimal('0.01'))]
            ),
        ),
        migrations.AddField(
            model_name='trajet',
            name='wilaya_depart',
            field=models.CharField(
                blank=True,
                help_text='Wilaya de départ extraite automatiquement de l\'adresse',
                max_length=100
            ),
        ),
        
        # Ajouter les préférences de trajet
        migrations.AddField(
            model_name='trajet',
            name='no_smoking',
            field=models.BooleanField(
                default=True,
                help_text='Véhicule non-fumeur'
            ),
        ),
        migrations.AddField(
            model_name='trajet',
            name='music_allowed',
            field=models.BooleanField(
                default=True,
                help_text='Musique autorisée pendant le trajet'
            ),
        ),
        migrations.AddField(
            model_name='trajet',
            name='small_luggage_only',
            field=models.BooleanField(
                default=False,
                help_text='Uniquement petits bagages acceptés'
            ),
        ),
        
        # Ajouter les index pour optimisation
        migrations.AddIndex(
            model_name='trajet',
            index=models.Index(fields=['fuel_type'], name='trajets_fuel_type_idx'),
        ),
        migrations.AddIndex(
            model_name='trajet',
            index=models.Index(fields=['wilaya_depart'], name='trajets_wilaya_idx'),
        ),
    ]
```

### 1.3 Appliquer la migration

```bash
python manage.py migrate trajets
```

---

## 📦 ÉTAPE 2 : Backend - Créer l'utilitaire de pricing

Créer `backend/utils/pricing.py` (voir l'artifact `pricing_utils`)

**Points clés :**
- ✅ Lecture du fichier `prix_carburants.json`
- ✅ Extraction automatique de la wilaya depuis l'adresse
- ✅ Calcul du prix suggéré selon le cahier des charges
- ✅ Formule : `(distance × consommation × prix_carburant / 100) × 1.5 / nbr_places`

---

## 🔄 ÉTAPE 3 : Backend - Mettre à jour les serializers

Remplacer le contenu de `app/trajets/serializers.py` par l'artifact `trajet_serializers`

**Nouveaux champs ajoutés :**
```python
'fuel_type',           # Type de carburant
'fuel_consumption',    # Consommation L/100km
'wilaya_depart',       # Wilaya extraite automatiquement
'no_smoking',          # Non-fumeur
'music_allowed',       # Musique autorisée
'small_luggage_only',  # Petits bagages uniquement
```

---

## 🌐 ÉTAPE 4 : Backend - Ajouter l'endpoint fuel_prices

Dans `app/trajets/views.py`, ajouter l'action (voir artifact `trajet_views`) :

```python
@action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
def fuel_prices(self, request):
    """
    Endpoint pour récupérer les prix du carburant
    GET /api/v1/trajets/fuel_prices/
    """
    data = get_fuel_prices_summary()
    if data:
        return Response(data)
    else:
        return Response(
            {"error": "Impossible de charger les prix du carburant"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

---

## 🎨 ÉTAPE 5 : Frontend - Composant React complet

Remplacer votre composant `OfferRidePage.tsx` par l'artifact `offer-ride-complete`

**Fonctionnalités principales :**
1. ✅ Chargement automatique des prix du carburant depuis l'API
2. ✅ Sélection du type de carburant (gasoil, essence, GPL, électrique)
3. ✅ Saisie de la consommation personnalisée
4. ✅ Calcul automatique du prix suggéré en temps réel
5. ✅ Affichage de la wilaya détectée
6. ✅ Gestion des préférences de trajet
7. ✅ Soumission au backend avec authentification JWT

---

## 🧪 ÉTAPE 6 : Tests et Validation

### 6.1 Tester l'endpoint fuel_prices

```bash
curl http://localhost:8000/api/v1/trajets/fuel_prices/
```

**Réponse attendue :**
```json
{
  "last_updated": "2024-12-21",
  "wilayas": {
    "16": {
      "name": "Alger",
      "prices": {
        "essence_sans_plomb": 51.58,
        "gasoil": 36.13,
        "gpl": 10.50
      }
    },
    ...
  },
  "consommation_moyenne": {
    "essence_sans_plomb": 7.5,
    "gasoil": 6.5,
    "gpl": 8.5,
    "electrique": 0.18
  }
}
```

### 6.2 Tester la création d'un trajet

```bash
curl -X POST http://localhost:8000/api/v1/trajets/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ville_depart": "Alger",
    "ville_arrivee": "Oran",
    "date": "2024-12-25",
    "heure_depart": "08:00",
    "nbr_places": 3,
    "price": 1500,
    "distance": 420,
    "fuel_type": "gasoil",
    "fuel_consumption": 6.5,
    "no_smoking": true,
    "music_allowed": true,
    "small_luggage_only": false
  }'
```

**Vérifications :**
- ✅ `wilaya_depart` est automatiquement défini à "Alger"
- ✅ `suggested_price` est calculé automatiquement
- ✅ Les préférences sont enregistrées

---

## 📊 ÉTAPE 7 : Synchronisation des prix du carburant

### Option 1 : Commande de synchronisation manuelle

Créer `app/trajets/management/commands/sync_fuel_prices.py` :

```python
import json
from django.core.management.base import BaseCommand
from app.trajets.models import FuelPrice
from pathlib import Path

class Command(BaseCommand):
    help = 'Synchronise les prix du carburant depuis prix_carburants.json'

    def handle(self, *args, **options):
        json_path = Path(__file__).resolve().parent.parent.parent.parent.parent / 'prix_carburants.json'
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for code, info in data['wilayas'].items():
            wilaya_name = info['name']
            for fuel_type, price in info['prices'].items():
                FuelPrice.objects.update_or_create(
                    wilaya_code=code,
                    wilaya_name=wilaya_name,
                    fuel_type=fuel_type,
                    defaults={'price_per_liter': price}
                )
        
        self.stdout.write(self.style.SUCCESS('✅ Prix du carburant synchronisés'))
```

**Utilisation :**
```bash
python manage.py sync_fuel_prices
```

### Option 2 : Tâche planifiée hebdomadaire (Celery)

```python
# tasks.py
from celery import shared_task
from django.core.management import call_command

@shared_task
def sync_fuel_prices_weekly():
    call_command('sync_fuel_prices')
```

**Configuration Celery Beat :**
```python
# settings.py
CELERY_BEAT_SCHEDULE = {
    'sync-fuel-prices': {
        'task': 'app.trajets.tasks.sync_fuel_prices_weekly',
        'schedule': crontab(day_of_week=1, hour=2, minute=0),  # Tous les lundis à 2h
    },
}
```

---

## 🔍 ÉTAPE 8 : Validation des calculs

### Exemple de calcul manuel

**Trajet : Alger → Oran**
- Distance : 420 km
- Carburant : Gasoil
- Prix gasoil Alger : 36.13 DZD/L
- Consommation : 6.5 L/100km
- Nombre de places : 3

**Calcul :**
```
1. Coût carburant = (420 × 6.5 × 36.13) / 100 = 986.75 DZD
2. Coût total (avec usure 50%) = 986.75 × 1.5 = 1480.12 DZD
3. Prix par siège = 1480.12 / 3 = 493.37 DZD
4. Arrondi à 10 DA = 490 DZD
```

**Résultat attendu : 490 DZD par siège**

---

## 🐛 ÉTAPE 9 : Dépannage

### Problème 1 : Fichier JSON introuvable

**Symptôme :** Erreur 500 sur `/api/v1/trajets/fuel_prices/`

**Solution :**
```bash
# Vérifier le chemin
ls -la prix_carburants.json

# Vérifier les permissions
chmod 644 prix_carburants.json
```

### Problème 2 : Wilaya non détectée

**Symptôme :** `wilaya_depart` reste vide

**Solution :** Ajouter la ville dans le mapping de `utils/pricing.py`

```python
wilaya_mapping = {
    # ... existant
    'votre_ville': 'Nom_Wilaya',
}
```

### Problème 3 : Prix suggéré à 0

**Vérifications :**
1. Distance est définie
2. Ville de départ est valide
3. Type de carburant existe dans le JSON
4. Fichier JSON est chargé correctement

---

## 📈 ÉTAPE 10 : Améliorations futures

### 1. Géocodage automatique précis
```javascript
// Utiliser Nominatim OSM pour extraction précise
const geocodeAddress = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${address},Algeria`
  );
  const data = await response.json();
  return data[0]; // Contient display_name avec wilaya
};
```

### 2. Historique des prix du carburant
```python
# Garder l'historique des variations de prix
class FuelPriceHistory(models.Model):
    fuel_price = models.ForeignKey(FuelPrice, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)
```

### 3. Notifications de changement de prix
```python
@receiver(post_save, sender=FuelPrice)
def notify_price_change(sender, instance, created, **kwargs):
    if not created:
        # Notifier les conducteurs de la wilaya
        pass
```

---

## ✅ Checklist Finale

- [ ] Migration appliquée
- [ ] Fichier `prix_carburants.json` à la racine
- [ ] Utilitaire `utils/pricing.py` créé
- [ ] Serializers mis à jour
- [ ] Views mis à jour avec endpoint `fuel_prices`
- [ ] Composant React intégré
- [ ] Tests manuels effectués
- [ ] Prix suggéré s'affiche correctement
- [ ] Wilaya détectée automatiquement
- [ ] Préférences de trajet enregistrées

---

## 🎯 Résultat Final

Après cette intégration, votre application :

1. ✅ **Calcule automatiquement** le prix suggéré basé sur les prix réels du carburant
2. ✅ **Extrait la wilaya** depuis l'adresse de départ
3. ✅ **Prend en compte** le type de carburant et la consommation
4. ✅ **Affiche en temps réel** le prix conseillé pendant la saisie
5. ✅ **Enregistre toutes les données** dans la base de données
6. ✅ **Conforme au cahier des charges** : estimation du coût carburant par trajet

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs Django : `python manage.py runserver --verbosity 2`
2. Vérifier les erreurs console navigateur (F12)
3. Tester les endpoints avec cURL ou Postman
4. Vérifier que le token JWT est valide

Bon développement ! 🚀