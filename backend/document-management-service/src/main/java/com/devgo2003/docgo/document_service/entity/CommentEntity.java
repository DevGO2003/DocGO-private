package com.devgo2003.docgo.document_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Document(collection = "comments")
@Getter
@Setter
public class CommentEntity extends BaseEntity implements Persistable<String> {
    
    @Id
    @MongoId
    private String id;
    
    @Field("document_id")
    @NotBlank(message = "Document ID không được để trống")
    private String documentId;
    
    @Field("user_id")
    @NotBlank(message = "User ID không được để trống")
    private String userId;
    
    @Field("user_name")
    @NotBlank(message = "User name không được để trống")
    private String userName;
    
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;
    
    @Field("parent_comment_id")
    private String parentCommentId;
    
    @Field("is_edited")
    private Boolean isEdited = false;
    
    @Field("edited_at")
    private LocalDateTime editedAt;
    
    @Field("likes_count")
    private Integer likesCount = 0;
    
    @Field("replies_count")
    private Integer repliesCount = 0;
    
    @Override
    public String getId() { 
        return id; 
    }
    
    @Override
    public boolean isNew() { 
        return id == null; 
    }
}

