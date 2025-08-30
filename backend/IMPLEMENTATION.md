# Documentation d'Implémentation - Backend

## Aperçu
Le backend est construit avec **NestJS**, un framework Node.js qui suit une architecture modulaire et utilise TypeScript. Il utilise **GraphQL** pour une communication efficace entre le frontend et le backend.

## Structure
- **src/app/** : Contient les fichiers principaux comme `app.module.ts` et `main.ts`.
- **src/auth/** : Gère l'authentification avec JWT et Passport.
- **src/common/** : Contient des DTOs pour la validation des données.
- **src/config/** : Gère la configuration de la base de données et d'autres paramètres.
- **src/entities/** : Définit les entités TypeORM pour la base de données.
- **src/forest/** : Implémente les fonctionnalités liées aux données forestières.
- **src/users/** : Gère les utilisateurs et leurs données.

## Choix Techniques
- **NestJS** : Fournit une architecture modulaire et une intégration facile avec TypeORM.
- **TypeORM** : Simplifie la gestion des bases de données relationnelles.
- **GraphQL** : Permet des requêtes flexibles et optimisées entre le frontend et le backend.
- **JWT** : Utilisé pour une authentification sécurisée et stateless.
- **TypeScript** : Améliore la qualité du code et réduit les erreurs.

## Justification des Choix
- **NestJS** : Idéal pour les applications complexes nécessitant une architecture modulaire.
- **TypeORM** : Simplifie les opérations CRUD et la gestion des migrations.
- **GraphQL** : Réduit la surcharge réseau en permettant de récupérer uniquement les données nécessaires.
- **JWT** : Fournit une méthode sécurisée pour gérer les sessions utilisateur.

## Points d'Amélioration
- Ajouter des tests unitaires et end-to-end pour les modules critiques.
- Optimiser les requêtes SQL pour améliorer les performances.
- Ajouter une gestion des erreurs plus robuste.