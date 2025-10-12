package com.devgo2003.docgo.document_service.repository;

import com.devgo2003.docgo.document_service.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends MongoRepository<CommentEntity, String> {
    
    Page<CommentEntity> findByDocumentIdOrderByCreatedAtDesc(String documentId, Pageable pageable);
    
    List<CommentEntity> findByDocumentIdAndParentCommentIdIsNullOrderByCreatedAtDesc(String documentId);
    
    List<CommentEntity> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId);
    
    Optional<CommentEntity> findByIdAndDocumentId(String id, String documentId);
    
    long countByDocumentId(String documentId);
    
    long countByParentCommentId(String parentCommentId);
}