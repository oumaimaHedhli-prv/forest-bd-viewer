#!/bin/bash
set -e
# Set the PostgreSQL password
export PGPASSWORD="datafabric-local"

# Variables
DB_NAME="forest_db"
DB_USER="postgres"
DB_PASS="datafabric-local"
IFILE="database/data/bdforet_v2_75.gpkg"

# Recherche automatique d'un fichier .gpkg ou d'un dossier contenant un .shp
GPKG_FILE=$(find "database/data/" -maxdepth 2 -type f -iname '*.gpkg' | head -n 1)
SHP_FILE=$(find "database/data/BDFORET_2-0__SHP_LAMB93_D001_2014-04-01 (1)/BDFORET_2-0__SHP_LAMB93_D001_2014-04-01/BDFORET/" -maxdepth 3 -type f -iname '*.shp' | head -n 1)

if [ -n "$GPKG_FILE" ]; then
  FILE="$GPKG_FILE"
  IMPORT_TYPE="gpkg"
elif [ -n "$SHP_FILE" ]; then
  FILE="$SHP_FILE"
  IMPORT_TYPE="shp"
else
  echo "❌ Aucun fichier .gpkg ou .shp trouvé dans database/data/. Placez un .gpkg ou un dossier SHP décompressé."
  exit 1
fi

# 1. Vérifier que le fichier existe
if [ ! -f "$FILE" ]; then
  echo "❌ Fichier $FILE introuvable. Place le fichier téléchargé dans ce dossier."
  exit 1
fi

# 2. Vérification et création de la table forest_data si elle n'existe pas
echo "🛠️ Vérification de la table forest_data..."
psql -h localhost -U $DB_USER -d $DB_NAME -c "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forest_data') THEN
        CREATE TABLE forest_data (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            geometry GEOMETRY,
            species VARCHAR(255),
            area_ha FLOAT
        );
    END IF;
END
\$\$;"

# 3. Importer BD Forêt
if [ "$IMPORT_TYPE" = "gpkg" ]; then
  echo "📂 Import BD Forêt (GeoPackage): $FILE"
  ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=$DB_NAME user=$DB_USER password=$DB_PASS" "$FILE" -nln bdforet -overwrite
else
  echo "📂 Import BD Forêt (SHP): $FILE"
  ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=$DB_NAME user=$DB_USER password=$DB_PASS" "$FILE" -nln bdforet -overwrite
fi

echo "✅ Données BD Forêt importées dans PostGIS"
