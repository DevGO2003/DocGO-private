package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái nhắc nhở - LENIENT MODE
 * Default: PENDING
 */
@Getter
public enum ReminderStatus {
    PENDING("Pending", "Đang chờ", false),
    SENT("Sent", "Đã gửi", false),
    RESOLVED("Resolved", "Đã giải quyết", true),
    OVERDUE("Overdue", "Quá hạn", false),
    CANCELLED("Cancelled", "Đã hủy", false),
    SNOOZED("Snoozed", "Hoãn lại", false),
    ACKNOWLEDGED("Acknowledged", "Đã xác nhận", false),
    COMPLETED("Completed", "Hoàn thành", true),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    ReminderStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static ReminderStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        
        try {
            return ReminderStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid reminder status '" + value + "', returning PENDING");
            return PENDING;
        }
    }
}
