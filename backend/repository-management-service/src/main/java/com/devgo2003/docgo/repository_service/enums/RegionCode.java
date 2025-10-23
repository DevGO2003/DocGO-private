package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum mã khu vực (ISO 3166-1) - LENIENT MODE
 * Default: UNKNOWN
 */
@Getter
public enum RegionCode {
    VN("VN", "Vietnam", "Việt Nam"),
    US("US", "United States", "Hoa Kỳ"),
    EU("EU", "European Union", "Liên minh châu Âu"),
    APAC("APAC", "Asia Pacific", "Châu Á Thái Bình Dương"),
    CN("CN", "China", "Trung Quốc"),
    JP("JP", "Japan", "Nhật Bản"),
    KR("KR", "South Korea", "Hàn Quốc"),
    SG("SG", "Singapore", "Singapore"),
    TH("TH", "Thailand", "Thái Lan"),
    GB("GB", "United Kingdom", "Vương quốc Anh"),
    FR("FR", "France", "Pháp"),
    DE("DE", "Germany", "Đức"),
    UNKNOWN("UNKNOWN", "Unknown Region", "Khu vực không xác định");

    private final String code;
    private final String englishName;
    private final String nativeName;

    RegionCode(String code, String englishName, String nativeName) {
        this.code = code;
        this.englishName = englishName;
        this.nativeName = nativeName;
    }

    public static RegionCode fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return UNKNOWN;
        }
        
        try {
            return RegionCode.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid region code '" + value + "', returning UNKNOWN");
            return UNKNOWN;
        }
    }
}
