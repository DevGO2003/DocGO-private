package com.devgo2003.docgo.repository_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * CommentResponse - Comment response DTO
 * 
 * Contains comment information for API responses
 * Used for single comment operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    
    private String id;
    private String fileId;
    private String content;
    private String author;
    private String authorId;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Soft delete
    private Boolean isDeleted;
    private String deletedBy;
    private LocalDateTime deletedAt;
}
