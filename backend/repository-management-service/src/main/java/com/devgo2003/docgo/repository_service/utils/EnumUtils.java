package com.devgo2003.docgo.repository_service.utils;

import com.devgo2003.docgo.repository_service.enums.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class for safe enum parsing with UNKNOWN fallback
 * 
 * Strategy:
 * - Strict enums: throw IllegalArgumentException if invalid
 * - Lenient enums: return UNKNOWN if invalid
 */
public class EnumUtils {
    
    private static final Logger log = LoggerFactory.getLogger(EnumUtils.class);
    
    // ==================== STRICT ENUMS (Must be valid) ====================
    
    /**
     * Parse Currency - STRICT (throws exception if invalid)
     */
    public static Currency parseCurrency(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Currency cannot be null or empty");
        }
        try {
            return Currency.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.error("Invalid currency value: {}", value);
            throw new IllegalArgumentException("Invalid currency: " + value + ". Must be one of: USD, VND, EUR, JPY");
        }
    }
    
    /**
     * Parse ContractType - STRICT (throws exception if invalid)
     */
    public static ContractType parseContractType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null; // Allow null for optional field
        }
        try {
            return ContractType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.error("Invalid contract type: {}", value);
            throw new IllegalArgumentException("Invalid contract type: " + value);
        }
    }
    
    /**
     * Parse DocumentType - STRICT (throws exception if invalid)
     */
    public static DocumentType parseDocumentType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DocumentType.UNKNOWN;
        }
        try {
            return DocumentType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.error("Invalid document type: {}", value);
            throw new IllegalArgumentException("Invalid document type: " + value);
        }
    }
    
    // ==================== LENIENT ENUMS (Return UNKNOWN if invalid) ====================
    
    /**
     * Parse DocumentStatus - LENIENT (returns UNKNOWN if invalid)
     */
    public static DocumentStatus parseDocumentStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DocumentStatus.UNKNOWN;
        }
        try {
            return DocumentStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown document status: {}, returning UNKNOWN", value);
            return DocumentStatus.UNKNOWN;
        }
    }
    
    /**
     * Parse Priority - LENIENT (returns UNKNOWN if invalid)
     */
    public static Priority parsePriority(String value) {
        if (value == null || value.trim().isEmpty()) {
            return Priority.UNKNOWN;
        }
        try {
            return Priority.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown priority: {}, returning UNKNOWN", value);
            return Priority.UNKNOWN;
        }
    }
    
    /**
     * Parse Confidentiality - LENIENT (returns PUBLIC if invalid)
     */
    public static Confidentiality parseConfidentiality(String value) {
        if (value == null || value.trim().isEmpty()) {
            return Confidentiality.PUBLIC;
        }
        try {
            return Confidentiality.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown confidentiality: {}, returning PUBLIC", value);
            return Confidentiality.PUBLIC;
        }
    }
    
    /**
     * Parse RiskLevel - LENIENT (returns MEDIUM if invalid)
     */
    public static RiskLevel parseRiskLevel(String value) {
        if (value == null || value.trim().isEmpty()) {
            return RiskLevel.MEDIUM;
        }
        try {
            return RiskLevel.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown risk level: {}, returning MEDIUM", value);
            return RiskLevel.MEDIUM;
        }
    }
    
    /**
     * Parse WorkflowStage - LENIENT (returns DRAFT if invalid)
     */
    public static WorkflowStage parseWorkflowStage(String value) {
        if (value == null || value.trim().isEmpty()) {
            return WorkflowStage.DRAFT;
        }
        try {
            return WorkflowStage.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown workflow stage: {}, returning DRAFT", value);
            return WorkflowStage.DRAFT;
        }
    }
    
    /**
     * Parse StageStatus - LENIENT (returns PENDING if invalid)
     */
    public static StageStatus parseStageStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return StageStatus.PENDING;
        }
        try {
            return StageStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown stage status: {}, returning PENDING", value);
            return StageStatus.PENDING;
        }
    }
    
    /**
     * Parse PartyType - LENIENT (returns CLIENT if invalid)
     */
    public static PartyType parsePartyType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PartyType.CLIENT;
        }
        try {
            return PartyType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown party type: {}, returning CLIENT", value);
            return PartyType.CLIENT;
        }
    }
    
    /**
     * Parse PaymentMethod - LENIENT (returns BANK_TRANSFER if invalid)
     */
    public static PaymentMethod parsePaymentMethod(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PaymentMethod.BANK_TRANSFER;
        }
        try {
            return PaymentMethod.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown payment method: {}, returning BANK_TRANSFER", value);
            return PaymentMethod.BANK_TRANSFER;
        }
    }
    
    /**
     * Parse PaymentStatus - LENIENT (returns PENDING if invalid)
     */
    public static PaymentStatus parsePaymentStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return PaymentStatus.PENDING;
        }
        try {
            return PaymentStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown payment status: {}, returning PENDING", value);
            return PaymentStatus.PENDING;
        }
    }
    
    /**
     * Parse OcrStatus - LENIENT (returns SKIPPED if invalid)
     */
    public static OcrStatus parseOcrStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OcrStatus.SKIPPED;
        }
        try {
            return OcrStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown OCR status: {}, returning SKIPPED", value);
            return OcrStatus.SKIPPED;
        }
    }
    
    /**
     * Parse OcrEngine - LENIENT (returns TESSERACT if invalid)
     */
    public static OcrEngine parseOcrEngine(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OcrEngine.TESSERACT;
        }
        try {
            return OcrEngine.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown OCR engine: {}, returning TESSERACT", value);
            return OcrEngine.TESSERACT;
        }
    }
    
    /**
     * Parse ExtractionStatus - LENIENT (returns FAILED if invalid)
     */
    public static ExtractionStatus parseExtractionStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ExtractionStatus.FAILED;
        }
        try {
            return ExtractionStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown extraction status: {}, returning FAILED", value);
            return ExtractionStatus.FAILED;
        }
    }
    
    /**
     * Parse ExtractionMethod - LENIENT (returns HYBRID if invalid)
     */
    public static ExtractionMethod parseExtractionMethod(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ExtractionMethod.HYBRID;
        }
        try {
            return ExtractionMethod.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown extraction method: {}, returning HYBRID", value);
            return ExtractionMethod.HYBRID;
        }
    }
    
    /**
     * Parse RiskType - LENIENT (returns TECHNICAL if invalid)
     */
    public static RiskType parseRiskType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return RiskType.TECHNICAL;
        }
        try {
            return RiskType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown risk type: {}, returning TECHNICAL", value);
            return RiskType.TECHNICAL;
        }
    }
    
    /**
     * Parse ReminderType - LENIENT (returns PAYMENT_DUE if invalid)
     */
    public static ReminderType parseReminderType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ReminderType.PAYMENT_DUE;
        }
        try {
            return ReminderType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown reminder type: {}, returning PAYMENT_DUE", value);
            return ReminderType.PAYMENT_DUE;
        }
    }
    
    /**
     * Parse ReminderStatus - LENIENT (returns PENDING if invalid)
     */
    public static ReminderStatus parseReminderStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ReminderStatus.PENDING;
        }
        try {
            return ReminderStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown reminder status: {}, returning PENDING", value);
            return ReminderStatus.PENDING;
        }
    }
    
    /**
     * Parse SummarizationStatus - LENIENT (returns SKIPPED if invalid)
     */
    public static SummarizationStatus parseSummarizationStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return SummarizationStatus.SKIPPED;
        }
        try {
            return SummarizationStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown summarization status: {}, returning SKIPPED", value);
            return SummarizationStatus.SKIPPED;
        }
    }
    
    /**
     * Parse ProcessingStatus - LENIENT (returns COMPLETED if invalid)
     */
    public static ProcessingStatus parseProcessingStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ProcessingStatus.COMPLETED;
        }
        try {
            return ProcessingStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown processing status: {}, returning COMPLETED", value);
            return ProcessingStatus.COMPLETED;
        }
    }
    
    /**
     * Parse ChangeType - LENIENT (returns UPDATE if invalid)
     */
    public static ChangeType parseChangeType(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ChangeType.UPDATE;
        }
        try {
            return ChangeType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown change type: {}, returning UPDATE", value);
            return ChangeType.UPDATE;
        }
    }
    
    /**
     * Parse AuditAction - LENIENT (returns UPDATE if invalid)
     */
    public static AuditAction parseAuditAction(String value) {
        if (value == null || value.trim().isEmpty()) {
            return AuditAction.UPDATE;
        }
        try {
            return AuditAction.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown audit action: {}, returning UPDATE", value);
            return AuditAction.UPDATE;
        }
    }
    
    /**
     * Parse AccessAction - LENIENT (returns VIEW if invalid)
     */
    public static AccessAction parseAccessAction(String value) {
        if (value == null || value.trim().isEmpty()) {
            return AccessAction.VIEW;
        }
        try {
            return AccessAction.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown access action: {}, returning VIEW", value);
            return AccessAction.VIEW;
        }
    }
    
    /**
     * Parse Encoding - LENIENT (returns UTF_8 if invalid)
     */
    public static Encoding parseEncoding(String value) {
        if (value == null || value.trim().isEmpty()) {
            return Encoding.UTF_8;
        }
        try {
            return Encoding.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown encoding: {}, returning UTF_8", value);
            return Encoding.UTF_8;
        }
    }
    
    /**
     * Parse LineEnding - LENIENT (returns LF if invalid)
     */
    public static LineEnding parseLineEnding(String value) {
        if (value == null || value.trim().isEmpty()) {
            return LineEnding.LF;
        }
        try {
            return LineEnding.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown line ending: {}, returning LF", value);
            return LineEnding.LF;
        }
    }
    
    /**
     * Parse Compression - LENIENT (returns NONE if invalid)
     */
    public static Compression parseCompression(String value) {
        if (value == null || value.trim().isEmpty()) {
            return Compression.NONE;
        }
        try {
            return Compression.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown compression: {}, returning NONE", value);
            return Compression.NONE;
        }
    }
    
    /**
     * Parse Encryption - LENIENT (returns AES_256 if invalid)
     */
    public static Encryption parseEncryption(String value) {
        if (value == null || value.trim().isEmpty()) {
            return Encryption.AES_256;
        }
        try {
            return Encryption.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown encryption: {}, returning AES_256", value);
            return Encryption.AES_256;
        }
    }
    
    /**
     * Parse S3Region - LENIENT (returns US_EAST_1 if invalid)
     */
    public static S3Region parseS3Region(String value) {
        if (value == null || value.trim().isEmpty()) {
            return S3Region.US_EAST_1;
        }
        try {
            // Handle special case for S3Region enum values
            String upperValue = value.toUpperCase().trim();
            switch (upperValue) {
                case "US-EAST-1":
                    return S3Region.US_EAST_1;
                case "US-WEST-2":
                    return S3Region.US_WEST_2;
                case "EU-WEST-1":
                    return S3Region.EU_WEST_1;
                case "AP-SOUTHEAST-1":
                    return S3Region.AP_SOUTHEAST_1;
                default:
                    return S3Region.US_EAST_1; // Default fallback
            }
        } catch (Exception e) {
            log.warn("Unknown S3 region: {}, returning US_EAST_1", value);
            return S3Region.US_EAST_1;
        }
    }
}
