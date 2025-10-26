package com.devgo2003.docgo.repository_service.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "file_comments")
public class CommentEntity {
    
    @Id
    private String id;  // UUID v7 format
    
    @Field
    @Indexed
    private String fileId;  // UUID của file được comment
    
    @Field
    private String content;  // Nội dung comment
    
    @Field
    private String author;  // Tên người comment
    
    @Field
    @Indexed
    private String authorId;  // ID người comment
    
    @Field
    private LocalDateTime createdAt;
    
    @Field
    private LocalDateTime updatedAt;
    
    @Field
    @Builder.Default
    private Boolean isDeleted = false;
    
    @Field
    private String deletedBy;  // ID người xóa
    
    @Field
    private LocalDateTime deletedAt;
}
