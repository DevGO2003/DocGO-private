-- Cập nhật bảng contracts để thêm các trường mới
ALTER TABLE contracts 
ADD COLUMN summary TEXT COMMENT 'Tóm tắt hợp đồng',
ADD COLUMN contract_type VARCHAR(100) COMMENT 'Loại hợp đồng',
ADD COLUMN risk_level VARCHAR(50) COMMENT 'Mức độ rủi ro',
ADD COLUMN key_terms TEXT COMMENT 'Điều khoản chính',
ADD COLUMN ai_processed BOOLEAN DEFAULT FALSE COMMENT 'Đã xử lý AI',
ADD COLUMN processing_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING' COMMENT 'Trạng thái xử lý';

-- Tạo bảng uploaded_files
CREATE TABLE IF NOT EXISTS uploaded_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL COMMENT 'Tên file gốc',
    stored_filename VARCHAR(255) NOT NULL COMMENT 'Tên file đã lưu',
    file_path VARCHAR(500) NOT NULL COMMENT 'Đường dẫn file',
    file_size BIGINT COMMENT 'Kích thước file (bytes)',
    content_type VARCHAR(100) COMMENT 'Loại nội dung',
    file_extension VARCHAR(20) COMMENT 'Phần mở rộng file',
    upload_date DATETIME NOT NULL COMMENT 'Ngày upload',
    is_contract BOOLEAN DEFAULT FALSE COMMENT 'Có phải hợp đồng không',
    contract_id BIGINT COMMENT 'ID hợp đồng liên quan',
    processing_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING' COMMENT 'Trạng thái xử lý',
    ai_processing_result TEXT COMMENT 'Kết quả xử lý AI',
    error_message TEXT COMMENT 'Thông báo lỗi',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_contract_id (contract_id),
    INDEX idx_processing_status (processing_status),
    INDEX idx_is_contract (is_contract),
    INDEX idx_upload_date (upload_date)
) COMMENT 'Bảng lưu trữ thông tin file upload';

-- Thêm foreign key constraint
ALTER TABLE uploaded_files 
ADD CONSTRAINT fk_uploaded_files_contract 
FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL;

-- Cập nhật dữ liệu mẫu nếu cần
UPDATE contracts SET 
    summary = 'Hợp đồng mẫu cho hệ thống DocGO',
    contract_type = 'Hợp đồng dịch vụ',
    risk_level = 'THẤP',
    key_terms = 'Điều khoản chính của hợp đồng',
    ai_processed = FALSE,
    processing_status = 'PENDING'
WHERE summary IS NULL;
