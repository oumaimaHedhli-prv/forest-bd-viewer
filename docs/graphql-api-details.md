# GraphQL API Documentation

## Overview
This document provides detailed information about the GraphQL APIs implemented in the backend. These APIs are used to manage user authentication, geospatial data, and map interactions.

---

## Authentication APIs

### **Mutation: `register`**
- **Description**: Registers a new user.
- **Arguments**:
  - `input` (CreateUserInput): Contains user details (email, password, firstName, lastName).
- **Response**:
  - `access_token` (String): JWT token for authentication.
  - `user` (User): Details of the registered user.

### **Mutation: `login`**
- **Description**: Authenticates a user and returns a JWT token.
- **Arguments**:
  - `email` (String): User's email.
  - `password` (String): User's password.
- **Response**:
  - `access_token` (String): JWT token for authentication.
  - `user` (User): Details of the authenticated user.

### **Mutation: `logout`**
- **Description**: Logs out the user (placeholder, no token invalidation implemented).
- **Arguments**: None.
- **Response**:
  - `success` (Boolean): Indicates if the logout was successful.

---

## Forest Data APIs

### **Query: `forests`**
- **Description**: Retrieves forest data based on filters.
- **Arguments**:
  - `filters` (ForestFilterInput, optional): Filters for region, department, commune, tree species, etc.
- **Response**:
  - `[ForestData]`: List of forest data matching the filters.

### **Query: `regions`**
- **Description**: Retrieves a list of unique regions.
- **Arguments**: None.
- **Response**:
  - `[String]`: List of region names.

### **Query: `departments`**
- **Description**: Retrieves a list of unique departments within a region.
- **Arguments**:
  - `region` (String, optional): Region name.
- **Response**:
  - `[String]`: List of department names.

### **Query: `communes`**
- **Description**: Retrieves a list of unique communes within a department.
- **Arguments**:
  - `department` (String, optional): Department name.
- **Response**:
  - `[String]`: List of commune names.

### **Query: `treeSpecies`**
- **Description**: Retrieves a list of unique tree species.
- **Arguments**: None.
- **Response**:
  - `[String]`: List of tree species.

### **Query: `forestStatistics`**
- **Description**: Retrieves statistics about forest data.
- **Arguments**:
  - `filters` (ForestFilterInput, optional): Filters for region, department, commune, tree species, etc.
- **Response**:
  - `ForestStatistics`: Contains total area, average area, and count of forests.

### **Query: `forestsByBBox`**
- **Description**: Retrieves forest data within a bounding box.
- **Arguments**:
  - `bbox` ([Float]): Bounding box coordinates [west, south, east, north].
- **Response**:
  - `[ForestData]`: List of forest data within the bounding box.

### **Query: `forestsByPolygon`**
- **Description**: Retrieves forest data intersecting a polygon.
- **Arguments**:
  - `geojson` (String): GeoJSON representation of the polygon.
- **Response**:
  - `[ForestData]`: List of forest data intersecting the polygon.

### **Query: `getLieuxDits`**
- **Description**: Retrieves unique lieux-dits (local place names) for a commune.
- **Arguments**:
  - `commune` (String): Commune name.
- **Response**:
  - `[String]`: List of lieux-dits.

---

## Polygon Analysis APIs

### **Mutation: `submitPolygon`**
- **Description**: Analyzes a user-drawn polygon and returns statistics.
- **Arguments**:
  - `geojson` (String): GeoJSON representation of the polygon.
- **Response**:
  - `PolygonStats`: Contains total area, parcel count, tree species breakdown, and intersecting parcels.

---

## User Management APIs

### **Query: `me`**
- **Description**: Retrieves the details of the currently authenticated user.
- **Arguments**: None.
- **Response**:
  - `User`: Details of the authenticated user.

### **Mutation: `updateUser`**
- **Description**: Updates user details.
- **Arguments**:
  - `id` (String): User ID.
  - `input` (UpdateUserInput): Updated user details.
- **Response**:
  - `User`: Updated user details.

### **Mutation: `deleteUser`**
- **Description**: Deletes a user.
- **Arguments**:
  - `id` (String): User ID.
- **Response**:
  - `success` (Boolean): Indicates if the deletion was successful.

---

## Data Types

### **ForestData**
- `id` (String): Unique identifier.
- `region` (String): Region name.
- `department` (String): Department name.
- `commune` (String): Commune name.
- `treeSpecies` (String): Tree species.
- `surfaceArea` (Float): Surface area in hectares.
- `geometry` (JSON): Geospatial data.

### **PolygonStats**
- `totalArea` (Float): Total area of the polygon in hectares.
- `parcelCount` (Int): Number of intersecting parcels.
- `treeSpecies` ([String]): List of tree species in the polygon.
- `speciesBreakdown` ([SpeciesArea]): Breakdown of tree species by area.
- `parcels` ([ParcelInfo]): List of intersecting parcels.

### **User**
- `id` (String): Unique identifier.
- `email` (String): User email.
- `firstName` (String): First name.
- `lastName` (String): Last name.
- `lastMapLat` (Float): Last map latitude.
- `lastMapLng` (Float): Last map longitude.
- `lastMapZoom` (Float): Last map zoom level.
- `lastMapFilters` (JSON): Last map filters.

---