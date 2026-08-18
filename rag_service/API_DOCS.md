# SDME Local RAG Web Application API Documentation

## Overview
The SDME Local RAG Service provides document parsing (via Docling), vector indexing (via FAISS), and semantic SSE streaming chat with citations (via Ollama).

## Base Endpoint
`http://localhost:5000/api/rag`

## API Endpoints

### 1. Document Upload & Indexing
- **URL:** `/upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Document file (`.pdf`, `.docx`, `.pptx`, `.html`, `.txt`, `.xml`, `.xlsx`)

### 2. Vector Index Status
- **URL:** `/index/status`
- **Method:** `GET`

### 3. SSE Streaming Chat with Citations
- **URL:** `/chat`
- **Method:** `POST`

### 4. AI Document Recommendations
- **URL:** `/recommendations/<filename>`
- **Method:** `GET`
