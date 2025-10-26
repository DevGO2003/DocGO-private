package com.devgo2003.docgo.repository_service.service.core.impl;

import com.devgo2003.docgo.repository_service.config.UUIDv7Generator;
import com.devgo2003.docgo.repository_service.dto.request.CommentRequest;
import com.devgo2003.docgo.repository_service.dto.response.CommentResponse;
import com.devgo2003.docgo.repository_service.dto.response.CommentListResponse;
import com.devgo2003.docgo.repository_service.entity.CommentEntity;
import com.devgo2003.docgo.repository_service.repository.CommentRepository;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.service.core.IFileCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * FileCommentServiceImpl - File Comment Service Implementation
 * 
 * Pattern: Service + Repository
 * - Service: Business logic for comments
 * - Repository: Data access
 */
@Service
public class FileCommentServiceImpl implements IFileCommentService {

    private final CommentRepository commentRepository;
    private final FileRepository fileRepository;

    @Autowired
    public FileCommentServiceImpl(CommentRepository commentRepository, FileRepository fileRepository) {
        this.commentRepository = commentRepository;
        this.fileRepository = fileRepository;
    }

    @Override
    public CommentResponse addComment(String fileId, CommentRequest request, String actorId) {
        // Kiểm tra file có tồn tại không
        if (!fileRepository.existsById(fileId)) {
            throw new RuntimeException("File not found: " + fileId);
        }

        // Tạo comment entity
        CommentEntity comment = CommentEntity.builder()
                .id(UUIDv7Generator.generate())
                .fileId(fileId)
                .content(request.getContent())
                .author(request.getAuthor())
                .authorId(actorId != null ? actorId : request.getAuthorId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        // Lưu vào database
        CommentEntity savedComment = commentRepository.save(comment);

        // Convert sang DTO
        return toCommentResponse(savedComment);
    }

    @Override
    public List<CommentResponse> getCommentsByFileId(String fileId) {
        List<CommentEntity> comments = commentRepository
                .findByFileIdAndIsDeletedFalseOrderByCreatedAtDesc(fileId);
        
        return comments.stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CommentListResponse getCommentsByFileIdPaginated(String fileId, Pageable pageable) {
        Page<CommentEntity> commentPage = commentRepository
                .findByFileIdAndIsDeletedFalse(fileId, pageable);

        List<CommentResponse> comments = commentPage.getContent().stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());

        return CommentListResponse.builder()
                .comments(comments)
                .fileId(fileId)
                .currentPage(commentPage.getNumber())
                .totalPages(commentPage.getTotalPages())
                .totalElements(commentPage.getTotalElements())
                .pageSize(commentPage.getSize())
                .hasNext(commentPage.hasNext())
                .hasPrevious(commentPage.hasPrevious())
                .isFirst(commentPage.isFirst())
                .isLast(commentPage.isLast())
                .build();
    }

    @Override
    public Optional<CommentResponse> getCommentById(String commentId) {
        return commentRepository.findById(commentId)
                .filter(comment -> !comment.getIsDeleted())
                .map(this::toCommentResponse);
    }

    @Override
    public CommentResponse updateComment(String commentId, CommentRequest request, String actorId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        if (comment.getIsDeleted()) {
            throw new RuntimeException("Cannot update deleted comment: " + commentId);
        }

        // Kiểm tra quyền sở hữu (optional - có thể bỏ qua nếu không cần)
        // if (!comment.getAuthorId().equals(actorId)) {
        //     throw new RuntimeException("You are not authorized to update this comment");
        // }

        // Cập nhật nội dung
        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        CommentEntity updatedComment = commentRepository.save(comment);
        return toCommentResponse(updatedComment);
    }

    @Override
    public void deleteComment(String commentId, String actorId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        if (comment.getIsDeleted()) {
            throw new RuntimeException("Comment already deleted: " + commentId);
        }

        // Kiểm tra quyền sở hữu (optional - có thể bỏ qua nếu không cần)
        // if (!comment.getAuthorId().equals(actorId)) {
        //     throw new RuntimeException("You are not authorized to delete this comment");
        // }

        // Soft delete
        comment.setIsDeleted(true);
        comment.setDeletedBy(actorId);
        comment.setDeletedAt(LocalDateTime.now());

        commentRepository.save(comment);
    }

    @Override
    public Long countCommentsByFileId(String fileId) {
        return commentRepository.countByFileIdAndIsDeletedFalse(fileId);
    }

    /**
     * Helper method: Convert CommentEntity to CommentResponse
     */
    private CommentResponse toCommentResponse(CommentEntity comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .fileId(comment.getFileId())
                .content(comment.getContent())
                .author(comment.getAuthor())
                .authorId(comment.getAuthorId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .isDeleted(comment.getIsDeleted())
                .deletedBy(comment.getDeletedBy())
                .deletedAt(comment.getDeletedAt())
                .build();
    }
}
