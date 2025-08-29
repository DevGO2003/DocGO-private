-- Cập nhật schema bảng contracts dựa trên JSON structure
-- Phiên bản 2.0 - Cập nhật ngày: 2025-08-29

USE docgo_contract_service;

-- 1. Cập nhật bảng contracts để thêm các trường mới từ JSON
ALTER TABLE contracts
ADD COLUMN contract_object TEXT COMMENT 'Đối tượng hợp đồng (mô tả chi tiết)',
ADD COLUMN effective_date VARCHAR(255) COMMENT 'Ngày có hiệu lực hợp đồng',
ADD COLUMN contract_term VARCHAR(500) COMMENT 'Thời hạn hợp đồng',
ADD COLUMN total_value VARCHAR(255) COMMENT 'Tổng giá trị hợp đồng',
ADD COLUMN payment_schedule TEXT COMMENT 'Lịch trình thanh toán',
ADD COLUMN currency VARCHAR(10) COMMENT 'Đơn vị tiền tệ',
ADD COLUMN termination_conditions TEXT COMMENT 'Điều kiện chấm dứt hợp đồng',
ADD COLUMN risk_assessment TEXT COMMENT 'Đánh giá rủi ro từ AI',
ADD COLUMN compliance_status VARCHAR(50) COMMENT 'Trạng thái tuân thủ pháp luật',
ADD COLUMN legal_review_required BOOLEAN DEFAULT FALSE COMMENT 'Cần rà soát pháp lý',
ADD COLUMN review_deadline DATE COMMENT 'Hạn chót rà soát pháp lý';

-- 2. Cập nhật bảng contract_summaries để thêm các trường mới
ALTER TABLE contract_summaries
ADD COLUMN key_clauses JSON COMMENT 'Các điều khoản chính của hợp đồng',
ADD COLUMN favorable_clauses JSON COMMENT 'Các điều khoản có lợi',
ADD COLUMN unfavorable_clauses JSON COMMENT 'Các điều khoản bất lợi',
ADD COLUMN parties_analysis JSON COMMENT 'Phân tích các bên tham gia',
ADD COLUMN payment_analysis JSON COMMENT 'Phân tích thanh toán',
ADD COLUMN risk_score DECIMAL(3,1) COMMENT 'Điểm đánh giá rủi ro (0-10)',
ADD COLUMN risk_level VARCHAR(20) COMMENT 'Mức độ rủi ro (THẤP/TRUNG BÌNH/CAO)',
ADD COLUMN recommendation TEXT COMMENT 'Khuyến nghị từ AI';

-- 3. Tạo bảng mới để lưu thông tin chi tiết về các bên tham gia
CREATE TABLE IF NOT EXISTS contract_parties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    party_name VARCHAR(500) COMMENT 'Tên bên tham gia',
    party_role VARCHAR(100) COMMENT 'Vai trò (Bên A, Bên B, v.v.)',
    representative VARCHAR(255) COMMENT 'Người đại diện',
    tax_code VARCHAR(50) COMMENT 'Mã số thuế',
    contact_info VARCHAR(255) COMMENT 'Thông tin liên lạc',
    address TEXT COMMENT 'Địa chỉ',
    business_license VARCHAR(100) COMMENT 'Giấy phép kinh doanh',
    party_type ENUM('INDIVIDUAL', 'ORGANIZATION') DEFAULT 'ORGANIZATION' COMMENT 'Loại bên tham gia',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Có phải bên chính không',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract_id (contract_id),
    INDEX idx_party_role (party_role),
    INDEX idx_is_primary (is_primary)
) COMMENT 'Bảng lưu thông tin chi tiết các bên tham gia hợp đồng';

-- 4. Tạo bảng mới để lưu thông tin điều khoản hợp đồng
CREATE TABLE IF NOT EXISTS contract_clauses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    clause_name VARCHAR(255) NOT NULL COMMENT 'Tên điều khoản',
    clause_description TEXT COMMENT 'Mô tả điều khoản',
    clause_source VARCHAR(100) COMMENT 'Nguồn (Điều X, Khoản Y)',
    clause_type ENUM('KEY', 'FAVORABLE', 'UNFAVORABLE', 'STANDARD') DEFAULT 'STANDARD' COMMENT 'Loại điều khoản',
    risk_level VARCHAR(20) COMMENT 'Mức độ rủi ro của điều khoản',
    benefit_to VARCHAR(100) COMMENT 'Có lợi cho bên nào',
    risk_to VARCHAR(100) COMMENT 'Rủi ro cho bên nào',
    ai_analysis TEXT COMMENT 'Phân tích từ AI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract_id (contract_id),
    INDEX idx_clause_type (clause_type),
    INDEX idx_risk_level (risk_level)
) COMMENT 'Bảng lưu thông tin chi tiết các điều khoản hợp đồng';

-- 5. Tạo bảng mới để lưu thông tin thanh toán
CREATE TABLE IF NOT EXISTS contract_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    payment_type ENUM('ONE_TIME', 'RECURRING', 'MILESTONE') DEFAULT 'ONE_TIME' COMMENT 'Loại thanh toán',
    amount DECIMAL(15,2) COMMENT 'Số tiền',
    currency VARCHAR(10) DEFAULT 'VND' COMMENT 'Đơn vị tiền tệ',
    payment_schedule TEXT COMMENT 'Lịch trình thanh toán',
    due_date DATE COMMENT 'Ngày đến hạn',
    payment_method VARCHAR(100) COMMENT 'Phương thức thanh toán',
    is_paid BOOLEAN DEFAULT FALSE COMMENT 'Đã thanh toán chưa',
    payment_date DATE COMMENT 'Ngày thanh toán thực tế',
    notes TEXT COMMENT 'Ghi chú',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    INDEX idx_contract_id (contract_id),
    INDEX idx_payment_type (payment_type),
    INDEX idx_is_paid (is_paid),
    INDEX idx_due_date (due_date)
) COMMENT 'Bảng lưu thông tin thanh toán hợp đồng';

-- 6. Cập nhật dữ liệu mẫu nếu cần
UPDATE contracts SET
    contract_object = 'Hợp đồng cung cấp bản quyền phần mềm quản lý liên thông thuốc cơ sở bán buôn PhanmemGDP.com.',
    effective_date = 'Ngày ký hợp đồng năm 2024',
    contract_term = '6 năm, tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí cho đến khi hai bên thỏa thuận chấm dứt.',
    total_value = '4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)',
    payment_schedule = 'Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu.',
    currency = 'VND',
    termination_conditions = 'Hợp đồng có thể bị chấm dứt trước thời hạn nếu các bên thỏa thuận, xảy ra sự kiện bất khả kháng, một trong các bên bị phá sản/giải thể, hoặc một bên vi phạm nghiêm trọng nghĩa vụ thanh toán.',
    risk_assessment = 'Rủi ro trung bình - cần theo dõi các điều khoản tự động gia hạn',
    compliance_status = 'PENDING_REVIEW',
    legal_review_required = TRUE,
    review_deadline = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
WHERE contract_object IS NULL;

-- 7. Thêm dữ liệu mẫu cho contract_parties
INSERT INTO contract_parties (contract_id, party_name, party_role, representative, tax_code, contact_info, is_primary) VALUES
(1, 'Công ty Cổ phần Phát triển Phần mềm Giải pháp Phân phối Dược và Nhà thuốc', 'Bên cung cấp dịch vụ (Bên B)', 'Ông Nguyễn Văn Dũng, Giám đốc', '0109889002', '0983.456.455', TRUE),
(1, NULL, 'Bên sử dụng dịch vụ (Bên A)', NULL, NULL, NULL, FALSE);

-- 8. Thêm dữ liệu mẫu cho contract_clauses
INSERT INTO contract_clauses (contract_id, clause_name, clause_description, clause_source, clause_type, risk_level, benefit_to, risk_to) VALUES
(1, 'Nội dung hợp tác', 'Bên B cung cấp phần mềm PhanmemGDP.com, Bên A đồng ý sử dụng và cho phép thu thập thông tin cá nhân để tạo tài khoản.', 'Điều 1', 'KEY', 'THẤP', 'Cả hai bên', 'Không có'),
(1, 'Tính năng chính', 'Phần mềm có các tính năng chính như quản lý hàng hóa, nhà cung cấp, khách hàng, tạo báo cáo và kết nối liên thông với cơ sở dữ liệu Dược Quốc gia.', 'Điều 2', 'KEY', 'THẤP', 'Bên A', 'Không có'),
(1, 'Tự động gia hạn', 'Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo', 'Điều khoản gia hạn', 'UNFAVORABLE', 'CAO', 'Bên B', 'Bên A'),
(1, 'Phí phát sinh không giới hạn', 'Bên A phải trả thêm phí 500.000 đồng/năm cho mỗi 500 hóa đơn vượt quá hạn mức 7.000 hóa đơn', 'Điều khoản phí', 'UNFAVORABLE', 'CAO', 'Bên B', 'Bên A');

-- 9. Thêm dữ liệu mẫu cho contract_payments
INSERT INTO contract_payments (contract_id, payment_type, amount, currency, payment_schedule, due_date, payment_method) VALUES
(1, 'ONE_TIME', 4000000.00, 'VND', 'Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu.', CURDATE(), 'Chuyển khoản/Tiền mặt'),
(1, 'RECURRING', 500000.00, 'VND', 'Phí phát sinh hàng năm cho mỗi 500 hóa đơn vượt quá hạn mức 7.000 hóa đơn', DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'Chuyển khoản');

-- 10. Cập nhật contract_summaries với dữ liệu mới
UPDATE contract_summaries SET
    key_clauses = JSON_OBJECT(
        'clauses', JSON_ARRAY(
            JSON_OBJECT('name', 'Nội dung hợp tác', 'description', 'Bên B cung cấp phần mềm PhanmemGDP.com, Bên A đồng ý sử dụng và cho phép thu thập thông tin cá nhân để tạo tài khoản.', 'source', 'Điều 1'),
            JSON_OBJECT('name', 'Tính năng chính', 'description', 'Phần mềm có các tính năng chính như quản lý hàng hóa, nhà cung cấp, khách hàng, tạo báo cáo và kết nối liên thông với cơ sở dữ liệu Dược Quốc gia.', 'source', 'Điều 2')
        )
    ),
    favorable_clauses = JSON_OBJECT(
        'clauses', JSON_ARRAY(
            JSON_OBJECT('clause_name', 'Tự động gia hạn không phí', 'description', 'Hợp đồng có hiệu lực 6 năm và sẽ tự động gia hạn các năm tiếp theo mà không phát sinh thêm chi phí gia hạn.', 'benefit_to', 'Bên sử dụng dịch vụ (Bên A)'),
            JSON_OBJECT('clause_name', 'Nâng cấp miễn phí', 'description', 'Việc nâng cấp các tính năng phần mềm theo yêu cầu pháp lý của Cục quản lý Dược là hoàn toàn miễn phí.', 'benefit_to', 'Bên sử dụng dịch vụ (Bên A)')
        )
    ),
    unfavorable_clauses = JSON_OBJECT(
        'clauses', JSON_ARRAY(
            JSON_OBJECT('clause_name', 'Tự động gia hạn', 'description', 'Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo, điều này có thể khiến Bên A khó chấm dứt hợp đồng nếu không muốn tiếp tục sử dụng dịch vụ.', 'risk_to', 'Bên sử dụng dịch vụ (Bên A)'),
            JSON_OBJECT('clause_name', 'Phí phát sinh không giới hạn', 'description', 'Hợp đồng quy định Bên A phải trả thêm phí 500.000 đồng/năm cho mỗi 500 hóa đơn vượt quá hạn mức 7.000 hóa đơn, mà không có giới hạn tối đa cho khoản phí này.', 'risk_to', 'Bên sử dụng dịch vụ (Bên A)')
        )
    ),
    risk_score = 7.5,
    risk_level = 'TRUNG BÌNH',
    recommendation = 'Cần rà soát các điều khoản tự động gia hạn và phí phát sinh. Khuyến nghị thêm điều khoản thông báo trước khi gia hạn và giới hạn phí phát sinh.'
WHERE contract_id = 1;

-- 11. Tạo index để tối ưu hiệu suất truy vấn
CREATE INDEX idx_contracts_effective_date ON contracts(effective_date);
CREATE INDEX idx_contracts_contract_term ON contracts(contract_term);
CREATE INDEX idx_contracts_compliance_status ON contracts(compliance_status);
CREATE INDEX idx_contracts_legal_review_required ON contracts(legal_review_required);
CREATE INDEX idx_contracts_review_deadline ON contracts(review_deadline);

-- 12. Thêm comment cho các bảng mới
ALTER TABLE contract_parties COMMENT = 'Bảng lưu thông tin chi tiết các bên tham gia hợp đồng';
ALTER TABLE contract_clauses COMMENT = 'Bảng lưu thông tin chi tiết các điều khoản hợp đồng';
ALTER TABLE contract_payments COMMENT = 'Bảng lưu thông tin thanh toán hợp đồng';

-- 13. Hiển thị kết quả
SELECT 'Schema đã được cập nhật thành công!' AS message;
SELECT COUNT(*) AS total_contracts FROM contracts;
SELECT COUNT(*) AS total_parties FROM contract_parties;
SELECT COUNT(*) AS total_clauses FROM contract_clauses;
SELECT COUNT(*) AS total_payments FROM contract_payments;
SELECT COUNT(*) AS total_summaries FROM contract_summaries;
