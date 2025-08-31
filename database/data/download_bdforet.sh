#!/bin/bash
set -e

# === CONFIGURATION ===
# URL de téléchargement
URL="https://www.swisstransfer.com/d/c83a214f-d4d2-4e5d-9361-ac1863313ff8"

# Dossier de destination
DEST="database/data"
mkdir -p "$DEST"

# Nom du fichier téléchargé
FILE="$DEST/bdforet.7z"

# === TELECHARGEMENT ===
echo "📥 Téléchargement de BD Forêt depuis $URL ..."
curl -L -o "$FILE" "$URL"

# Vérifie que le fichier a été téléchargé
if [ ! -s "$FILE" ]; then
    echo "❌ ERREUR : le fichier $FILE est vide ou manquant"
    exit 1
fi

# === DECOMPRESSION ===
echo "📂 Décompression de l'archive ..."
7z x "$FILE" -o"$DEST/bdforet_extracted"

echo "✅ Téléchargement et décompression terminés ! Les fichiers sont dans $DEST/bdforet_extracted"