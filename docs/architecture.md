# Architecture Documentation

## System Architecture

```mermaid
graph TD
    A[Frontend: Next.js] -->|GraphQL Queries| B[Backend: Nest.js]
    B -->|Database Queries| C[PostgreSQL + PostGIS]
    B -->|File Storage| D[Mock Data / Local Files]
    A -->|Map Rendering| E[Mapbox GL JS]
    E -->|Layers| F[BD Forêt + Cadastre]
```

### Components

1. **Frontend**:
   - Built with Next.js and TypeScript.
   - Integrates Mapbox GL JS for interactive mapping.
   - Handles user authentication and map interactions.

2. **Backend**:
   - Built with Nest.js and TypeORM.
   - Exposes GraphQL APIs for user management, geospatial data, and map state.
   - Stores user data and map state in PostgreSQL with PostGIS extensions.

3. **Database**:
   - PostgreSQL with PostGIS for geospatial data.
   - Stores BD Forêt and Cadastre data.

4. **Mapping Services**:
   - Mapbox GL JS for rendering maps and layers.
   - Mock data used for prototyping due to limited access to official geoservices.

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Login/Register
    Frontend->>Backend: GraphQL Mutation (Auth)
    Backend->>Database: Store/Retrieve User Data
    User->>Frontend: Interact with Map
    Frontend->>Backend: GraphQL Query (Map Data)
    Backend->>Database: Query Geospatial Data
    Database-->>Backend: Return Data
    Backend-->>Frontend: Return Map Data
    Frontend-->>User: Render Map
```

## Deployment Architecture

```
graph LR
    A[GitHub Actions] -->|CI/CD Pipeline| B[Docker Images]
    B -->|Docker Compose| C[Local Server]
    C -->|Frontend + Backend| D[User]
```

### Deployment Details
- **CI/CD**: GitHub Actions for building, testing, and deploying Docker images.
- **Docker Compose**: Orchestrates frontend, backend, and database services locally.

---

## File Path
This document is located at: `forest-bd-viewer/docs/architecture.md`