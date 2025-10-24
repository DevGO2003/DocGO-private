package com.devgo2003.docgo.repository_service.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.Size;
import java.util.Map;
import java.util.HashMap;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUpdateRequest {
    
    @Size(max = 255, message = "File name must not exceed 255 characters")
    private String name;
    
    private String type;
    
    private Long size;
    
    private String mimeType;
    
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
