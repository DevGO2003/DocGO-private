package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum phương thức nén - LENIENT MODE
 * Default: NONE (không nén)
 */
@Getter
public enum Compression {
    NONE("None", "Không nén", ""),
    GZIP("GZIP", "GZIP Compression", ".gz"),
    DEFLATE("DEFLATE", "DEFLATE Compression", ".deflate"),
    ZIP("ZIP", "ZIP Archive", ".zip"),
    BZIP2("BZIP2", "BZIP2 Compression", ".bz2"),
    XZ("XZ", "XZ Compression", ".xz"),
    LZMA("LZMA", "LZMA Compression", ".lzma"),
    ZSTD("Zstandard", "Zstandard Compression", ".zst"),
    LZ4("LZ4", "LZ4 Compression", ".lz4"),
    UNKNOWN("Unknown", "Không xác định", "");

    private final String name;
    private final String description;
    private final String extension;

    Compression(String name, String description, String extension) {
        this.name = name;
        this.description = description;
        this.extension = extension;
    }

    public static Compression fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return NONE;
        }
        
        try {
            return Compression.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid compression '" + value + "', returning NONE");
            return NONE;
        }
    }
}
