package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum loại nhắc nhở - LENIENT MODE
 * Default: PAYMENT_DUE
 */
@Getter
public enum ReminderType {
    PAYMENT_DUE("Payment Due", "Hạn thanh toán"),
    MILESTONE_REVIEW("Milestone Review", "Xem xét mốc"),
    EXPIRY_WARNING("Expiry Warning", "Cảnh báo hết hạn"),
    CONTRACT_RENEWAL("Contract Renewal", "Gia hạn hợp đồng"),
    DEADLINE_APPROACHING("Deadline Approaching", "Gần đến hạn"),
    DOCUMENT_REVIEW("Document Review", "Xem xét tài liệu"),
    APPROVAL_REQUIRED("Approval Required", "Cần phê duyệt"),
    SIGNATURE_PENDING("Signature Pending", "Chờ ký"),
    COMPLIANCE_CHECK("Compliance Check", "Kiểm tra tuân thủ"),
    GENERAL("General Reminder", "Nhắc nhở chung"),
    UNKNOWN("Unknown Type", "Loại không xác định");

    private final String englishName;
    private final String vietnameseName;

    ReminderType(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static ReminderType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PAYMENT_DUE;
        }
        
        try {
            return ReminderType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid reminder type '" + value + "', returning PAYMENT_DUE");
            return PAYMENT_DUE;
        }
    }
}
