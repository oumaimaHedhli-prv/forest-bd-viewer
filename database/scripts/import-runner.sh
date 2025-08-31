#!/bin/sh
set -e

# Simple import runner with retries
RETRIES=${RETRIES:-3}
SLEEP=${SLEEP:-5}

chmod +x /wait-for-postgres.sh /import_bdforet.sh || true

echo "Waiting for Postgres..."
if ! /wait-for-postgres.sh; then
  echo "Postgres did not become available, aborting."
  exit 1
fi

attempt=1
while [ $attempt -le $RETRIES ]; do
  echo "Import attempt $attempt/$RETRIES"
  if /import_bdforet.sh; then
    echo "Import completed successfully"
    exit 0
  fi
  echo "Import failed on attempt $attempt"
  attempt=$((attempt + 1))
  if [ $attempt -le $RETRIES ]; then
    echo "Retrying in $SLEEP seconds..."
    sleep $SLEEP
  fi
done

echo "Import failed after $RETRIES attempts"
exit 1
