package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái giai đoạn - LENIENT MODE
 * Default: PENDING
 */
@Getter
public enum StageStatus {
    COMPLETED("Completed", "Hoàn thành", true),
    IN_PROGRESS("In Progress", "Đang thực hiện", false),
    PENDING("Pending", "Đang chờ", false),
    FAILED("Failed", "Thất bại", false),
    BLOCKED("Blocked", "Bị chặn", false),
    CANCELLED("Cancelled", "Đã hủy", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    StageStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static StageStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        
        try {
            return StageStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid stage status '" + value + "', returning PENDING");
            return PENDING;
        }
    }
}
