-- User Service Database Initialization Script
-- This script creates the database and tables for the user service

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS user_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE user_db;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url VARCHAR(500) NULL,
    metadata_json JSON NULL,
    system_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_user_profiles_system_id (system_id),
    INDEX idx_user_profiles_email_system (email, system_id),
    INDEX idx_user_profiles_created_at (created_at),
    INDEX idx_user_profiles_full_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_approvals table
CREATE TABLE IF NOT EXISTS user_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    approver_id INT NULL,
    system_id VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_user_approvals_system_id (system_id),
    INDEX idx_user_approvals_status (status),
    INDEX idx_user_approvals_user_system (user_id, system_id),
    INDEX idx_user_approvals_approver (approver_id),
    INDEX idx_user_approvals_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO user_profiles (full_name, email, system_id, metadata_json) VALUES
('John Doe', 'john.doe@example.com', 'system1', '{"department": "Engineering", "role": "Developer"}'),
('Jane Smith', 'jane.smith@example.com', 'system1', '{"department": "Marketing", "role": "Manager"}'),
('Bob Johnson', 'bob.johnson@example.com', 'system2', '{"department": "Sales", "role": "Representative"}'),
('Alice Brown', 'alice.brown@example.com', 'system2', '{"department": "HR", "role": "Specialist"}'),
('Charlie Wilson', 'charlie.wilson@example.com', 'system1', '{"department": "Engineering", "role": "QA"}');

-- Insert sample approval records
INSERT INTO user_approvals (user_id, status, approver_id, system_id, notes) VALUES
(1, 'approved', 100, 'system1', 'User profile verified and approved'),
(2, 'approved', 100, 'system1', 'Manager role confirmed'),
(3, 'pending', NULL, 'system2', 'Awaiting manager approval'),
(4, 'rejected', 101, 'system2', 'Incomplete documentation'),
(5, 'pending', NULL, 'system1', 'Awaiting technical review');

-- Create view for users with approval status
CREATE OR REPLACE VIEW users_with_approvals AS
SELECT 
    up.user_id,
    up.full_name,
    up.email,
    up.avatar_url,
    up.system_id,
    up.created_at,
    up.updated_at,
    ua.status as approval_status,
    ua.notes as approval_notes,
    ua.approver_id,
    ua.approved_at
FROM user_profiles up
LEFT JOIN user_approvals ua ON up.user_id = ua.user_id AND up.system_id = ua.system_id;

-- Create stored procedure for bulk approval updates
DELIMITER //
CREATE PROCEDURE BulkUpdateApprovals(
    IN p_system_id VARCHAR(100),
    IN p_status ENUM('pending', 'approved', 'rejected'),
    IN p_approver_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id INT;
    DECLARE cur CURSOR FOR 
        SELECT user_id FROM user_profiles WHERE system_id = p_system_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert or update approval record
        INSERT INTO user_approvals (user_id, status, approver_id, system_id, notes, updated_at)
        VALUES (v_user_id, p_status, p_approver_id, p_system_id, p_notes, NOW())
        ON DUPLICATE KEY UPDATE
            status = p_status,
            approver_id = p_approver_id,
            notes = p_notes,
            updated_at = NOW(),
            approved_at = CASE WHEN p_status = 'approved' THEN NOW() ELSE approved_at END;
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;

-- Create function to get approval statistics
DELIMITER //
CREATE FUNCTION GetApprovalStatistics(p_system_id VARCHAR(100))
RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_OBJECT(
        'total', COUNT(*),
        'pending', SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END),
        'approved', SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END),
        'rejected', SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)
    ) INTO result
    FROM user_approvals
    WHERE system_id = p_system_id;
    
    RETURN result;
END //
DELIMITER ;

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON user_db.* TO 'your_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show created tables
SHOW TABLES;

-- Show sample data
SELECT 'User Profiles:' as info;
SELECT * FROM user_profiles LIMIT 5;

SELECT 'User Approvals:' as info;
SELECT * FROM user_approvals LIMIT 5;

SELECT 'Users with Approvals View:' as info;
SELECT * FROM users_with_approvals LIMIT 5;

-- Test the stored procedure
-- CALL BulkUpdateApprovals('system1', 'approved', 100, 'Bulk approval update');

-- Test the function
-- SELECT GetApprovalStatistics('system1') as statistics;
