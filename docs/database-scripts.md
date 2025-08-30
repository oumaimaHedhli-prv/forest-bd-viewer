# Database Scripts Documentation

## Overview
This document provides details about the scripts available in the `database/scripts/` folder. These scripts are used to manage and populate the PostgreSQL database with geospatial data.

---

## Scripts

### **1. `fetch_ign_archives.sh`**
- **Description**: Downloads the IGN archives required for the project.
- **Usage**:
  ```bash
  ./fetch_ign_archives.sh
  ```
- **Output**: Downloads the necessary files into the `database/data/` folder.

### **2. `import_bdforet.sh`**
- **Description**: Imports the BD Forêt data into the database.
- **Usage**:
  ```bash
  ./import_bdforet.sh
  ```
- **Output**: Populates the `forest_data` table with geospatial data.

### **3. `import_cadastre.sh`**
- **Description**: Imports the cadastre data into the database.
- **Usage**:
  ```bash
  ./import_cadastre.sh
  ```
- **Output**: Populates the `cadastre` table with geospatial data.

### **4. `init.sql`**
- **Description**: Initializes the database schema.
- **Usage**:
  ```bash
  psql -h localhost -U postgres -d forest_db -f init.sql
  ```
- **Output**: Creates the necessary tables and extensions in the database.

### **5. `insert-sample-data.sql`**
- **Description**: Inserts sample data into the database for testing purposes.
- **Usage**:
  ```bash
  psql -h localhost -U postgres -d forest_db -f insert-sample-data.sql
  ```
- **Output**: Populates the database with sample forest and cadastre data.

### **6. `insert-big-sample-data.sql`**
- **Description**: Inserts a large dataset for performance testing.
- **Usage**:
  ```bash
  psql -h localhost -U postgres -d forest_db -f insert-big-sample-data.sql
  ```
- **Output**: Populates the database with a large dataset for stress testing.

### **7. `update_indexes.sql`**
- **Description**: Updates the database indexes to optimize query performance.
- **Usage**:
  ```bash
  psql -h localhost -U postgres -d forest_db -f update_indexes.sql
  ```
- **Output**: Creates or updates indexes on the database tables.

---

## Notes
- Ensure that the PostgreSQL server is running before executing these scripts.
- Update the database connection details in the scripts if necessary.
- Use the `init.sql` script before importing any data to ensure the schema is correctly set up.