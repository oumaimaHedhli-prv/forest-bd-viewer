# Backend Entities Documentation

## Overview
This document provides details about the entities used in the backend. These entities represent the database tables and are defined using TypeORM.

---

## Entities

### **1. `User`**
- **File**: `backend/src/entities/user.entity.ts`
- **Description**: Represents a user in the system.
- **Fields**:
  - `id` (UUID, primary key): Unique identifier for the user.
  - `email` (string, unique): User's email address.
  - `password` (string): Hashed password.
  - `firstName` (string): User's first name.
  - `lastName` (string): User's last name.
  - `lastMapLat` (float, nullable): Last latitude of the map view.
  - `lastMapLng` (float, nullable): Last longitude of the map view.
  - `lastMapZoom` (float, nullable): Last zoom level of the map view.
  - `lastMapFilters` (JSON, nullable): Last applied map filters.

### **2. `ForestData`**
- **File**: `backend/src/entities/forest-data.entity.ts`
- **Description**: Represents forest data from BD Forêt.
- **Fields**:
  - `id` (UUID, primary key): Unique identifier for the forest data.
  - `region` (string): Region name.
  - `department` (string): Department name.
  - `commune` (string): Commune name.
  - `lieuxdit` (string, nullable): Local place name.
  - `treeSpecies` (string): Tree species.
  - `surfaceArea` (float): Surface area in hectares.
  - `geometry` (geometry): Geospatial data.

### **3. `Cadastre`**
- **File**: `backend/src/entities/cadastre.entity.ts`
- **Description**: Represents cadastral data.
- **Fields**:
  - `id` (UUID, primary key): Unique identifier for the cadastre data.
  - `commune` (string): Commune name.
  - `department` (string): Department name.
  - `geometry` (geometry): Geospatial data.

---

## Notes
- These entities are mapped to the PostgreSQL database tables using TypeORM.
- Ensure the database schema matches the entity definitions to avoid runtime errors.