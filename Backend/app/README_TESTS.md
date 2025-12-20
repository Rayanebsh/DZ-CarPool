# 🧪 Tests DZ-CarPool

Documentation complète de la suite de tests pour le module d'authentification.

## 📁 Structure des Tests

```
app/users/tests/
├── __init__.py              # Initialisation du package
├── conftest.py             # Fixtures réutilisables
├── test_auth.py            # Tests d'authentification (register, login, google_auth)
├── test_verification.py    # Tests de vérification (email, téléphone)
├── test_profile.py         # Tests de profil (me, update, change_password)
├── test_documents.py       # Tests de documents (upload, list)
└── test_security.py        # Tests de sécurité
```

## 🚀 Exécution des Tests

### Installation des dépendances

```bash
pip install -r requirements.txt
```

### Commandes de base

```bash
# Tous les tests
pytest

# Tests d'un fichier spécifique
pytest app/users/tests/test_auth.py

# Tests avec verbose
pytest -v

# Tests avec couverture
pytest --cov=app --cov-report=html
```

### Script d'exécution rapide

Rendez le script exécutable :
```bash
chmod +x run_tests.sh
```

Utilisez le script :
```bash
# Tous les tests
./run_tests.sh all

# Tests d'authentification uniquement
./run_tests.sh auth

# Tests de vérification
./run_tests.sh verification

# Tests de profil
./run_tests.sh profile

# Tests de documents
./run_tests.sh documents

# Tests de sécurité
./run_tests.sh security

# Avec couverture de code
./run_tests.sh coverage

# Voir toutes les options
./run_tests.sh help
```

## 📊 Couverture de Code

La suite de tests vise une couverture de **90%+** pour garantir la qualité du code.

### Générer un rapport de couverture

```bash
pytest --cov=app --cov-report=html --cov-report=term-missing
```

Le rapport HTML sera disponible dans `htmlcov/index.html`

### Vérifier la couverture minimale

```bash
pytest --cov=app --cov-fail-under=80
```

## 🧩 Fixtures Disponibles

### Fixtures de base
- `api_client` - Client API non authentifié
- `authenticated_client` - Client API authentifié

### Fixtures utilisateurs
- `user` - Utilisateur simple
- `verified_user` - Utilisateur avec email/téléphone vérifiés
- `admin_user` - Utilisateur administrateur
- `inactive_user` - Utilisateur désactivé
- `user_data` - Données valides pour créer un utilisateur

### Fixtures de vérification
- `email_verification` - Code de vérification email valide
- `expired_email_verification` - Code email expiré
- `phone_verification` - Code de vérification téléphone valide
- `expired_phone_verification` - Code téléphone expiré

### Fixtures de documents
- `user_document` - Document utilisateur non vérifié
- `verified_document` - Document vérifié

### Fixtures de mocking
- `mock_email_service` - Mock du service email
- `mock_sms_service` - Mock du service SMS
- `mock_google_oauth` - Mock de l'authentification Google

### Fixtures de rôles
- `role_user` - Rôle utilisateur standard
- `role_driver` - Rôle conducteur
- `role_admin` - Rôle administrateur
- `preferences` - Liste de préférences

## 📝 Types de Tests

### 1. Tests d'Authentification (`test_auth.py`)

**Inscription (Register)**
- ✅ Inscription réussie avec données valides
- ✅ Validation email manquant
- ✅ Validation mot de passe manquant
- ✅ Mots de passe non correspondants
- ✅ Mot de passe faible
- ✅ Email dupliqué
- ✅ Email invalide

**Connexion (Login)**
- ✅ Connexion réussie
- ✅ Mauvais mot de passe
- ✅ Utilisateur inexistant
- ✅ Utilisateur désactivé
- ✅ Champs manquants

**Google OAuth**
- ✅ Authentification Google avec nouvel utilisateur
- ✅ Authentification Google avec utilisateur existant
- ✅ Token manquant
- ✅ Token invalide
- ✅ Données Google incomplètes
- ✅ Erreur réseau

### 2. Tests de Vérification (`test_verification.py`)

**Vérification Email**
- ✅ Envoi code réussi
- ✅ Email déjà vérifié
- ✅ Sans authentification
- ✅ Vérification réussie
- ✅ Code invalide
- ✅ Code expiré
- ✅ Trop de tentatives
- ✅ Code malformé

**Vérification Téléphone**
- ✅ Envoi SMS réussi
- ✅ Téléphone déjà vérifié
- ✅ Pas de numéro enregistré
- ✅ Vérification réussie
- ✅ Code invalide
- ✅ Code expiré

**Statut de Vérification**
- ✅ Statut utilisateur non vérifié
- ✅ Statut utilisateur vérifié
- ✅ Sans authentification

### 3. Tests de Profil (`test_profile.py`)

**Récupération Profil**
- ✅ Récupération réussie
- ✅ Sans authentification
- ✅ Inclusion des statistiques

**Mise à Jour Profil**
- ✅ Mise à jour réussie
- ✅ Mise à jour partielle
- ✅ Avec préférences
- ✅ Numéro de téléphone
- ✅ Données invalides

**Changement Mot de Passe**
- ✅ Changement réussi
- ✅ Mauvais ancien mot de passe
- ✅ Nouveaux mots de passe différents
- ✅ Mot de passe faible
- ✅ Champs manquants

### 4. Tests de Documents (`test_documents.py`)

**Upload Documents**
- ✅ Upload réussi (PDF)
- ✅ Upload permis de conduire
- ✅ Upload image (JPEG)
- ✅ Type manquant
- ✅ Fichier manquant
- ✅ Type invalide
- ✅ Sans authentification

**Liste Documents**
- ✅ Récupération réussie
- ✅ Liste vide
- ✅ Plusieurs documents
- ✅ Statut de vérification inclus
- ✅ Isolation des documents (ne voir que les siens)

### 5. Tests de Sécurité (`test_security.py`)

**Sécurité Authentification**
- ✅ Mot de passe non retourné dans la réponse
- ✅ Mot de passe hashé en DB
- ✅ Protection injection SQL
- ✅ Protection XSS

**Sécurité Tokens**
- ✅ Token requis pour endpoints protégés
- ✅ Token invalide rejeté
- ✅ Token expiré rejeté
- ✅ Isolation des tokens entre utilisateurs

**Sécurité Permissions**
- ✅ Isolation des données utilisateur
- ✅ Documents personnels uniquement

**Validation Entrées**
- ✅ Validation format email
- ✅ Validation numéro de téléphone
- ✅ Validation longueur bio

## 🔧 Configuration CI/CD

Les tests sont automatiquement exécutés dans le pipeline CI/CD via GitHub Actions.

### Workflow GitHub Actions

Le fichier `.github/workflows/ci.yml` exécute :
1. **Lint** - Black, Flake8, isort
2. **Tests** - Avec pytest et couverture
3. **Security** - Safety et Bandit
4. **Build** - Image Docker
5. **Deploy** - Vers production si tests passent

### Variables d'Environnement pour CI

```env
SECRET_KEY=test-secret-key-for-ci
DEBUG=False
DB_NAME=test_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## 🐛 Debugging des Tests

### Voir les logs détaillés

```bash
pytest -vv --tb=long
```

### Exécuter un test spécifique

```bash
pytest app/users/tests/test_auth.py::TestUserRegistration::test_register_success -v
```

### Arrêter au premier échec

```bash
pytest -x
```

### Mode interactif (pdb)

```bash
pytest --pdb
```

### Réexécuter les tests échoués

```bash
pytest --lf
```

## 📈 Métriques de Qualité

- **Couverture cible** : 90%+
- **Tests totaux** : 80+
- **Temps d'exécution** : < 30 secondes
- **Tests de sécurité** : 15+

## 🔍 Bonnes Pratiques

1. **Isolation** - Chaque test est indépendant
2. **Fixtures** - Réutilisation maximale via conftest.py
3. **Mocking** - Services externes mockés (email, SMS, Google)
4. **Lisibilité** - Tests clairs et bien documentés
5. **Performance** - Tests rapides avec `--reuse-db`

## 🆘 Aide et Support

### Problèmes courants

**Tests échouent en local mais passent en CI**
- Vérifier les variables d'environnement
- S'assurer que la DB de test est clean

**Erreur "Address already in use"**
```bash
# Tuer les processus sur le port 8000
lsof -ti:8000 | xargs kill -9
```

**Base de données de test non créée**
```bash
# Recréer la DB de test
pytest --create-db
```

## 📚 Ressources

- [Documentation pytest](https://docs.pytest.org/)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [Django Testing](https://docs.djangoproject.com/en/4.2/topics/testing/)
- [Factory Boy](https://factoryboy.readthedocs.io/)

## 👥 Contribution

Pour ajouter de nouveaux tests :

1. Créer le fichier de test approprié
2. Utiliser les fixtures existantes dans `conftest.py`
3. Suivre les conventions de nommage (`test_*`)
4. Ajouter des marqueurs appropriés (`@pytest.mark.auth`)
5. Vérifier la couverture après ajout

## 📄 License

© 2024 DZ-CarPool - Tous droits réservés