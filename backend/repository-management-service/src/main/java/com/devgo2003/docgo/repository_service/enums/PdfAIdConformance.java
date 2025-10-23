package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum PDF/A Conformance Level - LENIENT MODE
 * Default: LEVEL_B
 */
@Getter
public enum PdfAIdConformance {
    LEVEL_A("A", "Level A", "Accessible"),
    LEVEL_B("B", "Level B", "Basic"),
    LEVEL_U("U", "Level U", "Unicode"),
    UNKNOWN("UNKNOWN", "Unknown", "Unknown");

    private final String code;
    private final String name;
    private final String description;

    PdfAIdConformance(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.description = description;
    }

    public static PdfAIdConformance fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return LEVEL_B;
        }
        
        String normalized = value.trim().toUpperCase();
        
        // Try exact code match
        for (PdfAIdConformance level : values()) {
            if (level.code.equals(normalized)) {
                return level;
            }
        }
        
        // Try enum name match
        try {
            return PdfAIdConformance.valueOf("LEVEL_" + normalized);
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid PDF/A conformance '" + value + "', returning LEVEL_B");
            return LEVEL_B;
        }
    }
}
