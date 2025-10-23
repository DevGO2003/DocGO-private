package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái phân tích JSON - LENIENT MODE
 * Default: PENDING
 */
@Getter
public enum JsonAnalysisStatus {
    PARSED("Successfully Parsed", "Phân tích thành công", true),
    INVALID("Invalid JSON", "JSON không hợp lệ", false),
    PENDING("Pending Analysis", "Chờ phân tích", false),
    PROCESSING("Processing", "Đang xử lý", false),
    FAILED("Failed", "Thất bại", false),
    SKIPPED("Skipped", "Bỏ qua", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    JsonAnalysisStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static JsonAnalysisStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        
        try {
            return JsonAnalysisStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid JSON analysis status '" + value + "', returning PENDING");
            return PENDING;
        }
    }
}
