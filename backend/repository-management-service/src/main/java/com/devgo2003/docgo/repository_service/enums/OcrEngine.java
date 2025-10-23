package com.devgo2003.docgo.repository_service.enums;

import lombok.Getter;

/**
 * Enum OCR engine - LENIENT MODE
 * Default: TESSERACT
 */
@Getter
public enum OcrEngine {
    GEMINI_VISION("Gemini Vision API", "Gemini Vision", true),
    TESSERACT("Tesseract OCR", "Tesseract", true),
    TESSERACT_FALLBACK("Tesseract Fallback", "Tesseract Dự phòng", true),
    PADDLEOCR("PaddleOCR", "PaddleOCR", true),
    GOOGLE_VISION("Google Cloud Vision", "Google Vision", true),
    AWS_TEXTRACT("AWS Textract", "AWS Textract", true),
    AZURE_OCR("Azure Computer Vision", "Azure OCR", true),
    ABBYY("ABBYY FineReader", "ABBYY", true),
    EASYOCR("EasyOCR", "EasyOCR", true),
    UNKNOWN("Unknown Engine", "Engine không xác định", false);

    private final String englishName;
    private final String vietnameseName;
    private final boolean isAvailable;

    OcrEngine(String englishName, String vietnameseName, boolean isAvailable) {
        this.englishName = englishName;
        this.vietnameseName = vietnameseName;
        this.isAvailable = isAvailable;
    }

    public static OcrEngine fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return TESSERACT;
        }
        
        try {
            return OcrEngine.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("WARN: Invalid OCR engine '" + value + "', returning TESSERACT");
            return TESSERACT;
        }
    }
}
