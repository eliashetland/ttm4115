#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yaml"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is not installed or not in PATH."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: Docker Compose plugin is not available."
  exit 1
fi

echo "Building Docker images (frontend, backend, drone)..."
docker compose -f "$COMPOSE_FILE" build

echo "Starting services..."
docker compose -f "$COMPOSE_FILE" up "$@"
