package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái OCR - LENIENT MODE
 * Default: SKIPPED
 */
@Getter
public enum OcrStatus {
    COMPLETED("Completed", "Hoàn thành", true),
    FAILED("Failed", "Thất bại", false),
    PROCESSING("Processing", "Đang xử lý", false),
    SKIPPED("Skipped", "Bỏ qua", false),
    PENDING("Pending", "Đang chờ", false),
    PARTIAL("Partial", "Một phần", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    OcrStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static OcrStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return SKIPPED;
        }
        
        try {
            return OcrStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid OCR status '" + value + "', returning SKIPPED");
            return SKIPPED;
        }
    }
}
