package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum đơn vị tiền tệ (ISO 4217) - STRICT MODE
 * Không có UNKNOWN - Throw exception nếu invalid
 * Ảnh hưởng trực tiếp tới tính toán tài chính
 */
@Getter
public enum Currency {
    USD("US Dollar", "$"),
    VND("Vietnamese Dong", "₫"),
    EUR("Euro", "€"),
    JPY("Japanese Yen", "¥"),
    GBP("British Pound", "£"),
    CNY("Chinese Yuan", "¥"),
    KRW("South Korean Won", "₩"),
    SGD("Singapore Dollar", "S$"),
    THB("Thai Baht", "฿");

    private final String fullName;
    private final String symbol;

    Currency(String fullName, String symbol) {
        this.fullName = fullName;
        this.symbol = symbol;
    }

    /**
     * Parse từ string - STRICT MODE
     * Throw IllegalArgumentException nếu không tìm thấy
     */
    public static Currency fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Currency value cannot be null or empty");
        }
        
        try {
            return Currency.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid currency: " + value + ". Must be one of: USD, VND, EUR, JPY, GBP, CNY, KRW, SGD, THB",
                e
            );
        }
    }
}
