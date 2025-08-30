-- Cập nhật schema bảng contracts để phù hợp với cấu trúc response mới
-- Phiên bản 4.0 - Cập nhật ngày: 2025-08-30
-- Đồng bộ với cấu trúc response mới: keyTerms, favorableClauses, unfavorableClauses

USE docgo_contract_service;

-- 1. Cập nhật bảng contracts để thêm các trường mới cho cấu trúc response
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS key_terms JSON COMMENT 'Key terms với cấu trúc {name, description, source}',
ADD COLUMN IF NOT EXISTS favorable_clauses JSON COMMENT 'Favorable clauses với cấu trúc {name, description, source}',
ADD COLUMN IF NOT EXISTS unfavorable_clauses JSON COMMENT 'Unfavorable clauses với cấu trúc {name, description, source}',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) COMMENT 'Phương thức thanh toán',
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'VND' COMMENT 'Đơn vị tiền tệ thanh toán';

-- 2. Cập nhật bảng contract_parties để thêm các trường mới
ALTER TABLE contract_parties
ADD COLUMN IF NOT EXISTS contact VARCHAR(255) COMMENT 'Thông tin liên hệ (email, phone)';

-- 3. Tạo bảng mới để lưu thông tin thanh toán theo cấu trúc mới
CREATE TABLE IF NOT EXISTS contract_payment_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    total_value VARCHAR(255) COMMENT 'Tổng giá trị hợp đồng',
    schedule TEXT COMMENT 'Lịch trình thanh toán',
    currency VARCHAR(10) DEFAULT 'VND' COMMENT 'Đơn vị tiền tệ',
    method VARCHAR(100) COMMENT 'Phương thức thanh toán',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract_id (contract_id)
) COMMENT 'Bảng lưu thông tin thanh toán theo cấu trúc response mới';

-- 4. Tạo bảng mới để lưu thông tin đánh giá rủi ro theo cấu trúc mới
CREATE TABLE IF NOT EXISTS contract_risk_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    risk_level VARCHAR(20) COMMENT 'Mức độ rủi ro (LOW/MEDIUM/HIGH)',
    risk_factors JSON COMMENT 'Các yếu tố rủi ro',
    mitigation_measures JSON COMMENT 'Biện pháp giảm thiểu rủi ro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract_id (contract_id)
) COMMENT 'Bảng lưu thông tin đánh giá rủi ro theo cấu trúc response mới';

-- 5. Tạo bảng mới để lưu thông tin tuân thủ theo cấu trúc mới
CREATE TABLE IF NOT EXISTS contract_compliance_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    status VARCHAR(50) COMMENT 'Trạng thái tuân thủ',
    issues JSON COMMENT 'Các vấn đề tuân thủ',
    recommendations JSON COMMENT 'Khuyến nghị tuân thủ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract_id (contract_id)
) COMMENT 'Bảng lưu thông tin tuân thủ theo cấu trúc response mới';

-- 6. Cập nhật dữ liệu mẫu cho contracts với cấu trúc mới
UPDATE contracts SET
    key_terms = JSON_ARRAY(
        JSON_OBJECT('name', 'Nội dung hợp tác', 'description', 'Bên B cung cấp phần mềm PhanmemGDP.com, Bên A đồng ý sử dụng và cho phép thu thập thông tin cá nhân để tạo tài khoản.', 'source', 'Điều 1'),
        JSON_OBJECT('name', 'Tính năng chính', 'description', 'Phần mềm có các tính năng chính như quản lý hàng hóa, nhà cung cấp, khách hàng, tạo báo cáo và kết nối liên thông với cơ sở dữ liệu Dược Quốc gia.', 'source', 'Điều 2'),
        JSON_OBJECT('name', 'Quyền và Trách nhiệm', 'description', 'Bên A được sử dụng hợp pháp phần mềm và chịu trách nhiệm về dữ liệu. Bên B chịu trách nhiệm bảo trì hệ thống, hỗ trợ kỹ thuật và bảo mật dữ liệu.', 'source', 'Điều 5 & 6'),
        JSON_OBJECT('name', 'Thanh toán', 'description', 'Bên A thanh toán 100% giá trị hợp đồng bằng tiền mặt hoặc chuyển khoản sau khi ký biên bản nghiệm thu.', 'source', 'Điều 7'),
        JSON_OBJECT('name', 'Giải quyết tranh chấp', 'description', 'Mọi tranh chấp sẽ được giải quyết thông qua thương lượng, nếu không thành công sẽ đưa ra Tòa án có thẩm quyền.', 'source', 'Điều 10')
    ),
    favorable_clauses = JSON_ARRAY(
        JSON_OBJECT('name', 'Tự động gia hạn không phí', 'description', 'Hợp đồng có hiệu lực 6 năm và sẽ tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí gia hạn.', 'source', ''),
        JSON_OBJECT('name', 'Nâng cấp miễn phí', 'description', 'Việc nâng cấp các tính năng phần mềm theo yêu cầu pháp lý của Cục quản lý Dược là hoàn toàn miễn phí.', 'source', ''),
        JSON_OBJECT('name', 'Miễn trách nhiệm hoàn tiền', 'description', 'Bên B không phải chịu trách nhiệm hoàn tiền cho Bên A trong bất kỳ trường hợp chấm dứt hợp đồng nào, ngoại trừ trường hợp Bên B vi phạm trách nhiệm của mình.', 'source', ''),
        JSON_OBJECT('name', 'Quyền công bố thông tin khách hàng', 'description', 'Bên B có quyền công bố và sử dụng thông tin việc Bên A là khách hàng đang sử dụng bản quyền phần mềm của mình.', 'source', '')
    ),
    unfavorable_clauses = JSON_ARRAY(
        JSON_OBJECT('name', 'Tự động gia hạn', 'description', 'Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo, điều này có thể khiến Bên A khó chấm dứt hợp đồng nếu không muốn tiếp tục sử dụng dịch vụ.', 'source', ''),
        JSON_OBJECT('name', 'Phí phát sinh không giới hạn', 'description', 'Hợp đồng quy định Bên A phải trả thêm phí 500.000 đồng/năm cho mỗi 500 hóa đơn vượt quá hạn mức 7.000 hóa đơn, mà không có giới hạn tối đa cho khoản phí này.', 'source', ''),
        JSON_OBJECT('name', 'Quyền chấm dứt một chiều', 'description', 'Bên B có quyền chấm dứt hợp đồng ngay lập tức nếu Bên A vi phạm bất kỳ điều khoản nào, trong khi Bên A phải tuân thủ thủ tục chấm dứt phức tạp.', 'source', ''),
        JSON_OBJECT('name', 'Giới hạn trách nhiệm', 'description', 'Bên B giới hạn trách nhiệm của mình ở mức thấp nhất có thể, ngay cả trong trường hợp lỗi nghiêm trọng từ phía Bên B.', 'source', '')
    ),
    payment_method = 'Chuyển khoản/Tiền mặt',
    payment_currency = 'VND'
WHERE id = 1;

-- 7. Thêm dữ liệu mẫu cho contract_payment_details
INSERT INTO contract_payment_details (contract_id, total_value, schedule, currency, method) VALUES
(1, '4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)', 'Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu.', 'VND', 'Chuyển khoản/Tiền mặt');

-- 8. Thêm dữ liệu mẫu cho contract_risk_assessments
INSERT INTO contract_risk_assessments (contract_id, risk_level, risk_factors, mitigation_measures) VALUES
(1, 'MEDIUM', 
    JSON_ARRAY('Tự động gia hạn không thông báo', 'Phí phát sinh không giới hạn', 'Quyền chấm dứt một chiều'),
    JSON_ARRAY('Thêm điều khoản thông báo trước khi gia hạn', 'Giới hạn phí phát sinh tối đa', 'Cân bằng quyền chấm dứt hợp đồng')
);

-- 9. Thêm dữ liệu mẫu cho contract_compliance_status
INSERT INTO contract_compliance_status (contract_id, status, issues, recommendations) VALUES
(1, 'PENDING_REVIEW',
    JSON_ARRAY('Cần rà soát điều khoản tự động gia hạn', 'Cần làm rõ giới hạn phí phát sinh', 'Cần cân bằng quyền và nghĩa vụ các bên'),
    JSON_ARRAY('Thêm điều khoản thông báo trước khi gia hạn', 'Quy định rõ giới hạn phí phát sinh', 'Điều chỉnh quyền chấm dứt hợp đồng')
);

-- 10. Cập nhật dữ liệu mẫu cho contract_parties với thông tin đầy đủ
UPDATE contract_parties SET
    contact = '0983.456.455'
WHERE contract_id = 1 AND party_role = 'Bên cung cấp dịch vụ (Bên B)';

-- 11. Thêm dữ liệu mẫu cho contract_parties với thông tin đầy đủ
INSERT INTO contract_parties (contract_id, party_name, party_role, representative, tax_code, contact, address, is_primary) VALUES
(1, 'Công ty TNHH ABC', 'Bên sử dụng dịch vụ (Bên A)', 'Ông Nguyễn Văn A, Giám đốc', '0123456789', '0901.234.567', '123 Đường ABC, Quận 1, TP.HCM', FALSE)
ON DUPLICATE KEY UPDATE
    party_name = VALUES(party_name),
    representative = VALUES(representative),
    tax_code = VALUES(tax_code),
    contact = VALUES(contact),
    address = VALUES(address);

-- 12. Tạo index để tối ưu hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_contracts_key_terms ON contracts((CAST(key_terms AS CHAR(1000))));
CREATE INDEX IF NOT EXISTS idx_contracts_favorable_clauses ON contracts((CAST(favorable_clauses AS CHAR(1000))));
CREATE INDEX IF NOT EXISTS idx_contracts_unfavorable_clauses ON contracts((CAST(unfavorable_clauses AS CHAR(1000))));
CREATE INDEX IF NOT EXISTS idx_contracts_payment_method ON contracts(payment_method);
CREATE INDEX IF NOT EXISTS idx_contracts_payment_currency ON contracts(payment_currency);

-- 13. Hiển thị kết quả
SELECT 'Schema đã được cập nhật thành công theo cấu trúc response mới!' AS message;
SELECT COUNT(*) AS total_contracts FROM contracts;
SELECT COUNT(*) AS total_parties FROM contract_parties;
SELECT COUNT(*) AS total_payment_details FROM contract_payment_details;
SELECT COUNT(*) AS total_risk_assessments FROM contract_risk_assessments;
SELECT COUNT(*) AS total_compliance_status FROM contract_compliance_status;

-- 14. Hiển thị cấu trúc dữ liệu mẫu theo format mới
SELECT 'Cấu trúc dữ liệu mẫu theo format response mới:' AS info;
SELECT 
    c.id,
    c.contract_number,
    c.title,
    c.status,
    c.contract_type,
    c.risk_level,
    JSON_LENGTH(c.key_terms) AS key_terms_count,
    JSON_LENGTH(c.favorable_clauses) AS favorable_clauses_count,
    JSON_LENGTH(c.unfavorable_clauses) AS unfavorable_clauses_count
FROM contracts c 
WHERE c.id = 1;

-- 15. Hiển thị chi tiết key terms
SELECT 'Key Terms:' AS section;
SELECT 
    JSON_EXTRACT(key_terms, '$[*].name') AS names,
    JSON_EXTRACT(key_terms, '$[*].description') AS descriptions,
    JSON_EXTRACT(key_terms, '$[*].source') AS sources
FROM contracts 
WHERE id = 1;

-- 16. Hiển thị chi tiết favorable clauses
SELECT 'Favorable Clauses:' AS section;
SELECT 
    JSON_EXTRACT(favorable_clauses, '$[*].name') AS names,
    JSON_EXTRACT(favorable_clauses, '$[*].description') AS descriptions,
    JSON_EXTRACT(favorable_clauses, '$[*].source') AS sources
FROM contracts 
WHERE id = 1;

-- 17. Hiển thị chi tiết unfavorable clauses
SELECT 'Unfavorable Clauses:' AS section;
SELECT 
    JSON_EXTRACT(unfavorable_clauses, '$[*].name') AS names,
    JSON_EXTRACT(unfavorable_clauses, '$[*].description') AS descriptions,
    JSON_EXTRACT(unfavorable_clauses, '$[*].source') AS sources
FROM contracts 
WHERE id = 1;
