package com.devgo2003.docgo.repository_service.common.util;

import com.devgo2003.docgo.repository_service.enums.*;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class để parse và convert enums
 * Hỗ trợ cả Strict (5) và Lenient (34) modes
 * Total: 39 enums + 1 utils = 40 files
 */
@Slf4j
public class EnumUtils {

    // ==================== STRICT ENUMS (5) ====================
    
    public static Currency parseCurrency(String value) {
        return Currency.fromString(value);
    }

    public static ContractType parseContractType(String value) {
        return ContractType.fromString(value);
    }

    public static DocumentType parseDocumentType(String value) {
        return DocumentType.fromString(value);
    }

    public static HttpStatusCode parseHttpStatusCode(String value) {
        return HttpStatusCode.fromString(value);
    }

    public static HttpStatusCode parseHttpStatusCode(Integer value) {
        return HttpStatusCode.fromInt(value);
    }

    public static ResponseMessage parseResponseMessage(String value) {
        return ResponseMessage.fromString(value);
    }

    // ==================== LENIENT ENUMS (34) ====================

    // Metadata (9)
    public static LanguageCode parseLanguageCode(String value) {
        return LanguageCode.fromString(value);
    }

    public static RegionCode parseRegionCode(String value) {
        return RegionCode.fromString(value);
    }

    public static MimeType parseMimeType(String value) {
        return MimeType.fromString(value);
    }

    public static DublinCoreFormat parseDublinCoreFormat(String value) {
        return DublinCoreFormat.fromString(value);
    }

    public static PdfAIdPart parsePdfAIdPart(Integer value) {
        return PdfAIdPart.fromInt(value);
    }

    public static PdfAIdPart parsePdfAIdPart(String value) {
        return PdfAIdPart.fromString(value);
    }

    public static PdfAIdConformance parsePdfAIdConformance(String value) {
        return PdfAIdConformance.fromString(value);
    }

    public static Encoding parseEncoding(String value) {
        return Encoding.fromString(value);
    }

    public static LineEnding parseLineEnding(String value) {
        return LineEnding.fromString(value);
    }

    public static Compression parseCompression(String value) {
        return Compression.fromString(value);
    }

    // Contract (10)
    public static WorkflowStage parseWorkflowStage(String value) {
        return WorkflowStage.fromString(value);
    }

    public static StageStatus parseStageStatus(String value) {
        return StageStatus.fromString(value);
    }

    public static PartyType parsePartyType(String value) {
        return PartyType.fromString(value);
    }

    public static PaymentMethod parsePaymentMethod(String value) {
        return PaymentMethod.fromString(value);
    }

    public static PaymentStatus parsePaymentStatus(String value) {
        return PaymentStatus.fromString(value);
    }

    public static Priority parsePriority(String value) {
        return Priority.fromString(value);
    }

    public static Confidentiality parseConfidentiality(String value) {
        return Confidentiality.fromString(value);
    }

    public static RiskLevel parseRiskLevel(String value) {
        return RiskLevel.fromString(value);
    }

    public static RiskType parseRiskType(String value) {
        return RiskType.fromString(value);
    }

    public static ComplianceStatus parseComplianceStatus(String value) {
        return ComplianceStatus.fromString(value);
    }

    // Content (7)
    public static OcrStatus parseOcrStatus(String value) {
        return OcrStatus.fromString(value);
    }

    public static OcrEngine parseOcrEngine(String value) {
        return OcrEngine.fromString(value);
    }

    public static ExtractionStatus parseExtractionStatus(String value) {
        return ExtractionStatus.fromString(value);
    }

    public static ExtractionMethod parseExtractionMethod(String value) {
        return ExtractionMethod.fromString(value);
    }

    public static SummarizationStatus parseSummarizationStatus(String value) {
        return SummarizationStatus.fromString(value);
    }

    public static ProcessingStatus parseProcessingStatus(String value) {
        return ProcessingStatus.fromString(value);
    }

    public static JsonAnalysisStatus parseJsonAnalysisStatus(String value) {
        return JsonAnalysisStatus.fromString(value);
    }

    // Overview/Audit/Storage (8)
    public static DocumentStatus parseDocumentStatus(String value) {
        return DocumentStatus.fromString(value);
    }

    public static ChangeType parseChangeType(String value) {
        return ChangeType.fromString(value);
    }

    public static AuditAction parseAuditAction(String value) {
        return AuditAction.fromString(value);
    }

    public static AccessAction parseAccessAction(String value) {
        return AccessAction.fromString(value);
    }

    public static S3Region parseS3Region(String value) {
        return S3Region.fromString(value);
    }

    public static Encryption parseEncryption(String value) {
        return Encryption.fromString(value);
    }

    public static ReminderType parseReminderType(String value) {
        return ReminderType.fromString(value);
    }

    public static ReminderStatus parseReminderStatus(String value) {
        return ReminderStatus.fromString(value);
    }

    // ==================== SAFE PARSING ====================

    public static Currency parseCurrencySafe(String value) {
        try {
            return Currency.fromString(value);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse currency: {}", value);
            return null;
        }
    }

    public static ContractType parseContractTypeSafe(String value) {
        try {
            return ContractType.fromString(value);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse contract type: {}", value);
            return null;
        }
    }

    // ==================== VALIDATION ====================

    public static boolean isUnknown(DocumentStatus status) {
        return status == DocumentStatus.UNKNOWN;
    }

    public static boolean isUnknown(DocumentType type) {
        return type == DocumentType.UNKNOWN;
    }

    public static boolean isValid(DocumentStatus status) {
        return status != null && status != DocumentStatus.UNKNOWN;
    }

    public static boolean isValid(DocumentType type) {
        return type != null && type != DocumentType.UNKNOWN;
    }

    // ==================== CONVERSION ====================

    public static String toString(Enum<?> enumValue) {
        return enumValue != null ? enumValue.name() : null;
    }

    public static int getStatusCode(ResponseMessage message) {
        return message != null ? message.getHttpStatus().getCode() : 500;
    }

    public static ResponseMessage toResponseMessage(HttpStatusCode statusCode) {
        return ResponseMessage.fromHttpStatus(statusCode);
    }
}
