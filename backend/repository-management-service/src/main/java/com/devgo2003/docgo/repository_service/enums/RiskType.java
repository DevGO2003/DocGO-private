package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum loại rủi ro - LENIENT MODE
 * Default: TECHNICAL
 */
@Getter
public enum RiskType {
    TECHNICAL("Technical Risk", "Rủi ro kỹ thuật"),
    SCHEDULE("Schedule Risk", "Rủi ro tiến độ"),
    FINANCIAL("Financial Risk", "Rủi ro tài chính"),
    LEGAL("Legal Risk", "Rủi ro pháp lý"),
    OPERATIONAL("Operational Risk", "Rủi ro vận hành"),
    COMPLIANCE("Compliance Risk", "Rủi ro tuân thủ"),
    REPUTATION("Reputation Risk", "Rủi ro danh tiếng"),
    SECURITY("Security Risk", "Rủi ro bảo mật"),
    STRATEGIC("Strategic Risk", "Rủi ro chiến lược"),
    MARKET("Market Risk", "Rủi ro thị trường"),
    OTHER("Other Risk", "Rủi ro khác"),
    UNKNOWN("Unknown Risk Type", "Loại rủi ro không xác định");

    private final String englishName;
    private final String vietnameseName;

    RiskType(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static RiskType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return TECHNICAL;
        }
        
        try {
            return RiskType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid risk type '" + value + "', returning TECHNICAL");
            return TECHNICAL;
        }
    }
}
