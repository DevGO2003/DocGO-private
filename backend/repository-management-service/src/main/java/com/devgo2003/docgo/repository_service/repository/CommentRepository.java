package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.CommentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<CommentEntity, String> {
    
    /**
     * Tìm tất cả comments của một file (chưa bị xóa)
     */
    List<CommentEntity> findByFileIdAndIsDeletedFalseOrderByCreatedAtDesc(String fileId);
    
    /**
     * Tìm tất cả comments của một file với phân trang
     */
    Page<CommentEntity> findByFileIdAndIsDeletedFalse(String fileId, Pageable pageable);
    
    /**
     * Tìm comments theo author
     */
    List<CommentEntity> findByAuthorIdAndIsDeletedFalse(String authorId);
    
    /**
     * Đếm số lượng comments của một file
     */
    Long countByFileIdAndIsDeletedFalse(String fileId);
}
