package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum phương thức mã hóa - LENIENT MODE
 * Default: AES_256 (security cao nhất)
 */
@Getter
public enum Encryption {
    NONE("None", "Không mã hóa", 0),
    AES_128("AES-128", "AES 128-bit", 128),
    AES_192("AES-192", "AES 192-bit", 192),
    AES_256("AES-256", "AES 256-bit", 256),
    RSA_2048("RSA-2048", "RSA 2048-bit", 2048),
    RSA_4096("RSA-4096", "RSA 4096-bit", 4096),
    CHACHA20("ChaCha20", "ChaCha20-Poly1305", 256),
    TWOFISH("Twofish", "Twofish Encryption", 256),
    BLOWFISH("Blowfish", "Blowfish Encryption", 448),
    DES("DES", "DES (Legacy)", 56),
    TRIPLE_DES("3DES", "Triple DES", 168),
    UNKNOWN("Unknown", "Không xác định", 0);

    private final String algorithmName;
    private final String description;
    private final int keySize;

    Encryption(String algorithmName, String description, int keySize) {
        this.algorithmName = algorithmName;
        this.description = description;
        this.keySize = keySize;
    }

    public static Encryption fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return AES_256;
        }
        
        try {
            return Encryption.valueOf(value.trim().toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid encryption '" + value + "', returning AES_256");
            return AES_256;
        }
    }
}
