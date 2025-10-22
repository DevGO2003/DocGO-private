package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum loại hợp đồng - STRICT MODE (FIXED theo Document v3)
 * Không có UNKNOWN - Throw exception nếu invalid
 * Quan trọng cho phân loại và xử lý hợp đồng
 */
@Getter
public enum ContractType {
    SOFTWARE_DEVELOPMENT("Software Development", "Phát triển phần mềm"),
    SERVICE_AGREEMENT("Service Agreement", "Thỏa thuận dịch vụ"),
    PURCHASE_AGREEMENT("Purchase Agreement", "Thỏa thuận mua bán"),
    PARTNERSHIP_AGREEMENT("Partnership Agreement", "Thỏa thuận hợp tác"),
    EMPLOYMENT_CONTRACT("Employment Contract", "Hợp đồng lao động"),
    SALES_CONTRACT("Sales Contract", "Hợp đồng bán hàng"),
    LEASE_AGREEMENT("Lease Agreement", "Thỏa thuận thuê"),
    LICENSE_AGREEMENT("License Agreement", "Thỏa thuận cấp phép"),
    NON_DISCLOSURE_AGREEMENT("Non-Disclosure Agreement", "Thỏa thuận bảo mật"),
    CONSULTING_AGREEMENT("Consulting Agreement", "Thỏa thuận tư vấn"),
    OTHERS("Others", "Khác");

    private final String englishName;
    private final String vietnameseName;

    ContractType(String englishName, String vietnameseName) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
    }

    /**
     * Parse từ string - STRICT MODE
     * Throw IllegalArgumentException nếu không tìm thấy
     */
    public static ContractType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Contract type cannot be null or empty");
        }
        
        try {
            return ContractType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid contract type: " + value,
                e
            );
        }
    }
}
