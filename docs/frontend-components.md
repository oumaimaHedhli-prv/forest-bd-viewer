# Documentation des Composants Frontend

## Vue d'ensemble
Ce document fournit des détails sur les composants frontend utilisés dans le projet. Ces composants sont situés dans le dossier `frontend/src/components/` et gèrent différentes fonctionnalités de l'application.

---

## Composants

### **1. `AuthModal.tsx`**
- **Description** :
  - Gère l'authentification des utilisateurs (connexion et inscription).
  - Affiche une fenêtre modale pour permettre aux utilisateurs de saisir leurs informations.
- **Fonctionnalités principales** :
  - Formulaire de connexion.
  - Formulaire d'inscription.
  - Gestion des erreurs d'authentification.
- **Dépendances** :
  - Utilise les mutations GraphQL pour `login` et `register`.

### **2. `FilterPanel.tsx`**
- **Description** :
  - Permet aux utilisateurs de filtrer les données affichées sur la carte.
  - Inclut des options pour filtrer par région, département, commune, espèce d'arbre, etc.
- **Fonctionnalités principales** :
  - Champs de sélection pour les filtres.
  - Gestion des événements pour appliquer les filtres.
  - Communication avec le composant `ForestMap` pour mettre à jour les données affichées.
- **Dépendances** :
  - Utilise les requêtes GraphQL pour récupérer les options de filtre (ex. régions, départements).

### **3. `ForestMap.tsx`**
- **Description** :
  - Affiche une carte interactive utilisant Mapbox GL JS.
  - Permet la navigation hiérarchique (région → département → commune → lieux-dit).
  - Gère les couches de données BD Forêt et Cadastre.
- **Fonctionnalités principales** :
  - Affichage des données géospatiales.
  - Navigation hiérarchique.
  - Outil de dessin de polygones pour analyser des zones spécifiques.
  - Gestion des filtres appliqués.
- **Dépendances** :
  - Utilise les services IGN pour récupérer les données géospatiales.
  - Intègre les mutations GraphQL pour soumettre les polygones dessinés.

---

## Notes
- Les composants sont écrits en TypeScript pour garantir un typage strict.

- Les composants utilisent Apollo Client pour interagir avec les APIs GraphQL.