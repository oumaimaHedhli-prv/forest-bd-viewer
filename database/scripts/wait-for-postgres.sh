#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
TIMEOUT="${TIMEOUT:-60}"

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT} (timeout ${TIMEOUT}s)..."
start_ts=$(date +%s)

wait_once() {
  # Try /dev/tcp first
  if (echo > /dev/tcp/${DB_HOST}/${DB_PORT}) 2>/dev/null; then
    return 0
  fi
  # Fallback to nc if available
  if command -v nc >/dev/null 2>&1; then
    nc -z ${DB_HOST} ${DB_PORT} >/dev/null 2>&1 && return 0 || return 1
  fi
  return 1
}

while :; do
  if wait_once; then
    echo "Postgres is available at ${DB_HOST}:${DB_PORT}"
    exit 0
  fi
  now=$(date +%s)
  if [ $((now - start_ts)) -ge "${TIMEOUT}" ]; then
    echo "Timeout (${TIMEOUT}s) waiting for Postgres at ${DB_HOST}:${DB_PORT}"
    exit 1
  fi
  sleep 1
done
