package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái tài liệu - LENIENT MODE
 * Default: UNKNOWN
 */
@Getter
public enum DocumentStatus {
    ACTIVE("Active", "Đang hoạt động", true),
    DRAFT("Draft", "Bản nháp", false),
    DELETED("Deleted", "Đã xóa", false),
    ARCHIVED("Archived", "Đã lưu trữ", false),
    INACTIVE("Inactive", "Không hoạt động", false),
    PENDING("Pending", "Đang chờ", false),
    PROCESSING("Processing", "Đang xử lý", false),
    EXPIRED("Expired", "Đã hết hạn", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isActive;

    DocumentStatus(String englishName, String vietnameseName, boolean isActive) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isActive = isActive;
    }

    public static DocumentStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UNKNOWN;
        }
        
        try {
            return DocumentStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid document status '" + value + "', returning UNKNOWN");
            return UNKNOWN;
        }
    }
}
