-- Contract Service Database Schema v6 - Enhanced for API Response Format
-- This schema supports the required response structure with nested objects

USE docgo_contract_service;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS contract_attachments;
DROP TABLE IF EXISTS contract_events;
DROP TABLE IF EXISTS contract_parties;
DROP TABLE IF EXISTS contract_summaries;
DROP TABLE IF EXISTS contract_payment_details;
DROP TABLE IF EXISTS contract_risk_assessments;
DROP TABLE IF EXISTS contract_compliance_statuses;
DROP TABLE IF EXISTS contract_key_terms;
DROP TABLE IF EXISTS contract_favorable_clauses;
DROP TABLE IF EXISTS contract_unfavorable_clauses;
DROP TABLE IF EXISTS contracts;

-- Create contracts table with enhanced structure
CREATE TABLE contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    
    -- Contract details
    contract_type ENUM('SERVICE', 'PURCHASE', 'SALES', 'PARTNERSHIP', 'EMPLOYMENT', 'LICENSING', 'FRANCHISE', 'JOINT_VENTURE', 'SERVICE_AGREEMENT', 'OTHER') NOT NULL,
    contract_object TEXT,
    effective_date VARCHAR(200),
    contract_term VARCHAR(300),
    
    -- Risk and compliance
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    risk_assessment JSON,
    compliance_status JSON,
    
    -- AI processing
    ai_processed BOOLEAN DEFAULT FALSE,
    processing_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    
    -- System fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by VARCHAR(100) DEFAULT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Validation constraints
    CONSTRAINT chk_contract_number_format CHECK (contract_number REGEXP '^[A-Z0-9-]+$')
);

-- Create contract_key_terms table
CREATE TABLE contract_key_terms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_key_terms_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_favorable_clauses table
CREATE TABLE contract_favorable_clauses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_favorable_clauses_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_unfavorable_clauses table
CREATE TABLE contract_unfavorable_clauses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_unfavorable_clauses_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_payment_details table
CREATE TABLE contract_payment_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    total_value VARCHAR(200),
    schedule TEXT,
    currency ENUM('VND', 'USD', 'EUR', 'JPY', 'CNY', 'KRW') DEFAULT 'VND',
    method VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_termination_conditions table
CREATE TABLE contract_termination_conditions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    conditions TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_termination_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
);

-- Create contract_parties table
CREATE TABLE contract_parties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    role VARCHAR(200) NOT NULL,
    name VARCHAR(255),
    representative VARCHAR(255),
    tax_code VARCHAR(50),
    contact VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_parties_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE CASCADE
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
    
    CONSTRAINT fk_event_contract
        FOREIGN KEY (contract_id)
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

-- Create indexes for performance
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_contract_type ON contracts(contract_type);
CREATE INDEX idx_contracts_risk_level ON contracts(risk_level);
CREATE INDEX idx_contracts_created_by ON contracts(created_by);
CREATE INDEX idx_contracts_is_deleted ON contracts(is_deleted);
CREATE INDEX idx_contracts_ai_processed ON contracts(ai_processed);

CREATE INDEX idx_key_terms_contract_id ON contract_key_terms(contract_id);
CREATE INDEX idx_favorable_clauses_contract_id ON contract_favorable_clauses(contract_id);
CREATE INDEX idx_unfavorable_clauses_contract_id ON contract_unfavorable_clauses(contract_id);
CREATE INDEX idx_payment_contract_id ON contract_payment_details(contract_id);
CREATE INDEX idx_termination_contract_id ON contract_termination_conditions(contract_id);
CREATE INDEX idx_parties_contract_id ON contract_parties(contract_id);
CREATE INDEX idx_events_contract_id ON contract_events(contract_id);
CREATE INDEX idx_attachments_contract_id ON contract_attachments(contract_id);

-- Insert sample data for testing
INSERT INTO contracts (
    contract_number, title, status, contract_type, contract_object,
    effective_date, contract_term, risk_level, created_by
) VALUES (
    'CONTRACT-1756544169688',
    'Hợp đồng Cung cấp Bản quyền Phần mềm Quản lý Liên thông Thuốc Cơ sở Bán buôn',
    'DRAFT',
    'SERVICE_AGREEMENT',
    'Hợp đồng cung cấp bản quyền phần mềm quản lý liên thông thuốc cơ sở bán buôn PhanmemGDP.com.',
    'Ngày ký hợp đồng năm 2024',
    '6 năm, tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí cho đến khi hai bên thỏa thuận chấm dứt.',
    'MEDIUM',
    'system'
);

-- Insert key terms
INSERT INTO contract_key_terms (contract_id, name, description, source) VALUES
(1, 'Nội dung hợp tác', 'Bên B cung cấp phần mềm PhanmemGDP.com, Bên A đồng ý sử dụng và cho phép thu thập thông tin cá nhân để tạo tài khoản.', 'Điều 1'),
(1, 'Tính năng chính', 'Phần mềm có các tính năng chính như quản lý hàng hóa, nhà cung cấp, khách hàng, tạo báo cáo và kết nối liên thông với cơ sở dữ liệu Dược Quốc gia.', 'Điều 2'),
(1, 'Quyền và Trách nhiệm', 'Bên A được sử dụng hợp pháp phần mềm và chịu trách nhiệm về dữ liệu. Bên B chịu trách nhiệm bảo trì hệ thống, hỗ trợ kỹ thuật và bảo mật dữ liệu.', 'Điều 5 & 6'),
(1, 'Thanh toán', 'Bên A thanh toán 100% giá trị hợp đồng bằng tiền mặt hoặc chuyển khoản sau khi ký biên bản nghiệm thu.', 'Điều 7'),
(1, 'Giải quyết tranh chấp', 'Mọi tranh chấp sẽ được giải quyết thông qua thương lượng, nếu không thành công sẽ đưa ra Tòa án có thẩm quyền.', 'Điều 10');

-- Insert favorable clauses
INSERT INTO contract_favorable_clauses (contract_id, name, description, source) VALUES
(1, 'Tự động gia hạn không phí', 'Hợp đồng có hiệu lực 6 năm và sẽ tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí gia hạn.', ''),
(1, 'Nâng cấp miễn phí', 'Việc nâng cấp các tính năng phần mềm theo yêu cầu pháp lý của Cục quản lý Dược là hoàn toàn miễn phí.', ''),
(1, 'Miễn trách nhiệm hoàn tiền', 'Bên B không phải chịu trách nhiệm hoàn tiền cho Bên A trong bất kỳ trường hợp chấm dứt hợp đồng nào, ngoại trừ trường hợp Bên B vi phạm trách nhiệm của mình.', ''),
(1, 'Quyền công bố thông tin khách hàng', 'Bên B có quyền công bố và sử dụng thông tin việc Bên A là khách hàng đang sử dụng bản quyền phần mềm của mình.', '');

-- Insert unfavorable clauses
INSERT INTO contract_unfavorable_clauses (contract_id, name, description, source) VALUES
(1, 'Tự động gia hạn', 'Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo, điều này có thể khiến Bên A khó chấm dứt hợp đồng nếu không muốn tiếp tục sử dụng dịch vụ.', ''),
(1, 'Phí phát sinh không giới hạn', 'Hợp đồng quy định Bên A phải trả thêm phí 500.000 đồng/năm cho mỗi 500 hóa đơn vượt quá hạn mức 7.000 hóa đơn, mà không có giới hạn tối đa cho khoản phí này.', ''),
(1, 'Miễn trách nhiệm hoàn tiền', 'Bên B không phải hoàn trả số tiền đã thu trong bất kỳ trường hợp chấm dứt hợp đồng nào, trừ khi Bên B vi phạm các trách nhiệm được quy định.', '');

-- Insert payment details
INSERT INTO contract_payment_details (contract_id, total_value, schedule, currency, method) VALUES
(1, '4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)', 'Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu.', 'VND', 'CASH_OR_BANK_TRANSFER');

-- Insert termination conditions
INSERT INTO contract_termination_conditions (contract_id, conditions) VALUES
(1, 'Hợp đồng có thể bị chấm dứt trước thời hạn nếu các bên thỏa thuận, xảy ra sự kiện bất khả kháng, một trong các bên bị phá sản/giải thể, hoặc một bên vi phạm nghiêm trọng nghĩa vụ thanh toán.');

-- Insert parties
INSERT INTO contract_parties (contract_id, role, name, representative, tax_code, contact, address) VALUES
(1, 'Bên sử dụng dịch vụ (Bên A)', NULL, NULL, NULL, NULL, ''),
(1, 'Bên cung cấp dịch vụ (Bên B)', 'Công ty Cổ phần Phát triển Phần mềm Giải pháp Phân phối Dược và Nhà thuốc', 'Ông Nguyễn Văn Dũng, Giám đốc', '0109889002', '0983.456.455', '');

-- Insert risk assessment (JSON)
UPDATE contracts SET risk_assessment = '{
  "riskLevel": "MEDIUM",
  "riskFactors": [
    "Tự động gia hạn",
    "Phí phát sinh không giới hạn",
    "Miễn trách nhiệm hoàn tiền"
  ],
  "mitigationMeasures": [
    "Theo dõi thời hạn gia hạn",
    "Giám sát số lượng hóa đơn để tránh phí phát sinh",
    "Đàm phán lại điều khoản hoàn tiền nếu cần"
  ]
}' WHERE id = 1;

-- Insert compliance status (JSON)
UPDATE contracts SET compliance_status = '{
  "status": "COMPLIANT",
  "issues": [],
  "recommendations": []
}' WHERE id = 1;

-- Grant permissions
GRANT ALL PRIVILEGES ON docgo_contract_service.* TO 'docgo_user'@'%';
FLUSH PRIVILEGES;
