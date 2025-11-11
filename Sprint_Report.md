Rapport de sprint — format et exemple
Template (fichier SPRINT_<n>_REPORT.md) — remplis à chaque sprint :

Sprint : numéro, dates (ex: 2025-11-01 → 2025-11-14)

Objectifs du sprint : liste 3–6 items.

Work done : backlog items complétés (liens PR).

Pivot / Changements : expliquer ce qui a été modifié et pourquoi. Exemples (copier-coller) :

Initialement, nous avions prévu que la réservation d'un passager soit automatiquement confirmée. En testant le scénario, nous avons compris que cela enlevait tout contrôle au conducteur. Pour le Sprint 2, nous avons donc pivoté vers un système de "demande de réservation" avec approbation manuelle. Cela a nécessité de revoir le schéma de la table reservations pour y ajouter un champ status (pending, confirmed, rejected).

Blocages / risques : décrire et proposer actions correctives.

Chiffres / metrics : nombre de PRs, couverture tests, temps de réponse moyen (si dispo).

Tâches pour le sprint suivant : 3–5 priorités.

Procédure : chaque changement structurel doit référencer la PR et la migration DB. C’est tout.