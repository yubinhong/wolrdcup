#!/bin/sh
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE=${ENV_FILE:-"$PROJECT_DIR/.env.production"}
DATA_FILE="$PROJECT_DIR/src/data/worldcup-data.json"
RUNTIME_DIR="$PROJECT_DIR/.runtime"
CANDIDATE_FILE="$RUNTIME_DIR/worldcup-data.json"
DEPLOYED_HASH_FILE="$RUNTIME_DIR/deployed-data.sha256"

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing environment file: $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$RUNTIME_DIR"
backup_file=$(mktemp)
cp "$DATA_FILE" "$backup_file"

restore_source_data() {
  trap - EXIT HUP INT TERM
  cp "$backup_file" "$DATA_FILE"
  rm -f "$backup_file"
}

trap restore_source_data EXIT HUP INT TERM

if [ -f "$CANDIDATE_FILE" ]; then
  cp "$CANDIDATE_FILE" "$DATA_FILE"
fi

docker compose --env-file "$ENV_FILE" up -d --build app

if [ -f "$CANDIDATE_FILE" ]; then
  sha256sum "$CANDIDATE_FILE" | awk '{print $1}' > "$DEPLOYED_HASH_FILE"
fi
