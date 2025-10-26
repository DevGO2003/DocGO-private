package com.devgo2003.docgo.repository_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * CommentListResponse - Paginated comment list response DTO
 * 
 * Contains pagination metadata and list of comments
 * Used for comment listing operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentListResponse {
    
    private List<CommentResponse> comments;
    private String fileId;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean isFirst;
    private boolean isLast;
}
