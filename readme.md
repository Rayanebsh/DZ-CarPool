# 🚗 DZ-CarPool - Plateforme de Covoiturage en Algérie

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Django](https://img.shields.io/badge/Django-4.2-green)]()
[![React](https://img.shields.io/badge/React-18.2-blue)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)]()

## 📋 Description

DZ-CarPool est une plateforme web de covoiturage conçue pour faciliter les déplacements inter-wilayas en Algérie. Elle permet aux conducteurs de proposer des trajets avec des places disponibles et aux passagers de réserver ces places en toute simplicité.

## 🎯 Fonctionnalités MVP

- ✅ **Profils Utilisateurs** : Inscription conducteur/passager avec photo et biographie
- ✅ **Gestion des Trajets** : Création, modification, suppression de trajets
- ✅ **Recherche** : Recherche de trajets par ville de départ, arrivée et date
- ✅ **Réservation** : Système de réservation avec approbation manuelle
- ✅ **Messagerie** : Communication entre conducteurs et passagers
- ✅ **Tarification intelligente** : Commission 15% + option "Trajet Confort" (+30%)
- ✅ **Suggestion de prix** : Basée sur les prix du carburant par wilaya

## 🛠️ Stack Technique

### Backend
- **Framework** : Django 4.2 + Django REST Framework
- **Base de données** : PostgreSQL 15
- **Authentification** : JWT (djangorestframework-simplejwt)
- **Documentation API** : drf-spectacular (Swagger/OpenAPI)

### Frontend
- **Framework** : React 18.2
- **Routing** : React Router v6
- **HTTP Client** : Axios
- **UI** : Material-UI / Tailwind CSS

### DevOps
- **Containerisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Tests** : Pytest (backend) + Jest (frontend)

## 🚀 Démarrage Rapide

### Prérequis
- Docker Desktop installé
- Git installé

### Installation

1. Cloner le repository
```bash
git clone https://github.com/Rayanebsh/DZ-CarPool.git
cd DZ-CarPool
```

2. Lancer les services Docker
```bash
docker-compose build
docker-compose up -d
```

3. Initialiser la base de données
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

4. Accéder à l'application
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000/api/
- Admin Django : http://localhost:8000/admin/
- API Docs : http://localhost:8000/api/docs/

## 📁 Structure du Projet
```
DZ-CarPool/
├── backend/                # API Django REST
│   ├── config/            # Configuration Django
│   ├── users/             # App gestion utilisateurs
│   ├── trips/             # App gestion trajets
│   ├── reservations/      # App gestion réservations
│   └── messaging/         # App messagerie
├── frontend/              # Application React
│   ├── public/
│   └── src/
│       ├── components/    # Composants réutilisables
│       ├── pages/         # Pages de l'app
│       └── services/      # Services API
├── docs/                  # Documentation technique
└── docker-compose.yml     # Orchestration Docker
```

## 🧪 Tests
```bash
# Tests backend
docker-compose exec backend pytest

# Tests frontend
docker-compose exec frontend npm test
```

## 📚 Documentation

- [Documentation Technique](./docs/ARCHITECTURE.md)
- [Guide de Déploiement](./docs/DEPLOYMENT.md)
- [Manuel Utilisateur](./docs/USER_MANUAL.md)
- [Journal des Décisions](./docs/ARCHITECTURE_DECISIONS.md)

## 👥 Équipe

- **Bessah Rayane** - Développeur Full Stack
- **Ouldchikh Larbi Yanis** - Développeur Backend
- **Haddouche Athmane** - Développeur Frontend
- **Djoumer Yacine** - Développeur Frontend
- **Bekki Mustapha Aimen** - Designer

## 📄 Licence

Ce projet est réalisé dans le cadre du module de Génie Logiciel.

## 🔗 Liens Utiles

- [Cahier des charges](./docs/cahier_des_charges.pdf)
- [Diagrammes UML](./docs/diagrams/)
- [Rapport de projet](./docs/rapport_final.pdf)