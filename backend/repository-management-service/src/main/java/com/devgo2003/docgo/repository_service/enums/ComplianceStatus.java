package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum trạng thái tuân thủ - LENIENT MODE
 * Default: PENDING_REVIEW
 */
@Getter
public enum ComplianceStatus {
    COMPLIANT("Compliant", "Tuân thủ", true),
    NON_COMPLIANT("Non-Compliant", "Không tuân thủ", false),
    PENDING_REVIEW("Pending Review", "Chờ xem xét", false),
    IN_AUDIT("In Audit", "Đang kiểm toán", false),
    IN_REVIEW("In Review", "Đang xem xét", false),
    PARTIALLY_COMPLIANT("Partially Compliant", "Tuân thủ một phần", false),
    REQUIRES_ACTION("Requires Action", "Cần hành động", false),
    APPROVED("Approved", "Đã phê duyệt", true),
    REJECTED("Rejected", "Đã từ chối", false),
    EXPIRED("Expired", "Đã hết hạn", false),
    UNKNOWN("Unknown Status", "Trạng thái không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isCompliant;

    ComplianceStatus(String englishName, String vietnameseName, boolean isCompliant) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isCompliant = isCompliant;
    }

    public static ComplianceStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PENDING_REVIEW;
        }
        
        try {
            return ComplianceStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid compliance status '" + value + "', returning PENDING_REVIEW");
            return PENDING_REVIEW;
        }
    }
}
