package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái trích xuất dữ liệu - LENIENT MODE
 * Default: FAILED (báo lỗi rõ ràng)
 */
@Getter
public enum ExtractionStatus {
    SUCCESS("Success", "Thành công", true),
    PARTIAL("Partial Success", "Thành công một phần", false),
    FAILED("Failed", "Thất bại", false),
    PENDING("Pending", "Đang chờ", false),
    PROCESSING("Processing", "Đang xử lý", false),
    SKIPPED("Skipped", "Bỏ qua", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    ExtractionStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static ExtractionStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return FAILED;
        }
        
        try {
            return ExtractionStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid extraction status '" + value + "', returning FAILED");
            return FAILED;
        }
    }
}
