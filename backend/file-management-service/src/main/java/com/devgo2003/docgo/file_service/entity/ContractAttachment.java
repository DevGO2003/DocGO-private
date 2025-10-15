package com.devgo2003.docgo.file_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "contract_attachments")
@Getter
@Setter
public class ContractAttachment extends BaseEntity {

    @Id
    private String id;

    @Field("contract_id")
    private String contractId;

    @Field("file_name")
    private String fileName;

    @Field("file_path")
    private String filePath;

    @Field("file_type")
    private String fileType;

    @Field("file_size")
    private Long fileSize;

    @Field("mime_type")
    private String mimeType;

    @Field("upload_date")
    private java.time.LocalDateTime uploadDate;

    @Field("uploaded_by")
    private String uploadedBy;

    @Field("description")
    private String description;
    
    @Override
    public boolean isNew() {
        return this.id == null;
    }
}
