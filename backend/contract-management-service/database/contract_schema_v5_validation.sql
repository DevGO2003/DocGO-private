-- Contract Service Database Schema v5 - Enhanced Validation
-- This schema includes validation constraints and business rules

USE docgo_contract_service;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS contract_attachments;
DROP TABLE IF EXISTS contract_events;
DROP TABLE IF EXISTS contract_parties;
DROP TABLE IF EXISTS contract_summaries;
DROP TABLE IF EXISTS contract_payment_details;
DROP TABLE IF EXISTS contract_risk_assessments;
DROP TABLE IF EXISTS contract_compliance_statuses;
DROP TABLE IF EXISTS contracts;

-- Create contracts table with enhanced validation
CREATE TABLE contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    
    -- Contract details
    contract_type ENUM('SERVICE', 'PURCHASE', 'SALES', 'PARTNERSHIP', 'EMPLOYMENT', 'LICENSING', 'FRANCHISE', 'JOINT_VENTURE', 'OTHER') NOT NULL,
    contract_object TEXT,
    effective_date VARCHAR(100),
    contract_term VARCHAR(100),
    
    -- Financial information
    total_value DECIMAL(15,2),
    currency ENUM('VND', 'USD', 'EUR', 'JPY', 'CNY', 'KRW') DEFAULT 'VND',
    payment_method VARCHAR(100),
    payment_schedule TEXT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Risk and compliance
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    risk_assessment TEXT,
    compliance_status VARCHAR(100),
    legal_review_required BOOLEAN DEFAULT FALSE,
    review_deadline DATE,
    
    -- AI processing
    ai_processed BOOLEAN DEFAULT FALSE,
    processing_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    
    -- Content analysis
    summary TEXT,
    key_terms JSON,
    favorable_clauses JSON,
    unfavorable_clauses JSON,
    termination_conditions TEXT,
    reminders JSON,
    tags JSON,
    
    -- Parties information (JSON for flexibility)
    parties_json JSON,
    
    -- System fields
    system_id VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by VARCHAR(100) DEFAULT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Validation constraints
    CONSTRAINT chk_start_date_future CHECK (start_date >= CURDATE()),
    CONSTRAINT chk_end_date_after_start CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_total_value_positive CHECK (total_value IS NULL OR total_value > 0),
    CONSTRAINT chk_review_deadline_future CHECK (review_deadline IS NULL OR review_deadline >= CURDATE()),
    CONSTRAINT chk_contract_number_format CHECK (contract_number REGEXP '^[A-Z]{2,4}-[0-9]{4}-[0-9]{6}$')
);

-- Create contract_events table
CREATE TABLE contract_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    event_type ENUM('CREATE', 'UPDATE', 'STATUS_CHANGE', 'ATTACHMENT_ADD', 'ATTACHMENT_REMOVE', 'SOFT_DELETE', 'RESTORE', 'AI_PROCESSING', 'LEGAL_REVIEW') NOT NULL,
    event_data JSON,
    actor VARCHAR(255) NOT NULL,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    
    CONSTRAINT fk_event_contract FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_attachments table
CREATE TABLE contract_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    file_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by VARCHAR(100) DEFAULT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_contract_attachment_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_parties table for normalized party data
CREATE TABLE contract_parties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    party_role ENUM('BUYER', 'SELLER', 'PROVIDER', 'CUSTOMER', 'PARTNER', 'EMPLOYER', 'EMPLOYEE', 'LICENSOR', 'LICENSEE', 'FRANCHISOR', 'FRANCHISEE', 'OTHER') NOT NULL,
    representative VARCHAR(255),
    tax_code VARCHAR(50),
    contact VARCHAR(255),
    address TEXT,
    business_license VARCHAR(100),
    party_type ENUM('INDIVIDUAL', 'COMPANY', 'ORGANIZATION') DEFAULT 'COMPANY',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_contract_party_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_contact_email CHECK (contact IS NULL OR contact REGEXP '^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$')
);

-- Create contract_summaries table
CREATE TABLE contract_summaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    summary_type ENUM('EXECUTIVE', 'LEGAL', 'FINANCIAL', 'OPERATIONAL', 'RISK', 'COMPLIANCE') NOT NULL,
    summary_content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    ai_model_version VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_contract_summary_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Create contract_payment_details table
CREATE TABLE contract_payment_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    payment_type ENUM('ADVANCE', 'INSTALLMENT', 'MILESTONE', 'FINAL', 'PENALTY', 'BONUS') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency ENUM('VND', 'USD', 'EUR', 'JPY', 'CNY', 'KRW') DEFAULT 'VND',
    due_date DATE,
    payment_method VARCHAR(100),
    status ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_contract_payment_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_payment_amount_positive CHECK (amount > 0)
);

-- Create contract_risk_assessments table
CREATE TABLE contract_risk_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    risk_category ENUM('LEGAL', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'TECHNICAL', 'REPUTATIONAL') NOT NULL,
    risk_description TEXT NOT NULL,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    mitigation_strategy TEXT,
    assigned_to VARCHAR(100),
    due_date DATE,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_contract_risk_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_compliance_statuses table
CREATE TABLE contract_compliance_statuses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    compliance_requirement VARCHAR(255) NOT NULL,
    requirement_type ENUM('REGULATORY', 'INDUSTRY', 'INTERNAL', 'CONTRACTUAL') NOT NULL,
    compliance_status ENUM('COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW', 'UNDER_INVESTIGATION') NOT NULL,
    review_date DATE,
    reviewer VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_contract_compliance_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_start_date ON contracts(start_date);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);
CREATE INDEX idx_contracts_created_by ON contracts(created_by);
CREATE INDEX idx_contracts_is_deleted ON contracts(is_deleted);
CREATE INDEX idx_contracts_ai_processed ON contracts(ai_processed);
CREATE INDEX idx_contracts_risk_level ON contracts(risk_level);
CREATE INDEX idx_contracts_legal_review_required ON contracts(legal_review_required);

CREATE INDEX idx_contract_events_contract_id ON contract_events(contract_id);
CREATE INDEX idx_contract_events_event_type ON contract_events(event_type);
CREATE INDEX idx_contract_events_event_time ON contract_events(event_time);

CREATE INDEX idx_contract_attachments_contract_id ON contract_attachments(contract_id);
CREATE INDEX idx_contract_attachments_file_id ON contract_attachments(file_id);

CREATE INDEX idx_contract_parties_contract_id ON contract_parties(contract_id);
CREATE INDEX idx_contract_parties_party_role ON contract_parties(party_role);
CREATE INDEX idx_contract_parties_is_primary ON contract_parties(is_primary);

CREATE INDEX idx_contract_summaries_contract_id ON contract_summaries(contract_id);
CREATE INDEX idx_contract_summaries_summary_type ON contract_summaries(summary_type);

CREATE INDEX idx_contract_payments_contract_id ON contract_payments(contract_id);
CREATE INDEX idx_contract_payments_due_date ON contract_payments(due_date);
CREATE INDEX idx_contract_payments_status ON contract_payments(status);

CREATE INDEX idx_contract_risks_contract_id ON contract_risks(contract_id);
CREATE INDEX idx_contract_risks_risk_level ON contract_risks(risk_level);
CREATE INDEX idx_contract_risks_status ON contract_risks(status);

CREATE INDEX idx_contract_compliance_contract_id ON contract_compliance_statuses(contract_id);
CREATE INDEX idx_contract_compliance_status ON contract_compliance_statuses(compliance_status);

-- Insert sample data for testing
INSERT INTO contracts (
    contract_number, title, status, contract_type, contract_object,
    start_date, end_date, total_value, currency, risk_level,
    created_by, parties_json
) VALUES (
    'HD-2024-000001',
    'Hợp đồng cung cấp dịch vụ ERP LINK',
    'ACTIVE',
    'SERVICE',
    'Cung cấp dịch vụ ERP và tư vấn chuyển đổi số',
    '2024-01-01',
    '2024-12-31',
    500000000.00,
    'VND',
    'MEDIUM',
    'system',
    '{"parties": [{"name": "ERP LINK", "role": "PROVIDER"}, {"name": "DocGO", "role": "CUSTOMER"}]}'
);

-- Grant permissions
GRANT ALL PRIVILEGES ON docgo_contract_service.* TO 'docgo_user'@'%';
FLUSH PRIVILEGES;
