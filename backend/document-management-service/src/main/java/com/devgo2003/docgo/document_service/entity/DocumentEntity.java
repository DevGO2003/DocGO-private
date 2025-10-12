package com.devgo2003.docgo.document_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;
import java.util.List;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import com.devgo2003.docgo.document_service.dto.*;

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
    
    @Field("document_type")
    @NotNull(message = "Loại tài liệu không được để trống")
    private String documentType; // CONTRACT, GENERAL_FILE
    
    // Contract info
    @Field("contract_type")
    private String contractType;
    
    @Field("effective_date")
    private LocalDateTime effectiveDate;
    
    @Field("expiry_date")
    private LocalDateTime expiryDate;
    
    @Field("total_value")
    private Double totalValue;
    
    private String currency;
    
    @Field("risk_level")
    private String riskLevel;
    
    // Nested objects
    private List<Party> parties;
    
    @Field("payment_details")
    private PaymentDetails paymentDetails;
    
    @Field("key_clauses")
    private List<KeyClause> keyClauses;
    
    @Field("unfavorable_clauses")
    private List<String> unfavorableClauses;
    
    private List<Reminder> reminders;
    
    @Field("risk_assessment")
    private RiskAssessment riskAssessment;
    
    @Field("compliance_status")
    private ComplianceStatus complianceStatus;
    
    @Field("author_notes")
    private List<AuthorNote> authorNotes;
    
    // Content
    private String content;
    
    // Metadata
    @Field("file_system_metadata")
    private FileSystemMetadata fileSystemMetadata;
    
    @Field("original_document_metadata")
    private OriginalDocumentMetadata originalDocumentMetadata;
    
    @Field("archived_document_metadata")
    private ArchivedDocumentMetadata archivedDocumentMetadata;
    
    @Override
    public String getId() { 
        return id; 
    }
    
    @Override
    public boolean isNew() { 
        return id == null; 
    }
}
