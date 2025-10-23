package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum phương thức thanh toán - LENIENT MODE
 * Default: BANK_TRANSFER
 */
@Getter
public enum PaymentMethod {
    BANK_TRANSFER("Bank Transfer", "Chuyển khoản ngân hàng"),
    CREDIT_CARD("Credit Card", "Thẻ tín dụng"),
    WIRE("Wire Transfer", "Chuyển khoản điện tử"),
    CHECK("Check", "Séc"),
    CASH("Cash", "Tiền mặt"),
    DIGITAL_WALLET("Digital Wallet", "Ví điện tử"),
    DEBIT_CARD("Debit Card", "Thẻ ghi nợ"),
    PAYPAL("PayPal", "PayPal"),
    CRYPTO("Cryptocurrency", "Tiền điện tử"),
    INSTALLMENT("Installment", "Trả góp"),
    OTHER("Other", "Khác"),
    UNKNOWN("Unknown Method", "Phương thức không xác định");

    private final String englishName;
    private final String vietnameseName;

    PaymentMethod(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static PaymentMethod fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return BANK_TRANSFER;
        }
        
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid payment method '" + value + "', returning BANK_TRANSFER");
            return BANK_TRANSFER;
        }
    }
}
