# Project TODO - Jira Ticket Creator

## Core Features
- [x] Configuration des variables d'environnement Jira (JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY)
- [x] Schéma de base de données pour les tickets créés
- [x] Procédure tRPC pour créer les tickets Jira
- [x] Formulaire dynamique avec sélection de technologie
- [x] Champs communs (Code Solution, Environnement, Squad, Email)
- [x] Champs conditionnels pour VM/Kubernetes (CPU, RAM)
- [x] Champs conditionnels pour Base de données (Type moteur, Taille disque)
- [x] Champs conditionnels pour Stockage (Type, Quota)
- [x] Appel API Jira depuis le backend
- [x] Affichage du lien du ticket créé
- [x] Gestion des erreurs avec messages clairs
- [x] Loading states et feedback visuel
- [x] Tests unitaires pour la création de tickets Jira

## UI/UX
- [x] Layout dashboard épuré
- [x] Formulaire réactif et accessible
- [x] Messages de succès/erreur
- [x] Spinner de chargement
- [x] Design cohérent avec Tailwind CSS


## Bugs à corriger
- [x] Route /api/oauth/login retourne 404 - Corriger la configuration OAuth


## Changements demandés
- [x] Rendre l'application accessible sans authentification OAuth
- [x] Modifier le formulaire pour être public
- [x] Adapter le backend pour accepter les demandes publiques


## Nouvelles Fonctionnalités
- [x] Ajouter un bouton pour créer une technologie personnalisée
- [x] Modifier le champ environnement pour accepter les combinaisons (DEV+INT, INT+UAT, etc.)
- [x] Mettre à jour le backend pour valider les nouvelles données


## Améliorations Demandées
- [x] Restructurer le formulaire pour supporter plusieurs technologies
- [x] Squad et Email demandés une seule fois en haut
- [x] Bouton "Ajouter une technologie" pour ajouter des formulaires en bas
- [x] Adapter le backend pour créer plusieurs tickets en une seule requête
