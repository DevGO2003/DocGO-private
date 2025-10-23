package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum MIME Type - LENIENT MODE
 * Default: APPLICATION_OCTET_STREAM
 */
@Getter
public enum MimeType {
    APPLICATION_PDF("application/pdf", "PDF Document", ".pdf"),
    TEXT_PLAIN("text/plain", "Plain Text", ".txt"),
    APPLICATION_JSON("application/json", "JSON File", ".json"),
    APPLICATION_XML("application/xml", "XML File", ".xml"),
    APPLICATION_MSWORD("application/msword", "Microsoft Word", ".doc"),
    APPLICATION_DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "MS Word (DOCX)", ".docx"),
    APPLICATION_EXCEL("application/vnd.ms-excel", "Microsoft Excel", ".xls"),
    APPLICATION_XLSX("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "MS Excel (XLSX)", ".xlsx"),
    IMAGE_JPEG("image/jpeg", "JPEG Image", ".jpg"),
    IMAGE_PNG("image/png", "PNG Image", ".png"),
    IMAGE_GIF("image/gif", "GIF Image", ".gif"),
    APPLICATION_ZIP("application/zip", "ZIP Archive", ".zip"),
    APPLICATION_OCTET_STREAM("application/octet-stream", "Binary Stream", "");

    private final String mimeType;
    private final String description;
    private final String extension;

    MimeType(String mimeType, String description, String extension) {
        this.mimeType = mimeType;
        this.description = description;
        this.extension = extension;
    }

    public static MimeType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return APPLICATION_OCTET_STREAM;
        }
        
        // Try exact match with mimeType field
        for (MimeType type : values()) {
            if (type.mimeType.equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        
        // Try enum name match
        try {
            return MimeType.valueOf(value.trim().toUpperCase().replace("/", "_").replace(".", "_").replace("-", "_"));
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid MIME type '" + value + "', returning APPLICATION_OCTET_STREAM");
            return APPLICATION_OCTET_STREAM;
        }
    }
}
