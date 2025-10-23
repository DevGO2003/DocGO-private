package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum phương thức trích xuất - LENIENT MODE
 * Default: HYBRID (toàn diện nhất)
 */
@Getter
public enum ExtractionMethod {
    DIRECT("Direct Text Extraction", "Trích xuất trực tiếp"),
    OCR("OCR Extraction", "Trích xuất OCR"),
    HYBRID("Hybrid (Direct + OCR)", "Kết hợp"),
    REGEX("Regular Expression", "Biểu thức chính quy"),
    NLP("Natural Language Processing", "Xử lý ngôn ngữ tự nhiên"),
    MACHINE_LEARNING("Machine Learning", "Học máy"),
    RULE_BASED("Rule-Based", "Dựa trên quy tắc"),
    TEMPLATE("Template Matching", "Khớp mẫu"),
    MANUAL("Manual Extraction", "Trích xuất thủ công"),
    UNKNOWN("Unknown Method", "Phương pháp không xác định");

    private final String englishName;
    private final String vietnameseName;

    ExtractionMethod(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static ExtractionMethod fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return HYBRID;
        }
        
        try {
            return ExtractionMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid extraction method '" + value + "', returning HYBRID");
            return HYBRID;
        }
    }
}
