package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái thanh toán - LENIENT MODE
 * Default: PENDING
 */
@Getter
public enum PaymentStatus {
    PENDING("Pending", "Đang chờ", false),
    PAID("Paid", "Đã thanh toán", true),
    OVERDUE("Overdue", "Quá hạn", false),
    CANCELLED("Cancelled", "Đã hủy", false),
    PROCESSING("Processing", "Đang xử lý", false),
    FAILED("Failed", "Thất bại", false),
    REFUNDED("Refunded", "Đã hoàn tiền", true),
    PARTIAL("Partial Payment", "Thanh toán một phần", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isComplete;

    PaymentStatus(String englishName, String vietnameseName, boolean isComplete) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isComplete = isComplete;
    }

    public static PaymentStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING;
        }
        
        try {
            return PaymentStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid payment status '" + value + "', returning PENDING");
            return PENDING;
        }
    }
}
