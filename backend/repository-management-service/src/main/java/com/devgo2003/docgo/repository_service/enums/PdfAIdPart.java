package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum PDF/A Part Number - LENIENT MODE
 * Default: PART_1
 */
@Getter
public enum PdfAIdPart {
    PART_1(1, "PDF/A-1", "ISO 19005-1:2005"),
    PART_2(2, "PDF/A-2", "ISO 19005-2:2011"),
    PART_3(3, "PDF/A-3", "ISO 19005-3:2012"),
    UNKNOWN(0, "Unknown", "Unknown");

    private final int partNumber;
    private final String name;
    private final String isoStandard;

    PdfAIdPart(int partNumber, String name, String isoStandard) {
        this.partNumber = partNumber;
        this.name = name;
        this.isoStandard = isoStandard;
    }

    public static PdfAIdPart fromInt(Integer value) {
        if (value == null) {
            return PART_1;
        }
        
        for (PdfAIdPart part : values()) {
            if (part.partNumber == value) {
                return part;
            }
        }
        
        System.err.println("WARN: Invalid PDF/A part '" + value + "', returning PART_1");
        return PART_1;
    }

    public static PdfAIdPart fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PART_1;
        }
        
        try {
            int intValue = Integer.parseInt(value.trim());
            return fromInt(intValue);
        } catch (NumberFormatException e) {
            System.err.println("WARN: Invalid PDF/A part '" + value + "', returning PART_1");
            return PART_1;
        }
    }
}
