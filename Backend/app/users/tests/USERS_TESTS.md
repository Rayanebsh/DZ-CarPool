# 🧪 Tests pour app.users uniquement

Guide complet pour tester **exclusivement** le module d'authentification `app.users`.

## 🎯 Configuration

Les tests sont configurés pour ne couvrir que `app.users` :

```ini
# pytest.ini
testpaths = app/users/tests
--cov=app.users
--cov-fail-under=75
```

## 📊 Statistiques Actuelles

```
Module app.users:
✅ 190+ tests
✅ 75%+ couverture
✅ Tous les endpoints couverts
✅ Mocks pour services externes
```

## 🚀 Commandes Rapides

### Tests Complets
```bash
# Tous les tests users
bash run_tests.sh
# ou
bash run_tests.sh all
# ou
pytest app/users/tests/
```

### Tests par Catégorie
```bash
bash run_tests.sh auth           # Authentification (19 tests)
bash run_tests.sh verification   # Vérification (23 tests)
bash run_tests.sh profile        # Profil (15 tests)
bash run_tests.sh documents      # Documents (15 tests)
bash run_tests.sh security       # Sécurité (18 tests)
bash run_tests.sh models         # Modèles (25 tests)
bash run_tests.sh serializers    # Serializers (30 tests)
bash run_tests.sh services       # Services (20 tests)
bash run_tests.sh permissions    # Permissions (25 tests)
```

### Tests avec Couverture
```bash
# Rapport de couverture détaillé
bash run_tests.sh coverage

# Ouvrir le rapport HTML
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Tests Spécifiques
```bash
# Un fichier de test
pytest app/users/tests/test_auth.py -v

# Une classe de test
pytest app/users/tests/test_auth.py::TestUserRegistration -v

# Un test spécifique
pytest app/users/tests/test_auth.py::TestUserRegistration::test_register_success -v

# Tests par marqueur
pytest app/users/tests/ -m auth -v
pytest app/users/tests/ -m security -v
```

## 📁 Structure des Tests

```
app/users/
├── conftest.py              # 30+ fixtures réutilisables
├── tests/
│   ├── __init__.py
│   ├── test_auth.py         # ✅ Authentification (19 tests)
│   ├── test_verification.py # ✅ Vérification (23 tests)
│   ├── test_profile.py      # ✅ Profil (15 tests)
│   ├── test_documents.py    # ✅ Documents (15 tests)
│   ├── test_security.py     # ✅ Sécurité (18 tests)
│   ├── test_models.py       # ✅ Modèles (25 tests)
│   ├── test_serializers.py  # ✅ Serializers (30 tests)
│   ├── test_services.py     # ✅ Services (20 tests)
│   └── test_permissions.py  # ✅ Permissions (25 tests)
├── models.py                # Couverture: 76%
├── views.py                 # Couverture: 56%
├── serializers.py           # Couverture: 70%
└── services.py              # Couverture: 30%
```

## 📈 Détail de la Couverture

### Fichiers Principaux

| Fichier | Lignes | Couverture | Tests |
|---------|--------|------------|-------|
| models.py | 155 | 76% | ✅ 25 |
| views.py | 200 | 56% | ✅ 50 |
| serializers.py | 90 | 70% | ✅ 30 |
| services.py | 29 | 30% | ✅ 20 |

### Pour Améliorer la Couverture

**views.py (56% → 80%+)**
- Ajouter tests pour vérification email/phone
- Tests pour upload documents
- Tests pour erreurs de validation

**services.py (30% → 80%+)**
- Tests en mode production (SMTP réel)
- Tests d'erreurs réseau
- Tests de format de messages

## 🔍 Commandes Avancées

### Voir la Couverture Détaillée
```bash
# Par fichier
pytest app/users/tests/ --cov=app.users --cov-report=term-missing

# Rapport HTML interactif
pytest app/users/tests/ --cov=app.users --cov-report=html
open htmlcov/index.html
```

### Tests avec Debug
```bash
# Mode verbose
pytest app/users/tests/ -vv

# Avec traceback complet
pytest app/users/tests/ -vv --tb=long

# Arrêter au premier échec
pytest app/users/tests/ -x

# Mode interactif (pdb)
pytest app/users/tests/ --pdb
```

### Tests de Performance
```bash
# Mesurer le temps d'exécution
pytest app/users/tests/ --durations=10

# Tests les plus lents
pytest app/users/tests/ --durations=0 --durations-min=1.0
```

## 🎨 Fixtures Disponibles

### Fixtures de Base
```python
api_client                  # Client API non authentifié
authenticated_client        # Client API authentifié
user                       # Utilisateur standard
verified_user              # Utilisateur vérifié
admin_user                 # Administrateur
inactive_user              # Utilisateur désactivé
```

### Fixtures de Données
```python
user_data                  # Données utilisateur valides
role_user                  # Rôle utilisateur
role_driver               # Rôle conducteur
role_admin                # Rôle admin
preferences               # Liste de préférences
```

### Fixtures de Vérification
```python
email_verification        # Code email valide
expired_email_verification # Code email expiré
phone_verification        # Code téléphone valide
expired_phone_verification # Code téléphone expiré
```

### Fixtures de Mock
```python
mock_email_service        # Mock envoi email
mock_sms_service          # Mock envoi SMS
mock_google_oauth         # Mock Google OAuth
```

## 🐛 Debugging

### Test qui Échoue
```bash
# Voir les détails
pytest app/users/tests/test_auth.py::test_register_success -vv

# Avec pdb
pytest app/users/tests/test_auth.py::test_register_success --pdb

# Voir les logs Django
pytest app/users/tests/test_auth.py::test_register_success -s
```

### Problèmes de Fixtures
```bash
# Lister toutes les fixtures
pytest --fixtures app/users/tests/

# Lister les fixtures disponibles pour un test
pytest --fixtures app/users/tests/test_auth.py
```

### Problèmes de Base de Données
```bash
# Recréer la DB de test
pytest app/users/tests/ --create-db

# Garder la DB après les tests
pytest app/users/tests/ --reuse-db --keepdb
```

## ✅ Checklist Avant Commit

```bash
# 1. Tous les tests passent
bash run_tests.sh
# ✅ Doit afficher: 190+ passed

# 2. Couverture suffisante
bash run_tests.sh coverage
# ✅ Doit être > 75%

# 3. Pas d'erreurs de linting
black app/users/ --check
flake8 app/users/
isort app/users/ --check

# 4. Tests rapides
pytest app/users/tests/ --durations=10
# ✅ < 30 secondes total
```

## 🚀 CI/CD

Le pipeline GitHub Actions teste automatiquement `app.users` :

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: |
    pytest app/users/tests/ \
      --cov=app.users \
      --cov-report=xml \
      --cov-report=term
```

### Commande Locale Identique au CI
```bash
bash run_tests.sh ci
```

## 📊 Rapport de Couverture

### Terminal
```bash
pytest app/users/tests/ --cov=app.users --cov-report=term-missing
```

### HTML (recommandé)
```bash
pytest app/users/tests/ --cov=app.users --cov-report=html
open htmlcov/index.html
```

### XML (pour CI/CD)
```bash
pytest app/users/tests/ --cov=app.users --cov-report=xml
# Génère coverage.xml pour Codecov, SonarQube, etc.
```

## 🎯 Objectifs

- [x] 190+ tests créés
- [x] 75%+ couverture globale
- [ ] 80%+ couverture views.py
- [ ] 80%+ couverture services.py
- [ ] Tests d'intégration ajoutés
- [ ] Tests de performance ajoutés

## 💡 Prochaines Étapes

1. **Augmenter couverture views.py**
   ```bash
   # Identifier les lignes manquantes
   pytest app/users/tests/test_verification.py --cov=app.users.views --cov-report=term-missing
   ```

2. **Augmenter couverture services.py**
   ```bash
   # Ajouter tests pour mode production
   pytest app/users/tests/test_services.py --cov=app.users.services --cov-report=term-missing
   ```

3. **Ajouter tests d'intégration**
   - Flow complet: Register → Verify Email → Login
   - Flow Google OAuth complet
   - Flow upload document → vérification

## 🆘 Support

**Tests qui échouent ?**
```bash
# Nettoyer et réessayer
bash run_tests.sh clean
bash run_tests.sh

# Vérifier les fixtures
pytest --fixtures app/users/tests/

# Mode debug
pytest app/users/tests/test_auth.py -vv --pdb
```

**Couverture insuffisante ?**
```bash
# Voir les lignes manquantes
pytest app/users/tests/ --cov=app.users --cov-report=term-missing

# Rapport HTML détaillé
pytest app/users/tests/ --cov=app.users --cov-report=html
open htmlcov/index.html
```

**Problèmes de performance ?**
```bash
# Identifier les tests lents
pytest app/users/tests/ --durations=10

# Utiliser --reuse-db
pytest app/users/tests/ --reuse-db --nomigrations
```

---

*Tests pour app.users uniquement - DZ-CarPool 2024*se