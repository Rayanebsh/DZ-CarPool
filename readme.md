# 🚗 DZ-CarPool — Plateforme de Covoiturage en Algérie

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Django](https://img.shields.io/badge/Django-4.2-green)]()
[![React](https://img.shields.io/badge/React-18.2-blue)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)]()

## 📋 Description

**DZ-CarPool** est une plateforme web de covoiturage dédiée aux déplacements inter-wilayas en Algérie. Les conducteurs publient des trajets avec des places disponibles ; les passagers recherchent, réservent et communiquent facilement.

## 🎯 Fonctionnalités (MVP)

* **Profils utilisateurs** : conducteur / passager (photo, bio)
* **Gestion des trajets** : création, modification, suppression
* **Recherche avancée** : départ, arrivée, date
* **Réservation** : approbation manuelle par le conducteur
* **Messagerie** : échanges conducteur ↔ passager
* **Tarification** : commission 15% + option *Trajet Confort* (+30%)
* **Suggestion de prix** : basée sur le carburant par wilaya

## 🛠️ Stack Technique

### Backend

* **Framework** : Django 4.2, Django REST Framework
* **Base de données** : PostgreSQL 15
* **Auth** : JWT (`djangorestframework-simplejwt`)
* **Docs API** : OpenAPI/Swagger (`drf-spectacular`)

### Frontend

* **Framework** : React 18
* **Routing** : React Router v6
* **HTTP** : Axios
* **UI** : Material UI / Tailwind CSS

### DevOps

* **Containerisation** : Docker, Docker Compose
* **CI/CD** : GitHub Actions
* **Tests** : Pytest (backend), Jest (frontend)

## 🚀 Démarrage Rapide

### Prérequis

* Docker Desktop
* Git

### Installation

```bash
git clone https://github.com/Rayanebsh/DZ-CarPool.git
cd DZ-CarPool
```

```bash
docker-compose build
docker-compose up -d
```

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Accès

* **Frontend** : [http://localhost:3000](http://localhost:3000)
* **API** : [http://localhost:8000/api/](http://localhost:8000/api/)
* **Admin** : [http://localhost:8000/admin/](http://localhost:8000/admin/)
* **Docs API** : [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

## 📁 Structure du Projet

```
DZ-CarPool/
├── backend/                # API Django REST
│   ├── app/                # Apps Django
│   ├── config/             # Configuration Django
│   ├── core/               # Logique métier commune
│   ├── tests/              # Tests backend
│   ├── utils/              # Outils utilitaires
│   └── media/              # Fichiers uploadés
├── frontend/               # Application React
│   ├── app/                # Pages / routing
│   ├── components/         # Composants réutilisables
│   ├── contexts/           # Context API / Auth
│   ├── hooks/              # Hooks personnalisés
│   ├── services/           # Appels API
│   └── public/             # Assets publics
├── docs/                   # Documentation
│   ├── design/
│   └── diagrams/
├── integration/            # Intégration / E2E
├── docker-compose.yml      # Orchestration Docker
└── README.md
```

> **Note** : `.venv`, `node_modules`, `.next`, `staticfiles` sont volontairement exclus.

## 🧪 Tests

```bash
# Backend
docker-compose exec backend pytest

# Frontend
docker-compose exec frontend npm test
```

## 📚 Documentation

* Architecture : `docs/ARCHITECTURE.md`
* Déploiement : `docs/DEPLOYMENT.md`
* Manuel utilisateur : `docs/USER_MANUAL.md`
* Décisions d’architecture : `docs/ARCHITECTURE_DECISIONS.md`

## 👥 Équipe

* **Bessah Rayane** — Full Stack
* **Ouldchikh Larbi Yanis** — Backend
* **Haddouche Athmane** — Frontend
* **Djoumer Yacine** — Frontend
* **Bekki Mustapha Aimen** — Design

## 📄 Licence

Projet académique — module *Génie Logiciel*.

## 🔗 Liens

* Cahier des charges : `docs/cahier_des_charges.pdf`
* Diagrammes UML : `docs/diagrams/`
* Rapport final : `docs/rapport_final.pdf`
