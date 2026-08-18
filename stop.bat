@echo off
echo ==========================================================
echo Stopping Software Development Document Environment (SDME)
echo ==========================================================

taskkill /FI "WINDOWTITLE eq SDME Application*" /F 2>NUL
pkill -f "sdm-1.0.0-SNAPSHOT.jar" 2>NUL

echo SDME Application stop signal completed.
