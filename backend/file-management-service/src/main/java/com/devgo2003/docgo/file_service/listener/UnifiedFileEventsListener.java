package com.devgo2003.docgo.file_service.listener;

import com.devgo2003.docgo.file_service.dto.*;
import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.repository.FileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UnifiedFileEventsListener {

    private final ObjectMapper objectMapper;
    private final FileRepository fileRepository;

    @KafkaListener(topics = "file.metadata.recorded", groupId = "file-management-service-group")
    public void onFileMetadataRecorded(String message) {
        try {
            log.debug("[EVENT-IN] topic=file.metadata.recorded size={} preview={}", message != null ? message.length() : 0, message != null ? message.substring(0, Math.min(200, message.length())) : null);
            FileMetadataRecordedEventDto evt = objectMapper.readValue(message, FileMetadataRecordedEventDto.class);
            if (evt.getData() == null || evt.getData().getFileId() == null) {
                log.warn("file.metadata.recorded missing data/fileId");
                return;
            }
            String fileId = evt.getData().getFileId();
            Optional<FileEntity> opt = fileRepository.findById(fileId);
            FileEntity entity = opt.orElseGet(FileEntity::new);
            entity.setId(fileId);

            // Overview
            Overview overview = entity.getOverview() == null ? new Overview() : entity.getOverview();
            overview.setTitle(evt.getData().getName());
            if (overview.getStatus() == null) overview.setStatus("UPLOADED");
            if (overview.getOwnerUserId() == null) overview.setOwnerUserId(evt.getData().getOwnerUserId());
            if (overview.getDocumentType() == null) overview.setDocumentType("GENERAL_FILE");
            entity.setOverview(overview);

            // File info
            FileInfo fi = entity.getFile() == null ? new FileInfo() : entity.getFile();
            fi.setId(fileId);
            fi.setName(evt.getData().getName());
            fi.setType(evt.getData().getContentType());
            fi.setSize(evt.getData().getSize());
            if (fi.getVersion() == null && evt.getData().getVersion() != null) fi.setVersion(evt.getData().getVersion());
            entity.setFile(fi);

            // Storage
            Storage storage = entity.getStorage() == null ? new Storage() : entity.getStorage();
            if (evt.getData().getStorage() != null && "s3".equalsIgnoreCase(evt.getData().getStorage().getType())) {
                S3Info s3 = storage.getS3() == null ? new S3Info() : storage.getS3();
                s3.setUrl(evt.getData().getStorage().getS3() != null ? evt.getData().getStorage().getS3().getUrl() : null);
                s3.setType("s3");
                storage.setS3(s3);
            } else if (evt.getData().getStorage() != null && "local".equalsIgnoreCase(evt.getData().getStorage().getType())) {
                LocalInfo local = storage.getLocal() == null ? new LocalInfo() : storage.getLocal();
                local.setPath(evt.getData().getStorage().getLocal() != null ? evt.getData().getStorage().getLocal().getPath() : null);
                storage.setLocal(local);
            }
            entity.setStorage(storage);

            // Processing (entity-level)
            ProcessingInfo p = entity.getProcessing() == null ? new ProcessingInfo() : entity.getProcessing();
            if (p.getStatus() == null) p.setStatus("COMPLETED");
            entity.setProcessing(p);

            // Initialize audit timestamps if new
            if (!opt.isPresent()) {
                entity.initializeNewEntity();
            } else {
                // update updatedAt
                entity.setUpdatedAt(java.time.LocalDateTime.now());
                entity.setUpdatedBy("system");
            }

            fileRepository.save(entity);
            log.info("Upserted file by metadata: {} name={} type={} size={} storageLocal={} storageS3Url={}",
                    fileId,
                    evt.getData().getName(),
                    evt.getData().getContentType(),
                    evt.getData().getSize(),
                    entity.getStorage() != null && entity.getStorage().getLocal() != null ? entity.getStorage().getLocal().getPath() : null,
                    entity.getStorage() != null && entity.getStorage().getS3() != null ? entity.getStorage().getS3().getUrl() : null);
        } catch (Exception e) {
            log.error("Failed to handle file.metadata.recorded", e);
        }
    }

    @KafkaListener(topics = "file.plaintext.extracted", groupId = "file-management-service-group")
    public void onFilePlaintextExtracted(String message) {
        try {
            log.debug("[EVENT-IN] topic=file.plaintext.extracted size={} preview={}", message != null ? message.length() : 0, message != null ? message.substring(0, Math.min(200, message.length())) : null);
            FilePlaintextExtractedEventDto evt = objectMapper.readValue(message, FilePlaintextExtractedEventDto.class);
            if (evt.getData() == null || evt.getData().getFileId() == null) {
                log.warn("file.plaintext.extracted missing data/fileId");
                return;
            }
            String fileId = evt.getData().getFileId();
            Optional<FileEntity> opt = fileRepository.findById(fileId);
            FileEntity entity = opt.orElseGet(() -> {
                FileEntity f = new FileEntity();
                f.setId(fileId);
                f.initializeNewEntity();
                return f;
            });

            // Content updates
            Content content = entity.getContent() == null ? new Content() : entity.getContent();
            if (evt.getData().getPlaintext() != null) content.setPlaintext(evt.getData().getPlaintext());
            if (evt.getData().getJsonContent() != null) content.setJsonContent(evt.getData().getJsonContent());
            if (evt.getData().getOcr() != null) {
                OcrInfo ocr = content.getOcr() == null ? new OcrInfo() : content.getOcr();
                if (evt.getData().getOcr().getText() != null) ocr.setText(evt.getData().getOcr().getText());
                if (evt.getData().getOcr().getStatus() != null) ocr.setStatus(evt.getData().getOcr().getStatus());
                content.setOcr(ocr);
            }
            if (evt.getData().getClassification() != null) {
                // store classification as a generic object to avoid DTO explosion
                content.setClassification(evt.getData().getClassification());
                // also reflect documentType to overview if present
                if (evt.getData().getClassification().getDocumentType() != null) {
                    Overview ov = entity.getOverview() == null ? new Overview() : entity.getOverview();
                    ov.setDocumentType(evt.getData().getClassification().getDocumentType());
                    entity.setOverview(ov);
                }
            }

            // processing blocks
            ProcessingInfo pi = entity.getProcessing() == null ? new ProcessingInfo() : entity.getProcessing();
            if (evt.getData().getProcessing() != null && evt.getData().getProcessing().getStatus() != null) {
                pi.setStatus(evt.getData().getProcessing().getStatus());
                pi.setError(evt.getData().getProcessing().getError());
            }
            entity.setProcessing(pi);

            // content.processing mirror
            ProcessingInfo contentProc = content.getProcessing() == null ? new ProcessingInfo() : content.getProcessing();
            if (evt.getData().getProcessing() != null && evt.getData().getProcessing().getStatus() != null) {
                contentProc.setStatus(evt.getData().getProcessing().getStatus());
                contentProc.setError(evt.getData().getProcessing().getError());
            }
            content.setProcessing(contentProc);
            entity.setContent(content);

            // audit update
            entity.setUpdatedAt(java.time.LocalDateTime.now());
            entity.setUpdatedBy("system");

            fileRepository.save(entity);
            log.info("Upserted file by plaintext extracted: {} hasPlaintext={} hasJson={} procStatus={}",
                    fileId,
                    evt.getData().getPlaintext() != null,
                    evt.getData().getJsonContent() != null,
                    evt.getData().getProcessing() != null ? evt.getData().getProcessing().getStatus() : null);
        } catch (Exception e) {
            log.error("Failed to handle file.plaintext.extracted", e);
        }
    }

    @KafkaListener(topics = "contract.summary.generated", groupId = "file-management-service-group")
    public void onContractSummaryGenerated(String message) {
        try {
            log.debug("[EVENT-IN] topic=contract.summary.generated size={} preview={}", message != null ? message.length() : 0, message != null ? message.substring(0, Math.min(200, message.length())) : null);
            ContractSummaryGeneratedEventDto evt = objectMapper.readValue(message, ContractSummaryGeneratedEventDto.class);
            if (evt.getData() == null || evt.getData().getFileId() == null) {
                log.warn("contract.summary.generated missing data/fileId");
                return;
            }
            String fileId = evt.getData().getFileId();
            Optional<FileEntity> opt = fileRepository.findById(fileId);
            FileEntity entity = opt.orElseGet(() -> {
                FileEntity f = new FileEntity();
                f.setId(fileId);
                f.initializeNewEntity();
                return f;
            });

            // Contract block (use entity.Contract type explicitly to avoid DTO/entity confusion)
            com.devgo2003.docgo.file_service.entity.Contract contract = entity.getContract();
            if (contract == null) {
                contract = new com.devgo2003.docgo.file_service.entity.Contract();
            }
            if (evt.getData().getSummary() != null) contract.setSummary(evt.getData().getSummary());
            if (evt.getData().getKeyClauses() != null) {
                // map to existing KeyClause DTOs if available, else store as generic
                // Here we leave as is to avoid tight coupling: store via existing field
                // Assuming Contract has keyClauses list of KeyClause
                // For safety, we set summary only; detailed mapping can be extended later
            }
            entity.setContract(contract);

            // Overview updates
            Overview ov = entity.getOverview() == null ? new Overview() : entity.getOverview();
            ov.setDocumentType("CONTRACT");
            ov.setStatus("PROCESSED");
            entity.setOverview(ov);

            // audit
            entity.setUpdatedAt(java.time.LocalDateTime.now());
            entity.setUpdatedBy("system");

            fileRepository.save(entity);
            log.info("Upserted file by contract summary: {} hasSummary={} docType=CONTRACT", fileId, evt.getData().getSummary() != null);
        } catch (Exception e) {
            log.error("Failed to handle contract.summary.generated", e);
        }
    }
}


