package com.devgo2003.docgo.repository_service.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    
    private String id;
    private String name;
    private String type;
    private Long size;
    private String mimeType;
    private String status;
    private String ownerUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Builder.Default
    private Map<String, Object> overview = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> contract = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> content = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> storage = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> security = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> versioning = new HashMap<>();
    
    @Builder.Default
    private Map<String, Object> audit = new HashMap<>();
}
