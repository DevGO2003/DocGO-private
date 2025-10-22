package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum mức độ bảo mật - LENIENT MODE
 * Default: PUBLIC (an toàn nhất)
 */
@Getter
public enum Confidentiality {
    CONFIDENTIAL("Confidential", "Bảo mật", 3),
    INTERNAL("Internal", "Nội bộ", 2),
    PUBLIC("Public", "Công khai", 1),
    RESTRICTED("Restricted", "Hạn chế", 4),
    TOP_SECRET("Top Secret", "Tối mật", 5),
    UNKNOWN("Unknown", "Không xác định", 0);

    private final String englishName;
    private final String vietnameseName;
    private final int securityLevel;

    Confidentiality(String englishName, String vietnameseName, int securityLevel) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.securityLevel = securityLevel;
    }

    /**
     * Parse từ string - LENIENT MODE
     * Default: PUBLIC nếu không xác định được
     */
    public static Confidentiality fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PUBLIC; // Default an toàn nhất
        }
        
        try {
            return Confidentiality.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid confidentiality '" + value + "', returning PUBLIC");
            return PUBLIC;
        }
    }
}
