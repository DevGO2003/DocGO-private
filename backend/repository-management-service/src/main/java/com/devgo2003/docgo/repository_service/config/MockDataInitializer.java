package com.devgo2003.docgo.repository_service.config;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.*;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MockDataInitializer {

    private final FileRepository fileRepository;

    @Bean
    @Profile({"dev", "local"}) // Chỉ chạy trong dev/local, không chạy production
    public CommandLineRunner initMockData() {
        return args -> {
            log.info("🚀 Initializing mock data for testing...");
            
            // Check if data already exists
            long existingCount = fileRepository.count();
            if (existingCount > 0) {
                log.info("✅ Mock data already exists ({} files). Skipping initialization.", existingCount);
                return;
            }

            // Create mock file with v3 schema structure
            FileEntity mockFile = createMockFileEntity();
            FileEntity savedFile = fileRepository.save(mockFile);
            
            log.info("✅ Mock data created successfully!");
            log.info("📄 File ID: {}", savedFile.getId());
            log.info("🔗 Test URL: http://localhost:8002/api/v1/repository-management-service/files/{}", savedFile.getId());
            log.info("📖 Swagger: http://localhost:8002/docs");
        };
    }

    private FileEntity createMockFileEntity() {
        FileEntity file = new FileEntity();
        
        // Basic fields
        file.setCreatedAt(java.time.Instant.now().toString());
        file.setUpdatedAt(java.time.Instant.now().toString());
        
        // Overview section
        Map<String, Object> overview = new HashMap<>();
        overview.put("title", "Sample Contract Agreement - Testing v3 Schema");
        overview.put("status", "ACTIVE");
        overview.put("documentType", "CONTRACT");
        overview.put("tags", Arrays.asList("contract", "legal", "test", "v3-schema"));
        overview.put("ownerUserId", "user-001");
        overview.put("language", "en");
        overview.put("region", "VN");
        overview.put("isNew", true);
        file.setOverview(overview);

        // Metadata section - 5 sub-sections
        Map<String, Object> metadata = new HashMap<>();
        
        // 1. file
        Map<String, Object> metadataFile = new HashMap<>();
        metadataFile.put("name", "sample-contract.pdf");
        metadataFile.put("mimeType", "application/pdf");
        metadataFile.put("size", 2457600L);
        Map<String, Object> hash = new HashMap<>();
        hash.put("md5", "5d41402abc4b2a76b9719d911017c592");
        hash.put("sha256", "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae");
        metadataFile.put("hash", hash);
        metadata.put("file", metadataFile);
        
        // 2. fileSystem
        Map<String, Object> fileSystem = new HashMap<>();
        fileSystem.put("dateAdded", "2025-10-22T10:30:00Z");
        fileSystem.put("dateModified", "2025-10-22T10:35:00Z");
        fileSystem.put("originalFilename", "contract_agreement_v1.pdf");
        fileSystem.put("originalMD5", "5d41402abc4b2a76b9719d911017c592");
        fileSystem.put("originalFileSize", 2457600L);
        fileSystem.put("originalMimeType", "application/pdf");
        fileSystem.put("archiveMD5", "e4d909c290d0fb1ca068ffaddf22cbd0");
        fileSystem.put("archiveFileSize", 890000L);
        metadata.put("fileSystem", fileSystem);
        
        // 3. originalDocument
        Map<String, Object> originalDocument = new HashMap<>();
        originalDocument.put("dcFormat", "application/pdf");
        originalDocument.put("dcTitle", "Service Agreement Contract");
        originalDocument.put("dcCreator", "Legal Department");
        originalDocument.put("dcDescription", "Service agreement between parties");
        originalDocument.put("dcSubject", "Legal Contract");
        originalDocument.put("xmpCreateDate", "2025-10-20T09:00:00Z");
        originalDocument.put("xmpCreatorTool", "Adobe Acrobat 23.0");
        originalDocument.put("xmpModifyDate", "2025-10-21T15:30:00Z");
        originalDocument.put("xmpMetadataDate", "2025-10-21T15:30:00Z");
        originalDocument.put("xmpDocumentID", "uuid:12345678-1234-5678-1234-567812345678");
        originalDocument.put("xmpInstanceID", "uuid:87654321-4321-8765-4321-876543218765");
        originalDocument.put("pdfKeywords", "contract, agreement, legal");
        originalDocument.put("pdfProducer", "Adobe PDF Library 15.0");
        originalDocument.put("pdfaidPart", 2);
        originalDocument.put("pdfaidConformance", "B");
        metadata.put("originalDocument", originalDocument);
        
        // 4. archivedDocument
        Map<String, Object> archivedDocument = new HashMap<>();
        archivedDocument.put("dcFormat", "application/pdf");
        archivedDocument.put("dcTitle", "Service Agreement Contract");
        archivedDocument.put("dcCreator", "Legal Department");
        archivedDocument.put("pdfProducer", "iText 7.2.5");
        archivedDocument.put("xmpCreateDate", "2025-10-22T10:35:00Z");
        archivedDocument.put("xmpModifyDate", "2025-10-22T10:35:00Z");
        archivedDocument.put("xmpMetadataDate", "2025-10-22T10:35:00Z");
        archivedDocument.put("xmpCreatorTool", "DocGO Archive Tool");
        archivedDocument.put("xmpDocumentID", "uuid:abcdef12-3456-7890-abcd-ef1234567890");
        archivedDocument.put("pdfaidPart", 2);
        archivedDocument.put("pdfaidConformance", "B");
        metadata.put("archivedDocument", archivedDocument);
        
        // 5. technical
        Map<String, Object> technical = new HashMap<>();
        technical.put("encoding", "UTF-8");
        technical.put("lineEnding", "LF");
        technical.put("bom", false);
        technical.put("compression", "DEFLATE");
        technical.put("pages", 15);
        technical.put("wordCount", 3500);
        technical.put("characterCount", 24500);
        metadata.put("technical", technical);
        
        file.setMetadata(metadata);

        // Content section
        Map<String, Object> content = new HashMap<>();
        content.put("plaintext", "This is a sample contract agreement between Party A and Party B...");
        content.put("extractedText", "Full extracted text content from the PDF document...");
        content.put("summary", "Service agreement outlining terms and conditions for software development services.");
        content.put("keyTerms", Arrays.asList("payment terms", "deliverables", "confidentiality", "termination", "intellectual property"));
        
        // OCR
        Map<String, Object> ocr = new HashMap<>();
        ocr.put("text", "Extracted text via OCR...");
        ocr.put("status", "COMPLETED");
        ocr.put("engine", "GEMINI_VISION");
        ocr.put("confidence", 0.98);
        ocr.put("processedAt", "2025-10-22T10:32:00Z");
        ocr.put("processingTime", 2.5);
        Map<String, Object> ocrMetadata = new HashMap<>();
        ocrMetadata.put("language", "en");
        ocrMetadata.put("pageCount", 15);
        ocrMetadata.put("boxCount", 450);
        ocrMetadata.put("averageConfidence", 0.97);
        ocr.put("metadata", ocrMetadata);
        content.put("ocr", ocr);
        
        // Extraction
        Map<String, Object> extraction = new HashMap<>();
        extraction.put("status", "SUCCESS");
        extraction.put("method", "DIRECT");
        extraction.put("extractedAt", "2025-10-22T10:31:00Z");
        extraction.put("characterCount", 24500);
        extraction.put("wordCount", 3500);
        content.put("extraction", extraction);
        
        // Summarization
        Map<String, Object> summarization = new HashMap<>();
        summarization.put("status", "SUCCESS");
        summarization.put("model", "gemini-1.5-flash");
        summarization.put("processedAt", "2025-10-22T10:33:00Z");
        summarization.put("processingTime", 1.8);
        summarization.put("inputTokens", 5000);
        summarization.put("outputTokens", 200);
        content.put("summarization", summarization);
        
        // Classification
        Map<String, Object> classification = new HashMap<>();
        classification.put("isContract", true);
        classification.put("confidence", 0.95);
        classification.put("language", "en");
        content.put("classification", classification);
        
        // Processing
        Map<String, Object> processing = new HashMap<>();
        processing.put("status", "COMPLETED");
        content.put("processing", processing);
        
        content.put("jsonAnalysisStatus", "PARSED");
        file.setContent(content);

        // Storage section
        Map<String, Object> storage = new HashMap<>();
        storage.put("location", "s3://docgo-files/contracts/2025/10/");
        storage.put("backupLocations", Arrays.asList("s3://docgo-backup/contracts/", "local:/backup/contracts/"));
        
        // Retention policy
        Map<String, Object> retentionPolicy = new HashMap<>();
        retentionPolicy.put("duration", "7 years");
        retentionPolicy.put("autoDelete", false);
        retentionPolicy.put("archiveAfter", "1 year");
        storage.put("retentionPolicy", retentionPolicy);
        
        // Access control
        Map<String, Object> accessControl = new HashMap<>();
        accessControl.put("public", false);
        accessControl.put("restrictedUsers", Arrays.asList("user-001", "user-002", "admin-001"));
        accessControl.put("ipWhitelist", Arrays.asList("192.168.1.0/24", "10.0.0.0/8"));
        storage.put("accessControl", accessControl);
        
        // S3
        Map<String, Object> s3 = new HashMap<>();
        s3.put("url", "https://s3.amazonaws.com/docgo-files/contracts/2025/10/sample-contract.pdf");
        s3.put("bucket", "docgo-files");
        s3.put("objectKey", "contracts/2025/10/sample-contract.pdf");
        s3.put("key", "contracts/2025/10/sample-contract.pdf");
        s3.put("region", "us-east-1");
        s3.put("contentType", "application/pdf");
        s3.put("size", 2457600L);
        s3.put("versionId", "v1.0.20251022");
        Map<String, Object> checksum = new HashMap<>();
        checksum.put("md5", "5d41402abc4b2a76b9719d911017c592");
        s3.put("checksum", checksum);
        s3.put("storageClass", "STANDARD");
        storage.put("s3", s3);
        
        // Local
        Map<String, Object> local = new HashMap<>();
        local.put("path", "/opt/docgo/storage/contracts/");
        local.put("filename", "sample-contract.pdf");
        local.put("mimeType", "application/pdf");
        local.put("size", 2457600L);
        local.put("mtime", "2025-10-22T10:35:00Z");
        local.put("revision", "r1");
        storage.put("local", local);
        
        file.setStorage(storage);

        // Security section
        Map<String, Object> security = new HashMap<>();
        security.put("encryption", "AES-256");
        security.put("watermark", true);
        security.put("digitalSignature", true);
        security.put("accessLogging", true);
        Map<String, Object> permissions = new HashMap<>();
        permissions.put("read", Arrays.asList("user-001", "user-002", "admin-001"));
        permissions.put("write", Arrays.asList("user-001", "admin-001"));
        permissions.put("delete", Arrays.asList("admin-001"));
        permissions.put("share", Arrays.asList("user-001", "user-002"));
        security.put("permissions", permissions);
        file.setSecurity(security);

        // Versioning section
        Map<String, Object> versioning = new HashMap<>();
        Map<String, Object> current = new HashMap<>();
        current.put("number", 1);
        current.put("tag", "v1.0");
        versioning.put("current", current);
        
        List<Map<String, Object>> history = new ArrayList<>();
        Map<String, Object> historyItem = new HashMap<>();
        historyItem.put("version", 1);
        historyItem.put("tag", "v1.0");
        historyItem.put("changedAt", "2025-10-22T10:35:00Z");
        historyItem.put("changedBy", "system");
        historyItem.put("changeType", "CREATE");
        historyItem.put("changes", "Initial creation");
        historyItem.put("changedFields", Arrays.asList("all"));
        history.add(historyItem);
        versioning.put("history", history);
        
        file.setVersioning(versioning);

        // Audit section
        Map<String, Object> audit = new HashMap<>();
        audit.put("createdAt", "2025-10-22T10:30:00Z");
        audit.put("createdBy", "system");
        audit.put("updatedAt", "2025-10-22T10:35:00Z");
        audit.put("updatedBy", "system");
        audit.put("isDeleted", false);
        
        List<Map<String, Object>> changeHistory = new ArrayList<>();
        Map<String, Object> changeItem = new HashMap<>();
        changeItem.put("action", "CREATE");
        changeItem.put("timestamp", "2025-10-22T10:30:00Z");
        changeItem.put("actor", "system");
        changeItem.put("details", "Document created via mock data initializer");
        changeItem.put("ipAddress", "127.0.0.1");
        changeItem.put("userAgent", "DocGO/1.0");
        changeHistory.add(changeItem);
        audit.put("changeHistory", changeHistory);
        
        List<Map<String, Object>> accessLog = new ArrayList<>();
        Map<String, Object> accessItem = new HashMap<>();
        accessItem.put("action", "VIEW");
        accessItem.put("timestamp", "2025-10-22T10:35:00Z");
        accessItem.put("actor", "system");
        accessItem.put("ipAddress", "127.0.0.1");
        accessItem.put("userAgent", "DocGO/1.0");
        accessLog.add(accessItem);
        audit.put("accessLog", accessLog);
        
        file.setAudit(audit);

        return file;
    }
}
