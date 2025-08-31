# Forest BD Viewer

Application de visualisation des données forestières.

## Structure du Projet

Ce projet est organisé en monorepo avec les composants suivants :
- `frontend/` : Application Next.js
- `backend/` : API NestJS avec GraphQL
- `database/` : Scripts et données PostgreSQL/PostGIS

## Prérequis

- Node.js 18+
- Docker et Docker Compose
- npm ou yarn

## Installation

```bash
# Installation des dépendances pour tous les workspaces
npm install

# Ou avec yarn
yarn install
```

## Démarrage

### Avec Docker (recommandé)

```bash
docker-compose up
```

L'application sera disponible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:4000
- Base de données : localhost:5432

### Sans Docker (développement)

```bash
# Démarrer tous les services
npm run dev

# Démarrer uniquement le frontend
npm run dev:frontend

# Démarrer uniquement le backend
npm run dev:backend
```

## Scripts disponibles

- `npm run dev` : Démarre le frontend et le backend en mode développement
- `npm run build` : Build tous les projets
- `npm run lint` : Exécute le linting sur tous les projets
- `npm run test` : Lance les tests de tous les projets

## Time Estimation for Each Part

### Core Features
1. **Authentication**: ~4 hours
   - Implemented user registration, login, and logout.
   - Stored the last map view state for each user.

2. **Interactive Mapping Interface**: ~8 hours (need more time to integrate all )
   - Integrated Mapbox GL JS for map display.
   - Added hierarchical navigation (region → department → commune → lieux-dit).
   - Displayed BD Forêt and Cadastre layers based on zoom levels.
   - Added filters and controls for user experience.

3. **Backend**: ~6 hours
   - Set up APIs to manage geospatial data.
   - Implemented CRUD operations for the users table using TypeORM and GraphQL.
   - Stored and retrieved the last map view state for users.

4. **Deployment**: ~2 hours
   - Configured Docker and Docker Compose for local setup.
   - Added CI/CD pipeline for deployment.

### Bonus Features
1. **Polygon Drawing Tool**: ~4 hours (need more time)
   - Implemented a tool to draw polygons on the map.
   - Sent polygons to the backend and returned statistics (size, parcel names, tree species).

### docs : 2H
### """more time to clean code """"

 
### Total Time Spent
~26 hours

## Challenges Faced
1. **Geoservices Data Availability**:
   - The official geoservices data (BD Forêt and Cadastre) were not available during development.
   - Used mock data to prototype and test the application.

2. **Mapbox GL JS Licensing**:
   - Mapbox GL JS required a paid account for full functionality.
   - Used a trial account with international map coverage for testing.

3. **Time Constraints**:
   - Focused on clean code and architecture over completeness due to limited time.

---

## État d'avancement des modules

### Backend
- **Authentification** : 100%
  - Inscription, connexion, et déconnexion implémentées.
  - JWT pour l'authentification.
- **Données forestières** : 90%
  - Requêtes GraphQL pour récupérer les données géospatiales.
  - Analyse des polygones presque complète (tests supplémentaires nécessaires).
- **Gestion des utilisateurs** : 100%
  - CRUD complet pour les utilisateurs.

### Frontend
- **Interface utilisateur** : 80%
  - Carte interactive avec Mapbox GL JS/maplibre.
  - Navigation hiérarchique (région → département → commune → lieux-dit).
  - Filtres fonctionnels.
- **Authentification** : 100%
  - Modale pour la connexion et l'inscription.
  - Gestion des erreurs d'authentification.
- **Dessin de polygones** : 80%
  - Outil de dessin fonctionnel.
  - Analyse des polygones en cours de finalisation.

### Base de données
- **Schéma** : 100%
  - Tables pour les utilisateurs, les données forestières, et le cadastre.
- **Scripts** : 100%
  - Scripts pour l'importation des données et la configuration initiale.

### Tests
- **Backend** : 80%
  - Tests end-to-end pour les fonctionnalités principales.
  - Tests supplémentaires nécessaires pour les cas limites.
- **Frontend** : 70%
  - Tests manuels effectués.
  - Automatisation des tests en cours.

### Déploiement
- **Docker** : 100%
  - Configuration Docker pour le backend, le frontend, et la base de données.
- **CI/CD** : 70%
  - Pipeline de base configuré avec GitHub Actions.
  - Tests automatiques à intégrer.