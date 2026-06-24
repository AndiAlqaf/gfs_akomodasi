#!/usr/bin/env sh

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-31145}"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

exec php -S "${HOST}:${PORT}" index.php
