package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum Dublin Core Format - LENIENT MODE
 * Default: UNKNOWN
 */
@Getter
public enum DublinCoreFormat {
    APPLICATION_PDF("application/pdf", "PDF Document"),
    TEXT_PLAIN("text/plain", "Plain Text"),
    APPLICATION_JSON("application/json", "JSON File"),
    APPLICATION_XML("application/xml", "XML File"),
    UNKNOWN("unknown", "Unknown Format");

    private final String format;
    private final String description;

    DublinCoreFormat(String format, String description) {
        this.format = format;
        this.description = description;
    }

    public static DublinCoreFormat fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UNKNOWN;
        }
        
        // Try exact match with format field
        for (DublinCoreFormat dcFormat : values()) {
            if (dcFormat.format.equalsIgnoreCase(value.trim())) {
                return dcFormat;
            }
        }
        
        System.err.println("WARN: Invalid Dublin Core format '" + value + "', returning UNKNOWN");
        return UNKNOWN;
    }
}
