#!/usr/bin/env bash
# Serve the site locally. Opening index.html directly with file:// works in
# some browsers but Chrome blocks the Wikipedia image request from a file
# origin, so the photos come up blank. Serving over http avoids that.
set -euo pipefail
PORT="${1:-8000}"
cd "$(dirname "$0")"
echo "Somewhere Else -> http://localhost:${PORT}"
exec python3 -m http.server "$PORT"
