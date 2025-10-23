package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái tóm tắt - LENIENT MODE
 * Default: SKIPPED
 */
@Getter
public enum SummarizationStatus {
    SUCCESS("Success", "Thành công", true),
    FAILED("Failed", "Thất bại", false),
    SKIPPED("Skipped", "Bỏ qua", false),
    PENDING("Pending", "Đang chờ", false),
    PROCESSING("Processing", "Đang xử lý", false),
    REVIEWING("Reviewing", "Đang xem xét", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    SummarizationStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static SummarizationStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return SKIPPED;
        }
        
        try {
            return SummarizationStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid summarization status '" + value + "', returning SKIPPED");
            return SKIPPED;
        }
    }
}
