package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum kiểu xuống dòng - LENIENT MODE
 * Default: LF (Unix default)
 */
@Getter
public enum LineEnding {
    LF("LF", "Unix/Linux/Mac (\\n)", "\n"),
    CRLF("CRLF", "Windows (\\r\\n)", "\r\n"),
    CR("CR", "Old Mac (\\r)", "\r"),
    UNKNOWN("Unknown", "Không xác định", "");

    private final String code;
    private final String description;
    private final String sequence;

    LineEnding(String code, String description, String sequence) {
        this.code = code;
        this.description = description;
        this.sequence = sequence;
    }

    public static LineEnding fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return LF;
        }
        
        try {
            return LineEnding.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid line ending '" + value + "', returning LF");
            return LF;
        }
    }
}
