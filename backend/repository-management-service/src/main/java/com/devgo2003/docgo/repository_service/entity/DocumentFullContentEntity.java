package com.devgo2003.docgo.repository_service.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Subset Pattern for Large Content
 * Stores large text content separately to keep main document fast
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "file_full_contents")
public class DocumentFullContentEntity {
    @Id
    private String id;  // Same as documentId
    
    @Indexed(unique = true)
    private String documentId;
    
    // Large text content (can be > 5MB)
    private String plaintext;
    private String extractedText;
    
    // Sections can be large with full content
    private List<Map<String, Object>> sections;
    
    // OCR result can be large
    private Map<String, Object> ocr;
    
    // JSON content can be very large
    private Object jsonContent;
    
    private Long contentSize;  // Total size in bytes
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
