package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum mức độ rủi ro - LENIENT MODE
 * Default: MEDIUM
 */
@Getter
public enum RiskLevel {
    LOW("Low", "Thấp", 1),
    MEDIUM("Medium", "Trung bình", 2),
    HIGH("High", "Cao", 3),
    CRITICAL("Critical", "Nghiêm trọng", 4),
    MINIMAL("Minimal", "Tối thiểu", 0),
    UNKNOWN("Unknown Risk", "Rủi ro không xác định", -1);

    private final String englishName;
    private final String vietnameseName;
    private final int severity;

    RiskLevel(String englishName, String vietnameseName, int severity) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.severity = severity;
    }

    public static RiskLevel fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return MEDIUM;
        }
        
        try {
            return RiskLevel.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid risk level '" + value + "', returning MEDIUM");
            return MEDIUM;
        }
    }
}
