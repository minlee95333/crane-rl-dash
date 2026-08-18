#!/usr/bin/env bash
set -euo pipefail

# One-click launcher for the Crane RL dashboard.
# - Starts the Python backend server
# - Opens the dashboard in the available browser
# - Stops the server when this script is interrupted with Ctrl+C

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-8000}"
HOST="${HOST:-127.0.0.1}"
URL="http://${HOST}:${PORT}"
LOG_FILE="${LOG_FILE:-${ROOT_DIR}/dashboard_server.log}"
PID_FILE="${ROOT_DIR}/dashboard_server.pid"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo
    echo "[INFO] Stopping dashboard server PID ${SERVER_PID}..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
}
trap cleanup EXIT INT TERM

if ! command -v python3 >/dev/null 2>&1; then
  echo "[ERROR] python3 not found. Install Python 3 first."
  exit 1
fi

if [[ ! -f "app.py" ]]; then
  echo "[ERROR] app.py not found. Run this script from the crane_rl_dashboard project directory."
  exit 1
fi

# If the port is already serving this dashboard, just open it.
if python3 - <<PY >/dev/null 2>&1
import urllib.request
urllib.request.urlopen('${URL}/api/config', timeout=1).read()
PY
then
  echo "[INFO] Dashboard server already running at ${URL}"
  SERVER_PID=""
else
  echo "[INFO] Starting Crane RL dashboard server at ${URL}"
  echo "[INFO] Log file: ${LOG_FILE}"
  PORT="$PORT" python3 app.py > "$LOG_FILE" 2>&1 &
  SERVER_PID=$!
  echo "$SERVER_PID" > "$PID_FILE"

  echo -n "[INFO] Waiting for server"
  for _ in {1..60}; do
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo
      echo "[ERROR] Server exited before becoming ready. Recent log:"
      tail -80 "$LOG_FILE" || true
      exit 1
    fi
    if python3 - <<PY >/dev/null 2>&1
import urllib.request
urllib.request.urlopen('${URL}/api/config', timeout=1).read()
PY
    then
      echo " ready."
      break
    fi
    echo -n "."
    sleep 0.5
  done
fi

open_url() {
  local url="$1"
  if command -v wslview >/dev/null 2>&1; then
    wslview "$url" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
  elif command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /C start "" "$url" >/dev/null 2>&1 &
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Start-Process '$url'" >/dev/null 2>&1 &
  else
    return 1
  fi
}

if open_url "$URL"; then
  echo "[INFO] Opened dashboard: ${URL}"
else
  echo "[WARN] Could not auto-open a browser. Open this URL manually: ${URL}"
fi

echo
if [[ -n "${SERVER_PID:-}" ]]; then
  echo "[INFO] Server is running. Press Ctrl+C here to stop it."
  wait "$SERVER_PID"
else
  echo "[INFO] Existing server is being used. Press Ctrl+C to close this launcher."
  while true; do sleep 3600; done
fi
