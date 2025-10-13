package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.dto.FileUploadResponse;
import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.event.FileUploadedEvent;
import com.devgo2003.docgo.document_service.event.RedisEventPublisher;
import com.devgo2003.docgo.document_service.repository.DocumentRepository;
import com.devgo2003.docgo.document_service.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/document-management-service/v1/files")
@Tag(name = "📁 APIs Upload File", description = "APIs upload và quản lý file trong hệ thống DocGO")
@Slf4j
public class FileUploadController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private RedisEventPublisher eventPublisher;
    
    // Allowed file types
    private static final List<String> ALLOWED_FILE_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/jpeg",
            "image/jpg",
            "image/png"
    );
    
    private static final List<String> ALLOWED_FILE_EXTENSIONS = Arrays.asList(
            ".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png"
    );
    
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    @Operation(
            summary = "Upload file tài liệu",
            description = """
            ## 📖 Mô tả
            Upload file tài liệu lên hệ thống với hỗ trợ OCR và phân loại tự động.
            
            ## 🔹 Đầu vào
            
            📁 **file** (bắt buộc, multipart/form-data)
            - **Loại dữ liệu**: MultipartFile
            - **Định dạng hỗ trợ**: PDF, DOCX, TXT, JPG, JPEG, PNG
            - **Kích thước tối đa**: 50MB
            - **Mô tả**: File tài liệu cần upload
            
            📄 **metadata** (tùy chọn, multipart/form-data)
            - **Loại dữ liệu**: JSON string
            - **Mô tả**: Metadata bổ sung cho file
            
            🏷️ **tags** (tùy chọn, multipart/form-data)
            - **Loại dữ liệu**: JSON array string
            - **Mô tả**: Tags để phân loại file
            
            ## 🔹 Đầu ra
            
            📝 **data**
            - **Loại**: FileUploadResponse
            - **Mô tả**: Thông tin file đã upload và document được tạo
            """,
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "File uploaded successfully"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or request"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @PostMapping("/upload")
    public ResponseEntity<RestResponse<FileUploadResponse>> uploadFile(
            @Parameter(description = "File tài liệu cần upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Metadata bổ sung") @RequestParam(value = "metadata", required = false) String metadata,
            @Parameter(description = "Tags phân loại") @RequestParam(value = "tags", required = false) String tags,
            @Parameter(description = "User ID") @RequestHeader(value = "X-User-ID", required = false) String userId
    ) {
        try {
            log.info("Received file upload request: filename={}, size={}, userId={}", 
                    file.getOriginalFilename(), file.getSize(), userId);
            
            // Validate file
            validateFile(file);
            
            // Set default userId if not provided
            if (userId == null || userId.isEmpty()) {
                userId = "system";
            }
            
            // Upload file to S3
            FileUploadResponse uploadResponse = fileStorageService.uploadFile(file, userId, "documents");
            
            // Create document entity
            DocumentEntity document = createDocumentEntity(file, uploadResponse, userId, metadata, tags);
            DocumentEntity savedDocument = documentRepository.save(document);
            
            // Publish file uploaded event
            FileUploadedEvent event = FileUploadedEvent.builder()
                    .documentId(savedDocument.getId())
                    .fileId(uploadResponse.getFileId())
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileUrl(uploadResponse.getFileUrl())
                    .userId(userId)
                    .s3Key(uploadResponse.getS3Key())
                    .s3Bucket(uploadResponse.getBucket())
                    .actorUserId(userId)
                    .build();
            
            eventPublisher.publishFileUploadedEvent(event);
            
            log.info("File upload completed: documentId={}, fileId={}", 
                    savedDocument.getId(), uploadResponse.getFileId());
            
            return ResponseEntity.status(201).body(RestResponse.<FileUploadResponse>builder()
                    .statusCode(201)
                    .shortMessage("Created")
                    .description("File đã được upload thành công và đang được xử lý")
                    .data(uploadResponse)
                    .build());
                    
        } catch (IllegalArgumentException e) {
            log.error("File validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(RestResponse.<FileUploadResponse>builder()
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description(e.getMessage())
                    .data(null)
                    .build());
                    
        } catch (Exception e) {
            log.error("File upload error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(RestResponse.<FileUploadResponse>builder()
                    .statusCode(500)
                    .shortMessage("Internal Server Error")
                    .description("Lỗi hệ thống khi upload file: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File quá lớn. Kích thước tối đa: 50MB");
        }
        
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        
        if (contentType != null && !ALLOWED_FILE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ: " + contentType);
        }
        
        if (filename != null) {
            String extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
            if (!ALLOWED_FILE_EXTENSIONS.contains(extension)) {
                throw new IllegalArgumentException("Định dạng file không được hỗ trợ: " + extension);
            }
        }
    }
    
    private DocumentEntity createDocumentEntity(MultipartFile file, FileUploadResponse uploadResponse, 
                                               String userId, String metadata, String tags) {
        DocumentEntity document = new DocumentEntity();
        
        // Basic info
        document.setTitle(file.getOriginalFilename());
        document.setDescription("File được upload tự động");
        document.setStatus("ACTIVE");
        document.setDocumentType("GENERAL_FILE"); // Will be updated after classification
        
        // File info
        document.setFileId(uploadResponse.getFileId());
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setFileUrl(uploadResponse.getFileUrl());
        
        // User info
        document.setUserId(userId);
        
        // Processing status
        document.setOcrStatus("PENDING");
        document.setProcessingStatus("PENDING");
        
        // Timestamps
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());
        
        return document;
    }
}


