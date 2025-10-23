package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum loại thay đổi (versioning) - LENIENT MODE
 * Default: UPDATE
 */
@Getter
public enum ChangeType {
    CREATE("Create", "Tạo mới"),
    UPDATE("Update", "Cập nhật"),
    DELETE("Delete", "Xóa"),
    ARCHIVE("Archive", "Lưu trữ"),
    RESTORE("Restore", "Khôi phục"),
    RENAME("Rename", "Đổi tên"),
    MOVE("Move", "Di chuyển"),
    COPY("Copy", "Sao chép"),
    UNKNOWN("Unknown Change", "Thay đổi không xác định");

    private final String englishName;
    private final String vietnameseName;

    ChangeType(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static ChangeType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UPDATE;
        }
        
        try {
            return ChangeType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid change type '" + value + "', returning UPDATE");
            return UPDATE;
        }
    }
}
