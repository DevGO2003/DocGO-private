package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum hành động truy cập - LENIENT MODE
 * Default: VIEW
 */
@Getter
public enum AccessAction {
    VIEW("View", "Xem", false),
    EDIT("Edit", "Chỉnh sửa", true),
    DOWNLOAD("Download", "Tải xuống", false),
    SHARE("Share", "Chia sẻ", true),
    DELETE("Delete", "Xóa", true),
    PRINT("Print", "In", false),
    COPY("Copy", "Sao chép", false),
    EXPORT("Export", "Xuất", false),
    COMMENT("Comment", "Bình luận", false),
    APPROVE("Approve", "Phê duyệt", true),
    REJECT("Reject", "Từ chối", true),
    UNKNOWN("Unknown Action", "Hành động không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isModifying;

    AccessAction(String englishName, String vietnameseName, boolean isModifying) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isModifying = isModifying;
    }

    public static AccessAction fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return VIEW;
        }
        
        try {
            return AccessAction.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid access action '" + value + "', returning VIEW");
            return VIEW;
        }
    }
}
