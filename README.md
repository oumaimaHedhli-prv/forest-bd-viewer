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
- Backend : http://localhost:3001
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