#!/usr/bin/env bash
set -euo pipefail

# Exemple : ./fetch_ign_archives.sh /data
OUT_DIR=${1:-/data}
IGN_API_KEY=${IGN_API_KEY:-${NEXT_PUBLIC_IGN_API_KEY:-""}}

if [ -z "$IGN_API_KEY" ]; then
  echo "ERROR: IGN_API_KEY not set. Export IGN_API_KEY or NEXT_PUBLIC_IGN_API_KEY in env."
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "Downloading BD Forêt V2 example archive (replace URL by the exact dataset URL you requested)..."
# NOTE: Replace the URL below by the actual download endpoint you've obtained from geoservices.ign.fr
BD_FORET_URL="https://geoservices.ign.fr/telechargement?service=bdforet&key=${IGN_API_KEY}"
BD_FORET_OUT="${OUT_DIR}/bdforet_v2.zip"

# Example wget (may require different URL or token handling)
echo "Fetching BD Forêt (example URL) to ${BD_FORET_OUT} — check your IGN account for the correct URL"
wget --no-check-certificate -O "${BD_FORET_OUT}" "${BD_FORET_URL}" || {
  echo "Warning: automatic download failed, please download manually from geoservices.ign.fr and place the zip in ${OUT_DIR}"
}

echo "Downloading Cadastre example (if needed)..."
CADASTRE_URL="https://cadastre.data.gouv.fr/data/etalab-cadastre/latest/shp/departements/XX/cadastre-XX-parcelles.shp.zip"
CADASTRE_OUT="${OUT_DIR}/cadastre-dept-XX.zip"
# Replace XX with department code or fetch programmatically
# wget -O "${CADASTRE_OUT}" "${CADASTRE_URL}" || echo "Cadastre download skipped."

echo "Done. Unzip files in ${OUT_DIR} and run import scripts (import_bdforet.sh / import_cadastre.sh)."
echo "Important: verify license/terms on IGN before automated downloads. Manual approval may be required."
