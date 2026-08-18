#!/usr/bin/env bash
echo "=========================================================="
echo "Starting Software Development Document Environment (SDME) "
echo "=========================================================="

APP_JAR="target/sdm-1.0.0-SNAPSHOT.jar"

if [ ! -f "$APP_JAR" ]; then
    echo "JAR file not found. Executing build..."
    mvn clean package -DskipTests
fi

echo "Starting Spring Boot Application..."
nohup java -jar "$APP_JAR" > sdme_app.log 2>&1 &
echo $! > sdme_app.pid

echo "SDME Application started successfully. PID: $(cat sdme_app.pid)"
echo "Access SDME Application at http://localhost:8080"
