package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.DocumentVersionEntity;
import com.devgo2003.docgo.repository_service.entity.DocumentVersionEntity.VersionHistory;
import com.devgo2003.docgo.repository_service.repository.DocumentVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing document version history using Bucket Pattern
 * Each bucket stores max 50 versions
 */
@Service
public class DocumentVersionService {
    
    private static final Logger log = LoggerFactory.getLogger(DocumentVersionService.class);
    private static final int MAX_VERSIONS_PER_BUCKET = 50;
    
    @Autowired
    private DocumentVersionRepository versionRepository;
    
    /**
     * Add a new version to history
     */
    public void addVersion(String documentId, VersionHistory version) {
        // Get or create latest bucket
        Optional<DocumentVersionEntity> latestBucketOpt = 
            versionRepository.findFirstByDocumentIdOrderByBucketNumberDesc(documentId);
        
        DocumentVersionEntity bucket;
        
        if (latestBucketOpt.isEmpty() || latestBucketOpt.get().getCount() >= MAX_VERSIONS_PER_BUCKET) {
            // Create new bucket
            int newBucketNumber = latestBucketOpt.map(b -> b.getBucketNumber() + 1).orElse(0);
            
            bucket = DocumentVersionEntity.builder()
                .id(documentId + "-versions-" + newBucketNumber)
                .documentId(documentId)
                .bucketNumber(newBucketNumber)
                .count(0)
                .versions(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();
                
            log.info("Created new version bucket {} for document {}", newBucketNumber, documentId);
        } else {
            bucket = latestBucketOpt.get();
        }
        
        // Add version to bucket
        bucket.getVersions().add(version);
        bucket.setCount(bucket.getVersions().size());
        bucket.setUpdatedAt(LocalDateTime.now());
        
        versionRepository.save(bucket);
        log.info("Added version {} to bucket {} for document {}", 
            version.getVersion(), bucket.getBucketNumber(), documentId);
    }
    
    /**
     * Get all version history for a document
     */
    public List<VersionHistory> getAllVersions(String documentId) {
        List<DocumentVersionEntity> buckets = 
            versionRepository.findByDocumentIdOrderByBucketNumberAsc(documentId);
        
        return buckets.stream()
            .flatMap(bucket -> bucket.getVersions().stream())
            .collect(Collectors.toList());
    }
    
    /**
     * Get specific version
     */
    public Optional<VersionHistory> getVersion(String documentId, Integer versionNumber) {
        List<VersionHistory> allVersions = getAllVersions(documentId);
        return allVersions.stream()
            .filter(v -> v.getVersion().equals(versionNumber))
            .findFirst();
    }
    
    /**
     * Get version count for a document
     */
    public int getVersionCount(String documentId) {
        List<DocumentVersionEntity> buckets = 
            versionRepository.findByDocumentIdOrderByBucketNumberAsc(documentId);
        return buckets.stream()
            .mapToInt(DocumentVersionEntity::getCount)
            .sum();
    }
    
    /**
     * Delete all version history for a document
     */
    public void deleteAllVersions(String documentId) {
        versionRepository.deleteByDocumentId(documentId);
        log.info("Deleted all version history for document {}", documentId);
    }
}
