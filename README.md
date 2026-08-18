# Software Development Document Environment (SDME)

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen.svg)
![License](https://img.shields.io/badge/License-Proprietary-blue.svg)

**Software Development Document Environment (SDME)** is a unified enterprise platform designed to govern software development deliverables across **7 SDM methodology phases**. SDME combines dynamic multi-database compatibility, automated folder watching, maker-checker hard gate sign-offs, configurable dual authentication (LDAP / Local DB), an online interactive report generator, and an integrated **Anthropic 4-Agent Pipeline** along with a **Local RAG Service (Docling + FAISS + Ollama)**.

---

## Key Features

1. **7 SDM Deliverable Phases & Tagging:**
   - Visual webpage frames for all 7 phases matching standard SDM methodologies.
   - Tagged Document IDs (e.g. `CTH-P1-1024`), 3-character application code filtering (`CTH`), version control, and configurable descriptions.
2. **Maker-Checker Workflow & Hard Gates:**
   - Maker submission flow with Checker approval/rejection hard gates.
   - Live view of uploaded deliverable before Checker sign-off.
3. **Pluggable Folder Watcher:**
   - Auto-scan background service processing dropped `.xlsx`, `.docx`, `.pptx`, `.xml`, and `.pdf` files.
4. **Dual Authentication & Security Controls:**
   - Configurable LDAP Active Directory / DB toggle switch.
   - Eye icon password show/hide toggle on login screen.
   - User maintenance with lock, unlock, password reset, expiration, and SMS/Email toggle switches.
5. **Anthropic 4-Agent AI Pipeline:**
   - **Document Processor Agent:** Structural extraction and completeness scoring.
   - **Result Drafter Agent:** Synthesis and preliminary sign-off recommendation.
   - **Reviewer Agent (Hard Gates):** Rule compliance verification and sign-off hard gates.
   - **Log Reviewer Agent:** Process and log integrity auditor.
6. **Local RAG Service:**
   - Docling parser + FAISS vector index + Ollama LLM (`llama3.2:latest`) & embeddings (`nomic-embed-text`).
   - SSE streaming chat with citations and document recommendations.
7. **Cross-Platform Lifecycle Automation:**
   - Deployment scripts: `start.sh`, `start.bat`, `stop.sh`, `stop.bat`, `build.bat`, and `run_tests.bat`.

---

## Quick Setup & Execution

### Linux / macOS
```bash
chmod +x start.sh stop.sh
./start.sh
```

### Windows
```cmd
build.bat
run_tests.bat
start.bat
```

Access the SDME application at: `http://localhost:8080`

Default Credentials:
- **Admin:** `admin` / `Admin123!`
- **Maker:** `maker1` / `Maker123!`
- **Checker:** `checker1` / `Checker123!`

---

## Deliverable Documentation Included
- `Functional_Specification.docx` / `Functional_Specification.md`
- `Product_Paper.docx`
- `Walkthrough.pptx`
- `Installation_Instructions.md`
- `rag_service/API_DOCS.md`
