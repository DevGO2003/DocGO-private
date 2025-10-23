package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum giai đoạn workflow hợp đồng - LENIENT MODE (FIXED theo Document v3)
 * Default: DRAFT
 */
@Getter
public enum WorkflowStage {
    DRAFT("Draft", "Bản nháp", 1),
    REVIEW("Review", "Xem xét", 2),
    APPROVAL("Approval", "Phê duyệt", 3),
    SIGNED("Signed", "Đã ký", 4),
    EXECUTED("Executed", "Thực thi", 5),
    TERMINATED("Terminated", "Chấm dứt", 6),
    ARCHIVED("Archived", "Lưu trữ", 7),
    UNKNOWN("Unknown Stage", "Giai đoạn không xác định", 0);

    private final String englishName;
    private final String vietnameseName;
    private final int order;

    WorkflowStage(String englishName, String vietnameseName, int order) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.order = order;
    }

    public static WorkflowStage fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DRAFT;
        }
        
        try {
            return WorkflowStage.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid workflow stage '" + value + "', returning DRAFT");
            return DRAFT;
        }
    }
}
