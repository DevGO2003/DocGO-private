package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum mã ngôn ngữ (ISO 639-1) - LENIENT MODE
 * Default: UNKNOWN
 */
@Getter
public enum LanguageCode {
    VI("vi", "Vietnamese", "Tiếng Việt"),
    EN("en", "English", "Tiếng Anh"),
    FR("fr", "French", "Tiếng Pháp"),
    ZH("zh", "Chinese", "Tiếng Trung"),
    JA("ja", "Japanese", "Tiếng Nhật"),
    KO("ko", "Korean", "Tiếng Hàn"),
    DE("de", "German", "Tiếng Đức"),
    ES("es", "Spanish", "Tiếng Tây Ban Nha"),
    RU("ru", "Russian", "Tiếng Nga"),
    TH("th", "Thai", "Tiếng Thái"),
    UNKNOWN("unknown", "Unknown", "Không xác định");

    private final String code;
    private final String englishName;
    private final String nativeName;

    LanguageCode(String code, String englishName, String nativeName) {
        this.code = code;
        this.englishName = englishName;
        this.nativeName = nativeName;
    }

    public static LanguageCode fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UNKNOWN;
        }
        
        try {
            return LanguageCode.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid language code '" + value + "', returning UNKNOWN");
            return UNKNOWN;
        }
    }
}
