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

        return FullFileResponseDto.builder()
                .id(entity.getId())
                .overview(mapOverview(entity.getOverview()))
                // Keep complex sections as Map - no type conversion needed
                .metadata(entity.getMetadata())
                .content(entity.getContent())
                .contract(entity.getContract())
                .storage(entity.getStorage())
                .security(entity.getSecurity())
                .versioning(entity.getVersioning())
                .audit(entity.getAudit())
                .build();
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
