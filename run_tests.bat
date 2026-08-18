@echo off
echo ==========================================================
echo Executing JUnit Tests for SDME Platform
echo ==========================================================

call mvn test

IF %ERRORLEVEL% NEQ 0 (
    echo JUnit Test Suite Execution Failed!
    exit /b %ERRORLEVEL%
)

echo All JUnit Tests Executed and Passed Successfully!
