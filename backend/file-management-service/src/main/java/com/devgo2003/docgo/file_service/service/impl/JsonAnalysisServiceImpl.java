package com.devgo2003.docgo.file_service.service.impl;

import com.devgo2003.docgo.file_service.dto.JsonAnalysisEventDto;
import com.devgo2003.docgo.file_service.entity.DocumentEntity;
import com.devgo2003.docgo.file_service.enums.DocumentType;
import com.devgo2003.docgo.file_service.enums.ProcessingStatus;
import com.devgo2003.docgo.file_service.repository.DocumentRepository;
import com.devgo2003.docgo.file_service.service.IJsonAnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JsonAnalysisServiceImpl implements IJsonAnalysisService {
    private static final Logger logger = LoggerFactory.getLogger(JsonAnalysisServiceImpl.class);
    
    private final DocumentRepository documentRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public JsonAnalysisServiceImpl(DocumentRepository documentRepository, ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void processJsonAnalysisCompleted(JsonAnalysisEventDto event) {
        try {
            String jobId = event.getData().getJobId();
            Map<String, Object> analysisResult = event.getData().getAnalysisResult();
            
            logger.info("[JSON_ANALYSIS_SERVICE] Processing jobId: {}", jobId);
            
            // Try to find existing document by jobId in metadata
            Optional<DocumentEntity> existingDoc = documentRepository.findAll().stream()
                .filter(doc -> {
                    if (doc.getMetadata() != null && doc.getMetadata() instanceof Map) {
                        Map<String, Object> metadata = (Map<String, Object>) doc.getMetadata();
                        return jobId.equals(metadata.get("jobId"));
                    }
                    return false;
                })
                .findFirst();
            
            DocumentEntity document;
            if (existingDoc.isPresent()) {
                document = existingDoc.get();
                logger.info("[JSON_ANALYSIS_SERVICE] Updating existing document: {}", document.getId());
            } else {
                // Create new document
                document = new DocumentEntity();
                document.setCreatedAt(Instant.now());
                logger.info("[JSON_ANALYSIS_SERVICE] Creating new document for jobId: {}", jobId);
            }
            
            // Map analysis result to document fields
            document.setDocumentType(DocumentType.JSON_DATA);
            document.setProcessingStatus(ProcessingStatus.COMPLETED);
            document.setUpdatedAt(Instant.now());
            
            // Build overview from analysis result
            Map<String, Object> overview = new HashMap<>();
            if (analysisResult != null && analysisResult.containsKey("simulatedAnalysis")) {
                Map<String, Object> simulated = (Map<String, Object>) analysisResult.get("simulatedAnalysis");
                overview.put("documentType", simulated.getOrDefault("documentType", "json_data"));
                overview.put("summary", simulated.getOrDefault("summary", ""));
                overview.put("extractedEntities", simulated.getOrDefault("extractedEntities", new String[]{}));
            } else {
                overview.put("documentType", "json_data");
                overview.put("summary", "JSON analysis completed");
            }
            document.setOverview(overview);
            
            // Store full analysis in content
            Map<String, Object> content = new HashMap<>();
            content.put("originalPayload", analysisResult != null ? analysisResult.get("originalPayload") : null);
            content.put("analysisResult", analysisResult);
            document.setContent(content);
            
            // Update metadata
            Map<String, Object> metadata = document.getMetadata() != null && document.getMetadata() instanceof Map
                ? (Map<String, Object>) document.getMetadata()
                : new HashMap<>();
            metadata.put("jobId", jobId);
            metadata.put("eventId", event.getEventId());
            metadata.put("correlationId", event.getCorrelationId());
            metadata.put("processedAt", Instant.now().toString());
            metadata.put("source", event.getSource());
            document.setMetadata(metadata);
            
            // Build audit trail
            Map<String, Object> audit = new HashMap<>();
            audit.put("createdBy", event.getActor() != null ? event.getActor().getUserId() : "system");
            audit.put("updatedBy", event.getActor() != null ? event.getActor().getUserId() : "system");
            audit.put("createdAt", document.getCreatedAt().toString());
            audit.put("updatedAt", Instant.now().toString());
            document.setAudit(audit);
            
            // Save document
            DocumentEntity saved = documentRepository.save(document);
            logger.info("[JSON_ANALYSIS_SERVICE] Successfully saved document: {} for jobId: {}", 
                saved.getId(), jobId);
            
        } catch (Exception e) {
            logger.error("[JSON_ANALYSIS_SERVICE] Error processing event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process JSON analysis event", e);
        }
    }
}

