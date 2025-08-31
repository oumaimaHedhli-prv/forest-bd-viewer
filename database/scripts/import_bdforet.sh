#!/bin/bash
set -e
# Use environment variables with sensible defaults so this script can run in a dedicated importer container
DB_HOST="${DB_HOST:-db}"
DB_NAME="${DB_NAME:-forest_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-password}"
export PGPASSWORD="$DB_PASS"

# Variables
# IFILE default kept for backward compatibility but script will auto-detect files under /data when run in the importer
IFILE="/data/bdforet_v2_75.gpkg"

# Recherche automatique d'un fichier .gpkg ou d'un dossier contenant un .shp sous le point de montage /data
GPKG_FILE=$(find "/data" -maxdepth 3 -type f -iname '*.gpkg' | head -n 1)
SHP_FILE=$(find "/data" -maxdepth 5 -type f -iname '*.shp' | head -n 1)

if [ -n "$GPKG_FILE" ]; then
  FILE="$GPKG_FILE"
  IMPORT_TYPE="gpkg"
elif [ -n "$SHP_FILE" ]; then
  FILE="$SHP_FILE"
  IMPORT_TYPE="shp"
else
  echo "❌ Aucun fichier .gpkg ou .shp trouvé dans /data. Montez vos données dans ./database/data et relancez le conteneur importer."
  exit 1
fi

# 1. Vérifier que le fichier existe
if [ ! -f "$FILE" ]; then
  echo "❌ Fichier $FILE introuvable. Placez le fichier téléchargé dans ./database/data et remontez le volume."
  exit 1
fi

# 2. Vérification et création de la table forest_data si elle n'existe pas
# Note: l'import via ogr2ogr écrasera la table 'bdforet' par défaut. On crée ici une table minimale si nécessaire.
echo "🛠️ Vérification de la table forest_data..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
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
  ogr2ogr -f "PostgreSQL" PG:"host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASS" "$FILE" -nln bdforet -overwrite
else
  echo "📂 Import BD Forêt (SHP): $FILE"
  ogr2ogr -f "PostgreSQL" PG:"host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASS" "$FILE" -nln bdforet -overwrite
fi

echo "✅ Données BD Forêt importées dans PostGIS"
