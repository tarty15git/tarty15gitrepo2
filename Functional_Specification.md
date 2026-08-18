# Software Development Document Environment (SDME) Functional Specification

## 1. Executive Summary
The Software Development Document Environment (SDME) is an enterprise-grade document management and compliance platform engineered for financial and enterprise systems under the `com.cth.sdm` package umbrella. SDME standardizes deliverable management across 7 distinct Software Development Methodology (SDM) phases, enforces a Maker-Checker approval workflow with hard gate verification, and integrates local AI Document Processing (Docling + FAISS + Ollama) alongside a 4-Agent Anthropic pipeline.

---

## 2. System Architecture & Tech Stack
- **Backend:** Java 21 Spring Boot 3.2.4 (Spring Security, Spring Data JPA, Web, Actuator, OpenPDF, Apache POI, SpringDoc Swagger UI)
- **Database Engine:** Dynamic multi-database support for Oracle (default), PostgreSQL, and SQL Server via profile switching (`oracle`, `postgres`, `sqlserver`, `default`).
- **Local RAG Service:** Flask + Gunicorn + Blueprints, Docling document parser, FAISS vector index, Ollama LLM (`llama3.2:latest`) & embeddings (`nomic-embed-text`), SSE streaming chat with citations.
- **RAG Frontend:** React + Vite, responsive UI with real-time SSE stream processing.
- **SDME Web UI:** Responsive dashboard, password eye icon toggle, interactive 7-phase frame views, maker-checker approval controls, report downloads, and admin setup options.

---

## 3. Core Modules & Specifications

### 3.1 7 SDM Deliverable Phases
SDME categorizes all enterprise application deliverables into 7 mandatory methodology phases:
1. **Phase 1: Project Initiation & Requirements** (Project Charter, Business Requirements Document)
2. **Phase 2: System Analysis & Architecture Design** (Functional Specification, Solution Architecture Document)
3. **Phase 3: System Construction & Development** (Technical Design Document, Source Code Review Report)
4. **Phase 4: System Integration & Security Testing** (SIT Report, Security Vulnerability Scan Report)
5. **Phase 5: User Acceptance Testing (UAT)** (UAT Sign-off Matrix, Defect Summary Report)
6. **Phase 6: Deployment & Operational Readiness** (Production Deployment Guide, Operational Runbook)
7. **Phase 7: Maintenance & Post-Implementation Review** (Post-Implementation Review, SLA Handover)

Every submission requires a 3-character application tag (default `CTH`), a unique tagged Document ID (e.g., `CTH-P1-1024`), version control, document title, and document code.

### 3.2 Maker-Checker Workflow & Hard Gates
- **Maker Role:** Uploads deliverables for designated SDM phases.
- **Checker / Approver Role:** Inspects document contents, reviews AI agent findings, and issues hard gate sign-offs (APPROVE or REJECT) with required remarks.
- **Hard Gate Verification:** Enforces strict compliance checks on document format, maker identity, and version tagging.

### 3.3 Folder Watcher & Extensible Document Handlers
- Background directory watcher (`FolderWatcherService`) scans configurable drop folders (`WATCH_FOLDER`) every 5 seconds.
- Pluggable `DocumentHandler` architecture automatically picks up and processes Excel (`.xlsx`), Word (`.docx`), PowerPoint (`.pptx`), XML (`.xml`), and PDF (`.pdf`) documents.

### 3.4 Dual Authentication & Account Controls
- Configurable toggle between Local Database and LDAP Active Directory authentication (`AUTH_LDAP_ENABLED`).
- Full user lifecycle maintenance: account creation, account lock/unlock, password reset, password expiration (90 days default), and SMS/Email notification toggles.
- Password visibility toggle (eye icon) on the login interface.

### 3.5 Anthropic 4-Agent Pipeline
Enterprise AI delegation engine executing four sequential agents with state handoffs:
1. **Document Processor Agent:** Extracts structural metadata, completeness scores, and key sections.
2. **Result Drafter Agent:** Synthesizes findings and drafts preliminary sign-off recommendations.
3. **Reviewer Agent (Hard Gates):** Performs hard gate evaluation against compliance rules.
4. **Log Reviewer Agent:** Audits execution event logs to ensure zero system errors or anomalies.

### 3.6 Reporting & Analytics Engine
- Online interactive status table filtering by approval state (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`).
- One-click export to PDF (via OpenPDF) and Excel (via Apache POI).
