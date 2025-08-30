# Architecture Details

## System Architecture

### Global Architecture
```
Frontend (Next.js) --> Backend (Nest.js) --> PostgreSQL + PostGIS
Frontend (Mapbox GL JS/maplibre) --> BD Forêt + Cadastre (Mock Data)
```

- **Frontend** : Gère l'interface utilisateur, l'authentification, et l'affichage de la carte.
- **Backend** : Fournit des APIs GraphQL pour les données géospatiales et les utilisateurs.
- **Base de données** : PostgreSQL avec PostGIS pour stocker les données géospatiales.

---

## Data Flow

### Data Flow Diagram
```
Utilisateur --> Frontend --> Backend --> Base de données
Utilisateur <-- Frontend <-- Backend <-- Base de données
```

1. L'utilisateur interagit avec l'interface cartographique (zoom, filtres, navigation).
2. Le frontend envoie des requêtes GraphQL au backend.
3. Le backend interroge la base de données pour récupérer les données nécessaires.
4. Les données sont renvoyées au frontend pour affichage.

---

## Database Design

### Database Schema

1. **Table `users`** :
   - Stocke les informations des utilisateurs.
   - Champs :
     - `id` (UUID, clé primaire)
     - `email` (string, unique)
     - `password` (string, hashé)
     - `firstName` (string)
     - `lastName` (string)
     - `lastMapLat` (float, latitude de la dernière position de la carte)
     - `lastMapLng` (float, longitude de la dernière position de la carte)
     - `lastMapZoom` (float, niveau de zoom de la carte)
     - `lastMapFilters` (JSON, filtres appliqués)

2. **Table `forest_data`** :
   - Stocke les données de la BD Forêt.
   - Champs :
     - `id` (UUID, clé primaire)
     - `region` (string)
     - `department` (string)
     - `commune` (string)
     - `lieuxdit` (string, nullable)
     - `treeSpecies` (string, espèce d'arbre)
     - `surfaceArea` (float, surface en hectares)
     - `geometry` (geometry, données géospatiales)

3. **Table `cadastre`** :
   - Stocke les données cadastrales.
   - Champs :
     - `id` (UUID, clé primaire)
     - `commune` (string)
     - `department` (string)
     - `geometry` (geometry, données géospatiales)

---

### Relationships

- **Relation `users` → `forest_data`** :
  - Les utilisateurs peuvent interagir avec les données forestières via des filtres et des requêtes.
- **Relation `forest_data` → `cadastre`** :
  - Les données forestières peuvent être croisées avec les données cadastrales pour des analyses géospatiales.