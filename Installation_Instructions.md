# Installation Instructions & Setup Guide

## System Prerequisites
- Java 21 JDK or higher
- Apache Maven 3.9+
- Python 3.10+
- Node.js 18+ / npm (for frontend Vite build)
- Docker & Docker Compose (optional for containerized RAG service)

---

## 1. Quick Start - Linux & macOS
To launch the SDME platform:
```bash
# Make scripts executable
chmod +x start.sh stop.sh

# Run startup script
./start.sh
```
To stop the application:
```bash
./stop.sh
```

---

## 2. Quick Start - Windows
To build and start on Windows:
```cmd
:: Build the project
build.bat

:: Execute JUnit test suite
run_tests.bat

:: Start the application
start.bat

:: Stop the application
stop.bat
```

---

## 3. Database Switcher Configuration
SDME supports Oracle (default), PostgreSQL, and SQL Server.
To switch databases, set `SPRING_PROFILES_ACTIVE`:
- **Oracle:** `export SPRING_PROFILES_ACTIVE=oracle`
- **PostgreSQL:** `export SPRING_PROFILES_ACTIVE=postgres`
- **SQL Server:** `export SPRING_PROFILES_ACTIVE=sqlserver`

DDL Schema scripts are located under `src/main/resources/db/`:
- `oracle_schema.sql`
- `postgres_schema.sql`
- `sqlserver_schema.sql`

---

## 4. Local RAG Service Setup
```bash
cd rag_service
docker-compose up -d
```
Or run manually:
```bash
cd rag_service/backend
pip install -r requirements.txt
python app.py
```
And frontend:
```bash
cd rag_service/frontend
npm install
npm run dev
```
