-- Script khởi tạo database cho User Management Service
-- Chạy khi container MariaDB khởi động lần đầu

-- Tạo database cho user management
CREATE DATABASE IF NOT EXISTS docgo_user_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user với quyền truy cập database
CREATE USER IF NOT EXISTS 'docgo_user'@'%' IDENTIFIED BY 'docgo_password';
GRANT ALL PRIVILEGES ON docgo_user_service.* TO 'docgo_user'@'%';
FLUSH PRIVILEGES;

-- Sử dụng database docgo_user_service
USE docgo_user_service;

-- Tạo bảng users nếu chưa có (sẽ được tạo bởi SQLAlchemy models)
-- Bảng này sẽ được tạo tự động khi service khởi động
