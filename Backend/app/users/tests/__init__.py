"""
apps/users/tests/__init__.py
Initialisation du package de tests
"""

# Importer pytest pour la découverte automatique
import pytest

# Configuration par défaut pour tous les tests de ce package
pytestmark = pytest.mark.django_db
