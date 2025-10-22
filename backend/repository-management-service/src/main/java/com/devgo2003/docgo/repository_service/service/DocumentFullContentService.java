package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.DocumentFullContentEntity;
import com.devgo2003.docgo.repository_service.repository.DocumentFullContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing large document content using Subset Pattern
 * Stores large text content separately from main document
 */
@Service
public class DocumentFullContentService {
    
    private static final Logger log = LoggerFactory.getLogger(DocumentFullContentService.class);
    private static final long LARGE_CONTENT_THRESHOLD = 5 * 1024 * 1024; // 5MB
    
    @Autowired
    private DocumentFullContentRepository fullContentRepository;
    
    /**
     * Save or update full content for a document
     */
    public void saveFullContent(String documentId, String plaintext, String extractedText, 
                                 List<Map<String, Object>> sections, Map<String, Object> ocr,
                                 Object jsonContent) {
        
        long contentSize = calculateContentSize(plaintext, extractedText, sections, ocr, jsonContent);
        
        DocumentFullContentEntity entity = fullContentRepository.findByDocumentId(documentId)
            .orElse(DocumentFullContentEntity.builder()
                .id(documentId)
                .documentId(documentId)
                .createdAt(LocalDateTime.now())
                .build());
        
        entity.setPlaintext(plaintext);
        entity.setExtractedText(extractedText);
        entity.setSections(sections);
        entity.setOcr(ocr);
        entity.setJsonContent(jsonContent);
        entity.setContentSize(contentSize);
        entity.setUpdatedAt(LocalDateTime.now());
        
        fullContentRepository.save(entity);
        log.info("Saved full content for document {} (size: {} bytes)", documentId, contentSize);
    }
    
    /**
     * Get full content for a document
     */
    public Optional<DocumentFullContentEntity> getFullContent(String documentId) {
        return fullContentRepository.findByDocumentId(documentId);
    }
    
    /**
     * Check if content should be stored separately (> 5MB)
     */
    public boolean shouldStoreSeparately(String plaintext, String extractedText) {
        long size = 0;
        if (plaintext != null) size += plaintext.length() * 2; // UTF-16
        if (extractedText != null) size += extractedText.length() * 2;
        return size > LARGE_CONTENT_THRESHOLD;
    }
    
    /**
     * Delete full content for a document
     */
    public void deleteFullContent(String documentId) {
        fullContentRepository.deleteByDocumentId(documentId);
        log.info("Deleted full content for document {}", documentId);
    }
    
    /**
     * Get preview (first 500 chars) for main document
     */
    public String getPreview(String fullText) {
        if (fullText == null || fullText.length() <= 500) {
            return fullText;
        }
        return fullText.substring(0, 500) + "...";
    }
    
    /**
     * Calculate approximate content size
     */
    private long calculateContentSize(String plaintext, String extractedText,
                                      List<Map<String, Object>> sections,
                                      Map<String, Object> ocr, Object jsonContent) {
        long size = 0;
        
        if (plaintext != null) size += plaintext.length() * 2;
        if (extractedText != null) size += extractedText.length() * 2;
        if (sections != null) size += sections.toString().length() * 2;
        if (ocr != null) size += ocr.toString().length() * 2;
        if (jsonContent != null) size += jsonContent.toString().length() * 2;
        
        return size;
    }
}
