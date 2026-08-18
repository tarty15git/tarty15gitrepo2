@echo off
echo ==========================================================
echo Building Software Development Document Environment (SDME)
echo ==========================================================

call mvn clean package -DskipTests=false

IF %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b %ERRORLEVEL%
)

echo Build completed successfully. Artifact packaged at target\sdm-1.0.0-SNAPSHOT.jar
