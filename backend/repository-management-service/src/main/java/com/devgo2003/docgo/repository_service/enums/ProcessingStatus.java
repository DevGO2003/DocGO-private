package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái xử lý tổng quát - LENIENT MODE
 * Default: COMPLETED (default thành công)
 */
@Getter
public enum ProcessingStatus {
    COMPLETED("Completed", "Hoàn thành", true),
    PROCESSING("Processing", "Đang xử lý", false),
    FAILED("Failed", "Thất bại", false),
    PENDING("Pending", "Đang chờ", false),
    QUEUED("Queued", "Đang xếp hàng", false),
    CANCELLED("Cancelled", "Đã hủy", false),
    TIMEOUT("Timeout", "Hết thời gian", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    ProcessingStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static ProcessingStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return COMPLETED;
        }
        
        try {
            return ProcessingStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid processing status '" + value + "', returning COMPLETED");
            return COMPLETED;
        }
    }
}
