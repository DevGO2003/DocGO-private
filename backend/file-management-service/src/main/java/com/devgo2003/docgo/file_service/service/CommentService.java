package com.devgo2003.docgo.document_service.service;

import com.devgo2003.docgo.document_service.entity.CommentEntity;
import com.devgo2003.docgo.document_service.repository.CommentRepository;
import com.devgo2003.docgo.document_service.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }
    
    public Page<CommentEntity> getCommentsByDocumentId(String documentId, Pageable pageable) {
        return commentRepository.findByDocumentIdOrderByCreatedAtDesc(documentId, pageable);
    }
    
    public List<CommentEntity> getCommentsByDocumentId(String documentId) {
        return commentRepository.findByDocumentIdAndParentCommentIdIsNullOrderByCreatedAtDesc(documentId);
    }
    
    public CommentEntity addComment(String documentId, CommentEntity comment) {
        comment.setDocumentId(documentId);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public CommentEntity updateComment(String documentId, String commentId, CommentEntity comment) {
        CommentEntity existingComment = commentRepository.findByIdAndDocumentId(commentId, documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        
        existingComment.setContent(comment.getContent());
        existingComment.setIsEdited(true);
        existingComment.setEditedAt(LocalDateTime.now());
        existingComment.setUpdatedAt(LocalDateTime.now());
        
        return commentRepository.save(existingComment);
    }
    
    public void deleteComment(String documentId, String commentId) {
        CommentEntity comment = commentRepository.findByIdAndDocumentId(commentId, documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        
        commentRepository.delete(comment);
    }
    
    public Optional<CommentEntity> findCommentById(String commentId) {
        return commentRepository.findById(commentId);
    }
}