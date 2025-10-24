package com.devgo2003.docgo.repository_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * FileListResponse - Paginated file list response DTO
 * 
 * Contains pagination metadata and list of files
 * Used for file listing operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileListResponse {
    
    private List<FileResponse> files;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean isFirst;
    private boolean isLast;
    
    // Search and filter metadata
    private String searchTerm;
    private String sortBy;
    private String sortDirection;
    private String repositoryId;
}
