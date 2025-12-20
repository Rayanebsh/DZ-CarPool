#!/bin/bash

# Script pour exécuter les tests avec différentes options
# Usage: ./run_tests.sh [option]

set -e  # Arrêter sur erreur

echo "🧪 DZ-CarPool - Exécution des tests"
echo "===================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

case "${1:-all}" in
    "all")
        echo -e "${BLUE}📋 Exécution de TOUS les tests users${NC}"
        pytest app/users/tests/
        ;;
    
    "auth")
        echo -e "${BLUE}🔐 Tests d'authentification uniquement${NC}"
        pytest app/users/tests/test_auth.py -v
        ;;
    
    "verification")
        echo -e "${BLUE}✅ Tests de vérification uniquement${NC}"
        pytest app/users/tests/test_verification.py -v
        ;;
    
    "profile")
        echo -e "${BLUE}👤 Tests de profil uniquement${NC}"
        pytest app/users/tests/test_profile.py -v
        ;;
    
    "documents")
        echo -e "${BLUE}📄 Tests de documents uniquement${NC}"
        pytest app/users/tests/test_documents.py -v
        ;;
    
    "security")
        echo -e "${BLUE}🔒 Tests de sécurité uniquement${NC}"
        pytest app/users/tests/test_security.py -v
        ;;
    
    "models")
        echo -e "${BLUE}🗄️  Tests des modèles uniquement${NC}"
        pytest app/users/tests/test_models.py -v
        ;;
    
    "serializers")
        echo -e "${BLUE}📝 Tests des serializers uniquement${NC}"
        pytest app/users/tests/test_serializers.py -v
        ;;
    
    "services")
        echo -e "${BLUE}🔧 Tests des services uniquement${NC}"
        pytest app/users/tests/test_services.py -v
        ;;
    
    "permissions")
        echo -e "${BLUE}🛡️  Tests des permissions uniquement${NC}"
        pytest app/users/tests/test_permissions.py -v
        ;;
    
    "users")
        echo -e "${BLUE}👥 Tous les tests users${NC}"
        pytest app/users/tests/ -v
        ;;
    
    "fast")
        echo -e "${YELLOW}⚡ Tests rapides (sans slow)${NC}"
        pytest app/users/tests/ -m "not slow" -v
        ;;
    
    "coverage")
        echo -e "${BLUE}📊 Tests avec rapport de couverture détaillé${NC}"
        pytest app/users/tests/ --cov=app.users --cov-report=html --cov-report=term-missing
        echo -e "${GREEN}✅ Rapport généré dans htmlcov/index.html${NC}"
        ;;
    
    "ci")
        echo -e "${BLUE}🚀 Tests pour CI/CD${NC}"
        pytest app/users/tests/ --maxfail=1 --disable-warnings -q
        ;;
    
    "verbose")
        echo -e "${BLUE}🔍 Tests en mode verbose${NC}"
        pytest app/users/tests/ -vv --tb=long
        ;;
    
    "failed")
        echo -e "${YELLOW}🔄 Réexécuter les tests qui ont échoué${NC}"
        pytest app/users/tests/ --lf -v
        ;;
    
    "clean")
        echo -e "${YELLOW}🧹 Nettoyage des fichiers de cache et couverture${NC}"
        find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
        find . -type f -name "*.pyc" -delete
        rm -rf .pytest_cache htmlcov .coverage
        echo -e "${GREEN}✅ Nettoyage terminé${NC}"
        ;;
    
    "help")
        echo "Usage: ./run_tests.sh [option]"
        echo ""
        echo "Options disponibles:"
        echo "  all         - Tous les tests users (par défaut)"
        echo "  auth        - Tests d'authentification"
        echo "  verification - Tests de vérification"
        echo "  profile     - Tests de profil"
        echo "  documents   - Tests de documents"
        echo "  security    - Tests de sécurité"
        echo "  models      - Tests des modèles"
        echo "  serializers - Tests des serializers"
        echo "  services    - Tests des services"
        echo "  permissions - Tests des permissions"
        echo "  users       - Tous les tests users (alias de 'all')"
        echo "  fast        - Tests rapides uniquement"
        echo "  coverage    - Tests avec rapport de couverture"
        echo "  ci          - Tests pour CI/CD"
        echo "  verbose     - Tests en mode verbose"
        echo "  failed      - Réexécuter les tests échoués"
        echo "  clean       - Nettoyer les fichiers cache"
        echo "  help        - Afficher cette aide"
        ;;
    
    *)
        echo -e "${RED}❌ Option invalide: $1${NC}"
        echo "Utilisez './run_tests.sh help' pour voir les options"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Terminé!${NC}"