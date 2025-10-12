package com.devgo2003.docgo.document_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

@Document(collection = "documents")
@Getter
@Setter
public class DocumentEntity extends BaseEntity implements Persistable<String> {
    
    @Id
    @MongoId
    private String id;
    
    @NotBlank(message = "Tiêu đề tài liệu không được để trống")
    @Size(min = 3, max = 200, message = "Tiêu đề tài liệu phải từ 3-200 ký tự")
    private String title;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    @NotNull(message = "Trạng thái tài liệu không được để trống")
    private String status; // DRAFT, ACTIVE, ARCHIVED
    
    @Field("file_id")
    private String fileId; // Reference to uploaded file
    
    @Field("file_name")
    private String fileName;
    
    @Field("file_type")
    private String fileType;
    
    @Field("file_size")
    private Long fileSize;
    
    @Field("file_url")
    private String fileUrl;
    
    @Field("user_id")
    private String userId; // Owner
    
    private List<String> tags;
    
    // Metadata
    private String category;
    
    @Override
    public String getId() { 
        return id; 
    }
    
    @Override
    public boolean isNew() { 
        return id == null; 
    }
}
