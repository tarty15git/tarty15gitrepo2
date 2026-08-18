#!/usr/bin/env bash
echo "=========================================================="
echo "Stopping Software Development Document Environment (SDME) "
echo "=========================================================="

if [ -f "sdme_app.pid" ]; then
    PID=$(cat sdme_app.pid)
    echo "Stopping process PID: $PID"
    kill "$PID" 2>/dev/null || true
    rm -f sdme_app.pid
    echo "SDME Application stopped."
else
    pkill -f "sdm-1.0.0-SNAPSHOT.jar" || true
    echo "Stop signal sent."
fi
