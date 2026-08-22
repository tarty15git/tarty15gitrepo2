-- Oracle DDL Schema for Software Development Document Environment (SDME)

CREATE TABLE app_users (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    email VARCHAR2(100),
    mobile_number VARCHAR2(20),
    full_name VARCHAR2(100),
    role VARCHAR2(20) NOT NULL,
    enabled NUMBER(1) DEFAULT 1 NOT NULL,
    locked NUMBER(1) DEFAULT 0 NOT NULL,
    failed_attempts NUMBER(3) DEFAULT 0,
    password_expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_config (
    config_key VARCHAR2(100) PRIMARY KEY,
    config_value VARCHAR2(1000) NOT NULL,
    description VARCHAR2(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    app_code VARCHAR2(3) NOT NULL UNIQUE,
    app_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sdm_phases (
    id NUMBER(19) PRIMARY KEY,
    phase_number NUMBER(3) NOT NULL UNIQUE,
    phase_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(255)
);

CREATE TABLE document_templates (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    template_code VARCHAR2(50) NOT NULL UNIQUE,
    document_title VARCHAR2(150) NOT NULL,
    phase_id NUMBER(19) NOT NULL,
    file_path VARCHAR2(500),
    version_number VARCHAR2(20) DEFAULT '1.0',
    description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tmpl_phase FOREIGN KEY (phase_id) REFERENCES sdm_phases(id)
);

CREATE TABLE sdm_documents (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doc_id_code VARCHAR2(50) NOT NULL UNIQUE,
    app_code VARCHAR2(3) NOT NULL,
    phase_id NUMBER(19) NOT NULL,
    template_id NUMBER(19),
    document_title VARCHAR2(150) NOT NULL,
    document_code VARCHAR2(50) NOT NULL,
    version_number VARCHAR2(20) DEFAULT '1.0',
    description VARCHAR2(500),
    file_path VARCHAR2(500) NOT NULL,
    file_type VARCHAR2(20),
    file_size NUMBER(19),
    status VARCHAR2(30) DEFAULT 'PEND' NOT NULL,
    maker_username VARCHAR2(50) NOT NULL,
    checker_username VARCHAR2(50),
    remarks VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_phase FOREIGN KEY (phase_id) REFERENCES sdm_phases(id)
);

CREATE TABLE approval_histories (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id NUMBER(19) NOT NULL,
    action VARCHAR2(30) NOT NULL,
    actor_username VARCHAR2(50) NOT NULL,
    remarks VARCHAR2(1000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appr_doc FOREIGN KEY (document_id) REFERENCES sdm_documents(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type VARCHAR2(50) NOT NULL,
    username VARCHAR2(50),
    details VARCHAR2(2000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_reviews (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id NUMBER(19) NOT NULL,
    agent_name VARCHAR2(50) NOT NULL,
    agent_role VARCHAR2(50) NOT NULL,
    output_text CLOB,
    score VARCHAR2(20),
    status VARCHAR2(30) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent_doc FOREIGN KEY (document_id) REFERENCES sdm_documents(id) ON DELETE CASCADE
);
