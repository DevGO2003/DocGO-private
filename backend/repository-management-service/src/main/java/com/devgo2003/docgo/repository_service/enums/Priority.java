package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum mức độ ưu tiên - LENIENT MODE
 * Có UNKNOWN làm fallback
 */
@Getter
public enum Priority {
    HIGH("High", "Cao", 3),
    MEDIUM("Medium", "Trung bình", 2),
    LOW("Low", "Thấp", 1),
    CRITICAL("Critical", "Khẩn cấp", 4),
    MINIMAL("Minimal", "Tối thiểu", 0),
    UNKNOWN("Unknown Priority", "Mức độ không xác định", -1);

    private final String englishName;
    private final String vietnameseName;
    private final int level;

    Priority(String englishName, String vietnameseName, int level) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.level = level;
    }

    /**
     * Parse từ string - LENIENT MODE
     */
    public static Priority fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UNKNOWN;
        }
        
        try {
            return Priority.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid priority '" + value + "', returning UNKNOWN");
            return UNKNOWN;
        }
    }
}
