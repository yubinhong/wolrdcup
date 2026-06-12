#!/bin/sh
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE=${ENV_FILE:-"$PROJECT_DIR/.env.production"}
RUNTIME_DIR="$PROJECT_DIR/.runtime"
CANDIDATE_FILE="$RUNTIME_DIR/worldcup-data.json"
DEPLOYED_HASH_FILE="$RUNTIME_DIR/deployed-data.sha256"

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing environment file: $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$RUNTIME_DIR"

docker compose --env-file "$ENV_FILE" --profile maintenance run --rm --build sync

candidate_hash=$(sha256sum "$CANDIDATE_FILE" | awk '{print $1}')
deployed_hash=""

if [ -f "$DEPLOYED_HASH_FILE" ]; then
  deployed_hash=$(cat "$DEPLOYED_HASH_FILE")
fi

if [ "$candidate_hash" = "$deployed_hash" ]; then
  echo "World Cup data is unchanged; skipping application rebuild."
  exit 0
fi

echo "World Cup data changed; rebuilding and restarting the application."
ENV_FILE="$ENV_FILE" "$PROJECT_DIR/deploy/redeploy.sh"
