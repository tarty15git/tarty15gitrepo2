-- PostgreSQL DDL Schema for Software Development Document Environment (SDME)

CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    mobile_number VARCHAR(20),
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    locked BOOLEAN DEFAULT FALSE NOT NULL,
    failed_attempts INT DEFAULT 0,
    password_expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(1000) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    app_code VARCHAR(3) NOT NULL UNIQUE,
    app_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sdm_phases (
    id BIGINT PRIMARY KEY,
    phase_number INT NOT NULL UNIQUE,
    phase_name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS document_templates (
    id BIGSERIAL PRIMARY KEY,
    template_code VARCHAR(50) NOT NULL UNIQUE,
    document_title VARCHAR(150) NOT NULL,
    phase_id BIGINT NOT NULL REFERENCES sdm_phases(id),
    file_path VARCHAR(500),
    version_number VARCHAR(20) DEFAULT '1.0',
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sdm_documents (
    id BIGSERIAL PRIMARY KEY,
    doc_id_code VARCHAR(50) NOT NULL UNIQUE,
    app_code VARCHAR(3) NOT NULL,
    phase_id BIGINT NOT NULL REFERENCES sdm_phases(id),
    template_id BIGINT,
    document_title VARCHAR(150) NOT NULL,
    document_code VARCHAR(50) NOT NULL,
    version_number VARCHAR(20) DEFAULT '1.0',
    description VARCHAR(500),
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(20),
    file_size BIGINT,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL' NOT NULL,
    maker_username VARCHAR(50) NOT NULL,
    checker_username VARCHAR(50),
    remarks VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_histories (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES sdm_documents(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL,
    actor_username VARCHAR(50) NOT NULL,
    remarks VARCHAR(1000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    username VARCHAR(50),
    details VARCHAR(2000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_reviews (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES sdm_documents(id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    agent_role VARCHAR(50) NOT NULL,
    output_text TEXT,
    score VARCHAR(20),
    status VARCHAR(30) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
