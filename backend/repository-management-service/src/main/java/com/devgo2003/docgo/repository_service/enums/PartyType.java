package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum loại bên tham gia hợp đồng - LENIENT MODE
 * Default: CLIENT
 */
@Getter
public enum PartyType {
    CLIENT("Client", "Khách hàng"),
    VENDOR("Vendor", "Nhà cung cấp"),
    PARTNER("Partner", "Đối tác"),
    GUARANTOR("Guarantor", "Người bảo lãnh"),
    CONTRACTOR("Contractor", "Nhà thầu"),
    SUPPLIER("Supplier", "Nhà cung ứng"),
    CONSULTANT("Consultant", "Tư vấn"),
    EMPLOYEE("Employee", "Nhân viên"),
    INVESTOR("Investor", "Nhà đầu tư"),
    GOVERNMENT("Government", "Chính phủ"),
    OTHER("Other", "Khác"),
    UNKNOWN("Unknown Party", "Bên không xác định");

    private final String englishName;
    private final String vietnameseName;

    PartyType(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    public static PartyType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return CLIENT;
        }
        
        try {
            return PartyType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid party type '" + value + "', returning CLIENT");
            return CLIENT;
        }
    }
}
