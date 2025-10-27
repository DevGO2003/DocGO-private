package com.devgo2003.docgo.repository_service.dto;

import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryDTO {

    private String id;
    private String name;
    private String description;
    private RepositoryEntity.RepositoryType type;
    private String ownerUserId;
    private String organizationId;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Map<String, Object> metadata;
    private RepositoryEntity.RepositorySettings settings;
    private List<RepositoryEntity.RepositoryPermission> permissions;

    // Additional fields for UI
    private Long fileCount;
    private Long totalSize;
    private Integer memberCount;
    private String ownerName;
    private String organizationName;

    // Static factory methods
    public static RepositoryDTO fromEntity(RepositoryEntity entity) {
        return RepositoryDTO.builder()
            .id(entity.getId())
            .name(entity.getName())
            .description(entity.getDescription())
            .type(entity.getType())
            .ownerUserId(entity.getOwnerUserId())
            .organizationId(entity.getOrganizationId())
            .isPublic(entity.getIsPublic())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .createdBy(entity.getCreatedBy())
            .updatedBy(entity.getUpdatedBy())
            .metadata(entity.getMetadata())
            .settings(entity.getSettings())
            .permissions(entity.getPermissions())
            .build();
    }

    public static RepositoryDTO fromEntityWithStats(RepositoryEntity entity, Long fileCount, Long totalSize, Integer memberCount) {
        RepositoryDTO dto = fromEntity(entity);
        dto.setFileCount(fileCount != null ? fileCount : 0L);
        dto.setTotalSize(totalSize != null ? totalSize : 0L);
        dto.setMemberCount(memberCount != null ? memberCount : 0);
        return dto;
    }
}
