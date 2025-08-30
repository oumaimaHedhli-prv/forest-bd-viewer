#!/bin/bash
set -e

# Variables
DB_NAME="foret_db"
DB_USER="postgres"
DB_PASS="datafabric-local"
IFILE="database/data/bdforet_v2_75.gpkg"

# Supporte aussi les fichiers SHP décompressés (ex: dossier database/data/DEPT/ contenant .shp, .dbf, .shx...)
# Si un .gpkg est présent, on l'importe, sinon on cherche un .shp

# Recherche automatique d'un fichier .gpkg ou d'un dossier contenant un .shp dans database/data/
GPKG_FILE=$(find database/data/ -maxdepth 2 -type f -iname '*.gpkg' | head -n 1)
SHP_FILE=$(find database/data/ -maxdepth 3 -type f -iname '*.shp' | head -n 1)

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

# 1. Télécharger fichier
if [ ! -f "$FILE" ]; then
  echo "❌ Fichier $FILE introuvable. Place le fichier téléchargé dans ce dossier."
  exit 1
fi

# 2. Créer base Postgres + PostGIS
echo "🗄️ Création base PostGIS..."
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
psql -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 3. Importer BD Forêt
if [ "$IMPORT_TYPE" = "gpkg" ]; then
  echo "📂 Import BD Forêt (GeoPackage): $FILE"
  ogr2ogr -f "PostgreSQL" PG:"dbname=$DB_NAME user=$DB_USER password=$DB_PASS" "$FILE" -nln bdforet -overwrite
else
  echo "📂 Import BD Forêt (SHP): $FILE"
  ogr2ogr -f "PostgreSQL" PG:"dbname=$DB_NAME user=$DB_USER password=$DB_PASS" "$FILE" -nln bdforet -overwrite
fi

echo "✅ Données BD Forêt importées dans PostGIS"
