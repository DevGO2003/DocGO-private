package com.devgo2003.docgo.repository_service.service.core.mapper.impl;

import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.dto.OverviewDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.core.mapper.IFileMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * FileMapperImpl - File Mapping Implementation
 * 
 * Strategy: Incremental mapping
 * Phase 1: Map only overview (typed DTO)
 * Phase 2+: Keep complex sections as Map<String,Object>
 * 
 * Benefits:
 * - Avoids Lombok builder type conflicts
 * - Frontend handles Map parsing
 * - Easy to extend when needed
 */
@Component
public class FileMapperImpl implements IFileMapper {

    @Override
    public FullFileResponseDto toFullResponseDto(FileEntity entity) {
        if (entity == null) {
            return null;
        }

        // Loại bỏ plaintext và extractedText dư thừa khỏi content
        Map<String, Object> cleanedContent = cleanContentMap(entity.getContent());

        // Determine userId: overview.ownerUserId > entity.ownerUserId > audit.createdBy
        String ownerUserId = entity.getOverview() != null ? getString(entity.getOverview(), "ownerUserId") : null;
        String entityOwner = entity.getOwnerUserId();
        String createdBy = entity.getAudit() != null ? String.valueOf(entity.getAudit().getOrDefault("createdBy", null)) : null;
        String userId = (ownerUserId != null && !ownerUserId.isEmpty())
                ? ownerUserId
                : ((entityOwner != null && !entityOwner.isEmpty()) ? entityOwner : createdBy);

        return FullFileResponseDto.builder()
                .id(entity.getId())
                .repositoryId(entity.getRepositoryId())
                .userId(userId)
                .overview(mapOverview(entity.getOverview()))
                // Keep complex sections as Map - no type conversion needed
                .metadata(entity.getMetadata())
                .content(cleanedContent)  // Sử dụng cleaned content (chỉ có ocr.text)
                .contract(entity.getContract())
                .storage(entity.getStorage())
                .security(entity.getSecurity())
                .versioning(entity.getVersioning())
                .audit(entity.getAudit())
                .build();
    }
    
    /**
     * Loại bỏ plaintext và extractedText dư thừa, chỉ giữ ocr.text
     */
    private Map<String, Object> cleanContentMap(Map<String, Object> content) {
        if (content == null) {
            return null;
        }
        
        // Tạo bản sao để không modify original map
        Map<String, Object> cleaned = new java.util.HashMap<>(content);
        
        // Loại bỏ plaintext và extractedText (dư thừa)
        cleaned.remove("plaintext");
        cleaned.remove("extractedText");
        
        // Giữ lại ocr.text và các trường khác
        return cleaned;
    }

    @Override
    public OverviewDto mapOverview(Map<String, Object> map) {
        if (map == null) {
            return null;
        }

        return OverviewDto.builder()
                .title(getString(map, "title"))
                .status(getString(map, "status"))
                .documentType(getString(map, "documentType"))
                .tags(getStringList(map, "tags"))
                .ownerUserId(getString(map, "ownerUserId"))
                .language(getString(map, "language"))
                .region(getString(map, "region"))
                .isNew(getBoolean(map, "isNew"))
                .build();
    }

    // ==================== HELPER METHODS ====================

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Boolean getBoolean(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private List<String> getStringList(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof List) {
            return (List<String>) value;
        }
        return new ArrayList<>();
    }
}
