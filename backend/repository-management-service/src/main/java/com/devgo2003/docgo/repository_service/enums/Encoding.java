package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum mã hóa ký tự - LENIENT MODE
 * Default: UTF_8
 */
@Getter
public enum Encoding {
    UTF_8("UTF-8", "Unicode UTF-8"),
    UTF_16("UTF-16", "Unicode UTF-16"),
    ASCII("ASCII", "ASCII"),
    ISO_8859_1("ISO-8859-1", "Latin-1"),
    WINDOWS_1252("Windows-1252", "Windows Latin"),
    GB2312("GB2312", "Chinese Simplified"),
    BIG5("Big5", "Chinese Traditional"),
    SHIFT_JIS("Shift_JIS", "Japanese"),
    EUC_KR("EUC-KR", "Korean"),
    UNKNOWN("Unknown", "Không xác định");

    private final String standardName;
    private final String description;

    Encoding(String standardName, String description) {
        this.standardName = standardName;
        this.description = description;
    }

    public static Encoding fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UTF_8;
        }
        
        try {
            return Encoding.valueOf(value.trim().toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid encoding '" + value + "', returning UTF_8");
            return UTF_8;
        }
    }
}
