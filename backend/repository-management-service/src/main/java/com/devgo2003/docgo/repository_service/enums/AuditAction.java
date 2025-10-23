package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum hành động audit - LENIENT MODE
 * Default: UPDATE
 */
@Getter
public enum AuditAction {
    CREATE("Create", "Tạo mới"),
    UPDATE("Update", "Cập nhật"),
    DELETE("Delete", "Xóa"),
    VIEW("View", "Xem"),
    SHARE("Share", "Chia sẻ"),
    DOWNLOAD("Download", "Tải xuống"),
    UPLOAD("Upload", "Tải lên"),
    RESTORE("Restore", "Khôi phục"),
    ARCHIVE("Archive", "Lưu trữ"),
    APPROVE("Approve", "Phê duyệt"),
    REJECT("Reject", "Từ chối"),
    COMMENT("Comment", "Bình luận"),
    EXPORT("Export", "Xuất"),
    IMPORT("Import", "Nhập"),
    PRINT("Print", "In"),
    SIGN("Sign", "Ký"),
    UNKNOWN("Unknown Action", "Hành động không xác định");

    private final String englishName;
    private final String vietnameseName;

    AuditAction(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static AuditAction fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UPDATE;
        }
        
        try {
            return AuditAction.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid audit action '" + value + "', returning UPDATE");
            return UPDATE;
        }
    }
}
