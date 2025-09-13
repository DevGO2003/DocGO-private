-- Fix Consistency Schema - Sửa các vấn đề nhất quán giữa AI Event và Database
-- Thực hiện: ALTER TABLE để sửa field names và thêm missing fields

-- 1. Sửa field contact_info thành contact trong bảng contract_parties
ALTER TABLE contract_parties 
CHANGE COLUMN contact_info contact VARCHAR(255) COMMENT 'Contact information for contract party';

-- 2. Thêm field tags vào bảng contracts
ALTER TABLE contracts 
ADD COLUMN tags JSON COMMENT 'Tags array from AI Event (e.g., ["service", "software", "development", "contract"])';

-- 3. Cập nhật comments cho các field để rõ ràng hơn
ALTER TABLE contracts 
MODIFY COLUMN contract_object TEXT COMMENT 'Contract object/description from AI Event',
MODIFY COLUMN effective_date VARCHAR(255) COMMENT 'Effective date from AI Event',
MODIFY COLUMN contract_term VARCHAR(255) COMMENT 'Contract term from AI Event',
MODIFY COLUMN total_value VARCHAR(255) COMMENT 'Total contract value from AI Event',
MODIFY COLUMN payment_schedule TEXT COMMENT 'Payment schedule from AI Event',
MODIFY COLUMN currency VARCHAR(50) COMMENT 'Currency from AI Event',
MODIFY COLUMN payment_method VARCHAR(255) COMMENT 'Payment method from AI Event',
MODIFY COLUMN reminders JSON COMMENT 'Reminders array from AI Event',
MODIFY COLUMN termination_conditions TEXT COMMENT 'Termination conditions from AI Event',
MODIFY COLUMN risk_assessment TEXT COMMENT 'Risk assessment JSON from AI Event',
MODIFY COLUMN compliance_status VARCHAR(100) COMMENT 'Compliance status from AI Event';

-- 4. Cập nhật comments cho bảng contract_parties
ALTER TABLE contract_parties 
MODIFY COLUMN party_name VARCHAR(255) COMMENT 'Party name from AI Event',
MODIFY COLUMN party_role VARCHAR(255) COMMENT 'Party role from AI Event',
MODIFY COLUMN representative VARCHAR(255) COMMENT 'Representative from AI Event',
MODIFY COLUMN tax_code VARCHAR(100) COMMENT 'Tax code from AI Event',
MODIFY COLUMN contact VARCHAR(255) COMMENT 'Contact information from AI Event',
MODIFY COLUMN address TEXT COMMENT 'Address from AI Event',
MODIFY COLUMN business_license VARCHAR(255) COMMENT 'Business license from AI Event';

-- 5. Tạo index cho các field thường query
CREATE INDEX idx_contracts_system_id ON contracts(system_id);
CREATE INDEX idx_contracts_ai_processed ON contracts(ai_processed);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contract_parties_contract_id ON contract_parties(contract_id);

-- 6. Thêm constraints để đảm bảo data integrity
ALTER TABLE contracts 
ADD CONSTRAINT chk_ai_processed CHECK (ai_processed IN (0, 1)),
ADD CONSTRAINT chk_legal_review_required CHECK (legal_review_required IN (0, 1));

-- 7. Cập nhật sample data để test (nếu cần)
-- UPDATE contracts SET tags = '["service", "software", "contract"]' WHERE id = 1;

-- 8. Kiểm tra kết quả
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('contracts', 'contract_parties')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 9. Kiểm tra indexes
SHOW INDEX FROM contracts;
SHOW INDEX FROM contract_parties;




































