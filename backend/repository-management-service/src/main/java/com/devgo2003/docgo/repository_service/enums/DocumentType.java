package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum loại tài liệu - STRICT MODE (Align với Document v3)
 * UNKNOWN là default fallback nhưng vẫn validate strict
 * Cần biết chính xác loại tài liệu để xử lý đúng
 */
@Getter
public enum DocumentType {
    CONTRACT("Legal Contract", "Hợp đồng pháp lý", true),
    INVOICE("Invoice/Bill", "Hóa đơn", true),
    MEMO("Internal Memo", "Thông báo nội bộ", true),
    REPORT("Business Report", "Báo cáo kinh doanh", true),
    AGREEMENT("Agreement", "Thỏa thuận", true),
    RECEIPT("Payment Receipt", "Biên lai thanh toán", true),
    PROPOSAL("Project Proposal", "Đề xuất dự án", true),
    MINUTES("Meeting Minutes", "Biên bản họp", true),
    LETTER("Formal Letter", "Thư chính thức", true),
    PRESENTATION("Presentation Slides", "Bài thuyết trình", true),
    SPREADSHEET("Data Spreadsheet", "Bảng tính dữ liệu", true),
    FORM("Application Form", "Đơn đăng ký", true),
    CERTIFICATE("Official Certificate", "Chứng chỉ", true),
    POLICY("Company Policy", "Chính sách công ty", true),
    MANUAL("User Manual", "Hướng dẫn sử dụng", true),
    SPECIFICATION("Technical Specification", "Đặc tả kỹ thuật", true),
    NOT_DOCUMENT("Not a Document", "Không phải tài liệu", false),
    UNKNOWN("Unknown Document Type", "Loại tài liệu không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isDocumentCategory;

    DocumentType(String englishName, String vietnameseName, boolean isDocumentCategory) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isDocumentCategory = isDocumentCategory;
    }

    /**
     * Parse từ string - STRICT MODE với UNKNOWN fallback
     * Throw exception cho null/empty, return UNKNOWN cho invalid value
     */
    public static DocumentType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Document type cannot be null or empty");
        }
        
        try {
            return DocumentType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // Log warning nhưng không throw - return UNKNOWN
            System.err.println("WARN: Invalid document type '" + value + "', returning UNKNOWN");
            return UNKNOWN;
        }
    }
}
