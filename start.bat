@echo off
echo ==========================================================
echo Starting Software Development Document Environment (SDME)
echo ==========================================================

SET APP_JAR=target\sdm-1.0.0-SNAPSHOT.jar

IF NOT EXIST "%APP_JAR%" (
    echo JAR file not found. Executing build...
    call mvn clean package -DskipTests
)

echo Starting Spring Boot Application...
start "SDME Application" java -jar %APP_JAR%

echo SDME Application started successfully.
echo Access SDME Application at http://localhost:8080
