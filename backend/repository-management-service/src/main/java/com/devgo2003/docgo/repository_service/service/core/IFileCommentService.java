package com.devgo2003.docgo.repository_service.service.core;

import com.devgo2003.docgo.repository_service.dto.request.CommentRequest;
import com.devgo2003.docgo.repository_service.dto.response.CommentResponse;
import com.devgo2003.docgo.repository_service.dto.response.CommentListResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * IFileCommentService - File Comment Service Interface
 * 
 * Core Operations:
 * - CRUD operations for comments
 * - Get comments by fileId
 * - Pagination and search
 */
public interface IFileCommentService {
    
    /**
     * Add comment to a file
     * @param fileId ID của file
     * @param request Comment request
     * @param actorId ID người thực hiện
     * @return CommentResponse
     */
    CommentResponse addComment(String fileId, CommentRequest request, String actorId);
    
    /**
     * Get all comments for a file
     * @param fileId ID của file
     * @return List of comments
     */
    List<CommentResponse> getCommentsByFileId(String fileId);
    
    /**
     * Get all comments for a file with pagination
     * @param fileId ID của file
     * @param pageable Pageable
     * @return CommentListResponse
     */
    CommentListResponse getCommentsByFileIdPaginated(String fileId, Pageable pageable);
    
    /**
     * Get comment by ID
     * @param commentId ID của comment
     * @return Optional<CommentResponse>
     */
    Optional<CommentResponse> getCommentById(String commentId);
    
    /**
     * Update comment
     * @param commentId ID của comment
     * @param request Comment request
     * @param actorId ID người thực hiện
     * @return CommentResponse
     */
    CommentResponse updateComment(String commentId, CommentRequest request, String actorId);
    
    /**
     * Delete comment (soft delete)
     * @param commentId ID của comment
     * @param actorId ID người thực hiện
     */
    void deleteComment(String commentId, String actorId);
    
    /**
     * Count comments by fileId
     * @param fileId ID của file
     * @return Number of comments
     */
    Long countCommentsByFileId(String fileId);
}
