-- SQL Server DDL Schema for Software Development Document Environment (SDME)

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'app_users')
BEGIN
    CREATE TABLE app_users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        mobile_number VARCHAR(20),
        full_name VARCHAR(100),
        role VARCHAR(20) NOT NULL,
        enabled BIT DEFAULT 1 NOT NULL,
        locked BIT DEFAULT 0 NOT NULL,
        failed_attempts INT DEFAULT 0,
        password_expiry_date DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'system_config')
BEGIN
    CREATE TABLE system_config (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value VARCHAR(1000) NOT NULL,
        description VARCHAR(255),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'applications')
BEGIN
    CREATE TABLE applications (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        app_code VARCHAR(3) NOT NULL UNIQUE,
        app_name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        created_at DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sdm_phases')
BEGIN
    CREATE TABLE sdm_phases (
        id BIGINT PRIMARY KEY,
        phase_number INT NOT NULL UNIQUE,
        phase_name VARCHAR(100) NOT NULL,
        description VARCHAR(255)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'document_templates')
BEGIN
    CREATE TABLE document_templates (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        template_code VARCHAR(50) NOT NULL UNIQUE,
        document_title VARCHAR(150) NOT NULL,
        phase_id BIGINT NOT NULL FOREIGN KEY REFERENCES sdm_phases(id),
        file_path VARCHAR(500),
        version_number VARCHAR(20) DEFAULT '1.0',
        description VARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sdm_documents')
BEGIN
    CREATE TABLE sdm_documents (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        doc_id_code VARCHAR(50) NOT NULL UNIQUE,
        app_code VARCHAR(3) NOT NULL,
        phase_id BIGINT NOT NULL FOREIGN KEY REFERENCES sdm_phases(id),
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
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'approval_histories')
BEGIN
    CREATE TABLE approval_histories (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        document_id BIGINT NOT NULL FOREIGN KEY REFERENCES sdm_documents(id) ON DELETE CASCADE,
        action VARCHAR(30) NOT NULL,
        actor_username VARCHAR(50) NOT NULL,
        remarks VARCHAR(1000),
        timestamp DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs')
BEGIN
    CREATE TABLE audit_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        username VARCHAR(50),
        details VARCHAR(2000),
        timestamp DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'agent_reviews')
BEGIN
    CREATE TABLE agent_reviews (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        document_id BIGINT NOT NULL FOREIGN KEY REFERENCES sdm_documents(id) ON DELETE CASCADE,
        agent_name VARCHAR(50) NOT NULL,
        agent_role VARCHAR(50) NOT NULL,
        output_text VARCHAR(MAX),
        score VARCHAR(20),
        status VARCHAR(30) NOT NULL,
        timestamp DATETIME2 DEFAULT GETDATE()
    );
END
