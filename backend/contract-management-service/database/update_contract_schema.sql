-- Cập nhật schema cho contract table để hỗ trợ cấu trúc mới nhất quán
-- Chạy script này để thêm các trường mới cần thiết

USE docgo_contract_service;

-- Thêm các trường mới vào bảng contracts
ALTER TABLE contracts 
ADD COLUMN payment_method VARCHAR(255) NULL COMMENT 'Phương thức thanh toán',
ADD COLUMN reminders JSON NULL COMMENT 'Danh sách nhắc nhở hợp đồng';

-- Cập nhật comment cho các trường hiện có để rõ ràng hơn
ALTER TABLE contracts 
MODIFY COLUMN contract_object TEXT COMMENT 'Đối tượng hợp đồng',
MODIFY COLUMN effective_date VARCHAR(255) COMMENT 'Ngày có hiệu lực (yyyy-MM-dd)',
MODIFY COLUMN contract_term VARCHAR(255) COMMENT 'Thời hạn hợp đồng',
MODIFY COLUMN total_value VARCHAR(255) COMMENT 'Tổng giá trị hợp đồng',
MODIFY COLUMN payment_schedule TEXT COMMENT 'Lịch trình thanh toán',
MODIFY COLUMN currency VARCHAR(50) COMMENT 'Đơn vị tiền tệ',
MODIFY COLUMN termination_conditions TEXT COMMENT 'Điều kiện chấm dứt hợp đồng',
MODIFY COLUMN risk_assessment TEXT COMMENT 'Đánh giá rủi ro (JSON)',
MODIFY COLUMN compliance_status VARCHAR(100) COMMENT 'Trạng thái tuân thủ',
MODIFY COLUMN legal_review_required BOOLEAN DEFAULT FALSE COMMENT 'Yêu cầu rà soát pháp lý',
MODIFY COLUMN review_deadline DATE NULL COMMENT 'Hạn chót rà soát';

-- Tạo index cho các trường thường query
CREATE INDEX idx_contracts_effective_date ON contracts(effective_date);
CREATE INDEX idx_contracts_contract_type ON contracts(contract_type);
CREATE INDEX idx_contracts_risk_level ON contracts(risk_level);
CREATE INDEX idx_contracts_compliance_status ON contracts(compliance_status);
CREATE INDEX idx_contracts_legal_review_required ON contracts(legal_review_required);

-- Cập nhật dữ liệu mẫu nếu cần
UPDATE contracts 
SET payment_method = 'Chuyển khoản ngân hàng',
    reminders = '[]'
WHERE payment_method IS NULL;

-- Hiển thị cấu trúc bảng sau khi cập nhật
DESCRIBE contracts;
