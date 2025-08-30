#!/bin/bash
# Script de téléchargement BD Forêt IGN

# === CONFIGURATION ===
# Remplace par le code du département que tu veux télécharger (ex: D001, D002, etc.)
DEPT="D976"

# Dossier de destination
DEST="."
mkdir -p "$DEST"

# URL de base (⚠️ adapte en fonction de ce que tu as copié sur IGN)
# Exemple de patron pour un département fractionné en plusieurs parties :
BASE_URL="https://data.geopf.fr/telechargement/download/BDFORET/MASQUEFORET__BETA_GPKG_LAMB93_FXX_2024-01-01/MASQUEFORET__BETA_GPKG_LAMB93_FXX_2024-01-01.7z"

# Nombre de parties attendu (⚠️ adapte si besoin, IGN indique combien de fichiers il y a)
PARTS=2

# === TELECHARGEMENT ===
echo "📥 Téléchargement des parties de $DEPT ..."

for i in $(seq 1 $PARTS); do
    FILE="$DEST/bdforet_${DEPT}.part${i}.7z"
    URL="${BASE_URL}.part${i}.7z"
    
    echo "➡️  Téléchargement : $URL"
    curl -L -C - -o "$FILE" "$URL"

    # Vérifie que le fichier n’est pas vide
    if [ ! -s "$FILE" ]; then
        echo "❌ ERREUR : le fichier $FILE est vide ou manquant"
        exit 1
    fi
done

# === ASSEMBLAGE ===
echo "🔗 Assemblage des parties ..."
if ls $DEST/bdforet_${DEPT}.part*.7z 1> /dev/null 2>&1; then
    cat $DEST/bdforet_${DEPT}.part*.7z > $DEST/bdforet_${DEPT}.7z
else
    echo "❌ Aucune partie trouvée pour $DEPT. Télécharge d'abord les fichiers .part*.7z manuellement depuis IGN."
    exit 1
fi

# === DECOMPRESSION ===
echo "📂 Décompression ..."
if [ -f "$DEST/bdforet_${DEPT}.7z" ]; then
    7z x "$DEST/bdforet_${DEPT}.7z" -o"$DEST/bdforet_shp_${DEPT}"
    echo "✅ BD Forêt $DEPT téléchargée et décompressée avec succès !"
else
    echo "❌ L'archive assemblée $DEST/bdforet_${DEPT}.7z est introuvable."
    exit 1
fi
