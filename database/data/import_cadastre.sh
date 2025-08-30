#!/bin/bash
set -e

DB="forest_db"
USER="postgres"
JSON_FILE="cadastre.json"
TABLE="cadastre_parcels"

# Vérifier si le fichier existe
if [ ! -f "$JSON_FILE" ]; then
  echo "❌ Fichier $JSON_FILE introuvable."
  exit 1
fi

echo "🗄️ Import du cadastre (GeoJSON) dans la table $TABLE ..."

# Vérifier si la table existe
TABLE_EXISTS=$(psql -U $USER -d $DB -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$TABLE');")

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "⚡ La table $TABLE n'existe pas, création..."
  # Crée une table minimale, PostgreSQL gérera l'ID
  psql -U $USER -d $DB -c "CREATE TABLE $TABLE (id SERIAL PRIMARY KEY, geometry GEOMETRY(MULTIPOLYGON));"
  # Import avec création (overwrite) pour remplir la table
  ogr2ogr -f "PostgreSQL" PG:"dbname=$DB user=$USER" "$JSON_FILE" \
    -nln $TABLE -nlt MULTIPOLYGON \
    -lco GEOMETRY_NAME=geometry \
    -lco FID=id \
    -overwrite
else
  echo "⚡ La table $TABLE existe, ajout des données..."
  # Ajout des données sans toucher à la table existante
  ogr2ogr -f "PostgreSQL" PG:"dbname=$DB user=$USER" "$JSON_FILE" \
    -nln $TABLE -nlt MULTIPOLYGON \
    -lco GEOMETRY_NAME=geometry \
    -append
fi

echo "✅ Import terminé !"
