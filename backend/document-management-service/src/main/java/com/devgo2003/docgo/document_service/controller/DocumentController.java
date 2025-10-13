package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.dto.ProcessingResultRequest;
import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.service.FileStorageService;
import com.devgo2003.docgo.document_service.service.DocumentService;
import com.devgo2003.docgo.document_service.repository.DocumentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/document-management-service/v1/documents")
@Tag(name = "📄 APIs Quản lý Tài liệu", description = "APIs quản lý tài liệu và tệp tin trong hệ thống DocGO")
@Slf4j
public class DocumentController {

    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;
    private final DocumentService documentService;

    @Autowired
    public DocumentController(FileStorageService fileStorageService, DocumentService documentService, DocumentRepository documentRepository) {
        this.fileStorageService = fileStorageService;
        this.documentService = documentService;
        this.documentRepository = documentRepository;
    }


    @Operation(
            summary = "Lấy danh sách tài liệu",
            description = """
            ## 📖 Mô tả
            Lấy danh sách tài liệu với phân trang và tìm kiếm.

            ## 🔹 Đầu vào

            📄 page (tùy chọn, query)
            Loại: integer
            Mô tả: Số trang (mặc định: 0)

            📄 size (tùy chọn, query)
            Loại: integer
            Mô tả: Kích thước trang (mặc định: 10)

            📄 sortBy (tùy chọn, query)
            Loại: string
            Mô tả: Trường sắp xếp (mặc định: createdAt)

            📄 sortDirection (tùy chọn, query)
            Loại: string
            Mô tả: Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC)

            📄 userId (tùy chọn, query)
            Loại: string
            Mô tả: ID của người dùng để lọc documents

            📄 documentType (tùy chọn, query)
            Loại: string
            Mô tả: Loại tài liệu (CONTRACT|GENERAL_FILE)

            📄 searchTerm (tùy chọn, query)
            Loại: string
            Mô tả: Từ khóa tìm kiếm trong title và description

            📄 includeDeleted (tùy chọn, query)
            Loại: boolean
            Mô tả: Bao gồm tài liệu đã xóa (mặc định: false)

            📄 view (tùy chọn, query)
            Loại: string
            Mô tả: Loại view dữ liệu (table|card|detail|full). Mặc định: full

            ## 🔹 Đầu ra

            📝 data
            Loại: Page<DocumentEntity>
            Mô tả: Danh sách tài liệu với phân trang

            📊 apiVersion
            Loại: string
            Mô tả: Phiên bản API (v1)a

            🔢 statusCode
            Loại: integer
            Mô tả: Mã trạng thái HTTP (200: OK, 204: No Content)

            📋 shortMessage
            Loại: string
            Mô tả: Thông báo ngắn gọn về kết quả

            📖 description
            Loại: string
            Mô tả: Mô tả chi tiết về kết quả xử lý

            🕒 timestamp
            Loại: string (ISO-8601)
            Mô tả: Thời gian xử lý yêu cầu

            🆔 requestId
            Loại: string (UUID)
            Mô tả: Định danh duy nhất của yêu cầu

            🛣️ path
            Loại: string
            Mô tả: Đường dẫn API được gọi
            """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Documents retrieved successfully",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
                    @ApiResponse(responseCode = "204", description = "No documents found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @GetMapping
    public ResponseEntity<RestResponse<Page<DocumentEntity>>> getAllDocuments(
            @Parameter(description = "Số trang (mặc định: 0)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Số trang (alias cho pageNumber)") @RequestParam(value = "pageNumber", required = false) Integer pageNumber,
            @Parameter(description = "Kích thước trang (mặc định: 10)") @RequestParam(value = "size", defaultValue = "10") int size,
            @Parameter(description = "Kích thước trang (alias cho pageSize)") @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "User ID (optional)") @RequestParam(value = "userId", required = false) String userId,
            @Parameter(description = "Loại tài liệu (CONTRACT|GENERAL_FILE)") @RequestParam(value = "documentType", required = false) String documentType,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @Parameter(description = "Bao gồm tài liệu đã xóa") @RequestParam(value = "includeDeleted", defaultValue = "false") boolean includeDeleted,
            @Parameter(description = "Loại view dữ liệu (table|card|detail|full). Mặc định: full") @RequestParam(value = "view", defaultValue = "full") String view
    ) {
        System.out.println("🔍 DocumentController: getAllDocuments method called!");
        System.out.println("🔥 HOT RELOAD TEST: " + System.currentTimeMillis());
        try {
            // Complex parameter mapping: support both page/size and pageNumber/pageSize
            int finalPage = (pageNumber != null) ? pageNumber : page;
            int finalSize = (pageSize != null) ? pageSize : size;
            
            System.out.println("🔍 DocumentController: getAllDocuments called with pageNumber=" + pageNumber + 
                             ", pageSize=" + pageSize + ", finalPage=" + finalPage + ", finalSize=" + finalSize);
            
            // Complex document retrieval with multiple filtering options
            Page<DocumentEntity> documents;
            
            // Strategy 1: Filter by document type if specified
            if (documentType != null && !documentType.isEmpty()) {
                documents = fileStorageService.getDocumentsByType(finalPage, finalSize, userId, documentType);
            } 
            // Strategy 2: Search by term if provided (fallback to getAllDocuments with post-filtering)
            else if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                // Complex search logic: get all documents first, then filter by search term
                Page<DocumentEntity> allDocs = fileStorageService.getAllDocuments(finalPage, finalSize, userId);
                documents = filterDocumentsBySearchTerm(allDocs, searchTerm, includeDeleted);
            }
            // Strategy 3: Get all documents with advanced filtering (fallback to getAllDocuments)
            else {
                documents = fileStorageService.getAllDocuments(finalPage, finalSize, userId);
                System.out.println("🔍 DocumentController: Service returned " + (documents != null ? documents.getContent().size() : "null") + " documents");
                // Apply additional filtering if needed
                if (!includeDeleted) {
                    documents = filterDeletedDocuments(documents);
                }
            }
            
            // Complex response handling
            if (documents == null || documents.getContent().isEmpty()) {
                return ResponseEntity.ok(RestResponse.<Page<DocumentEntity>>builder()
                        .statusCode(204)
                        .shortMessage("No Content")
                        .description("Không có tài liệu nào phù hợp với điều kiện tìm kiếm")
                        .data(null)
                        .build());
            }
            
            // Success response with complex metadata
        return ResponseEntity.ok(RestResponse.<Page<DocumentEntity>>builder()
                .statusCode(200)
                .shortMessage("Success")
                    .description(String.format("Đã lấy danh sách %d tài liệu thành công (trang %d/%d)", 
                        documents.getContent().size(), 
                        documents.getNumber() + 1, 
                        documents.getTotalPages()))
                    .data(documents)
                    .build());
                    
        } catch (Exception e) {
            // Complex error handling
            return ResponseEntity.status(500)
                    .body(RestResponse.<Page<DocumentEntity>>builder()
                            .statusCode(500)
                            .shortMessage("Internal Server Error")
                            .description("Lỗi hệ thống khi lấy danh sách tài liệu: " + e.getMessage())
                            .data(null)
                .build());
        }
    }

    @Operation(
            summary = "Lấy chi tiết tài liệu",
            description = """
            ## 📖 Mô tả
            Lấy thông tin chi tiết của một tài liệu theo ID.

            ## 🔹 Đầu vào

            📄 id (bắt buộc, path)
            Loại: string
            Mô tả: ID của tài liệu

            ## 🔹 Đầu ra

            📝 data
            Loại: DocumentEntity
            Mô tả: Thông tin chi tiết tài liệu
            """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Document retrieved successfully",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DocumentEntity.class))),
                    @ApiResponse(responseCode = "404", description = "Document not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<DocumentEntity>> getDocumentById(
            @Parameter(description = "ID của tài liệu", required = true) @PathVariable String id
    ) {
        DocumentEntity document = documentService.getDocumentById(id);
        return ResponseEntity.ok(RestResponse.success(document, "Document retrieved successfully"));
    }

    // Complex helper methods for advanced document filtering
    
    /**
     * Complex search filtering by search term
     * Supports searching in title, description, and tags
     */
    private Page<DocumentEntity> filterDocumentsBySearchTerm(Page<DocumentEntity> allDocs, String searchTerm, boolean includeDeleted) {
        List<DocumentEntity> filteredContent = allDocs.getContent().stream()
                .filter(doc -> {
                    // Complex search logic: check multiple fields
                    String lowerSearchTerm = searchTerm.toLowerCase().trim();
                    
                    boolean matchesTitle = doc.getTitle() != null && 
                            doc.getTitle().toLowerCase().contains(lowerSearchTerm);
                    
                    boolean matchesDescription = doc.getDescription() != null && 
                            doc.getDescription().toLowerCase().contains(lowerSearchTerm);
                    
                    boolean matchesTags = doc.getTags() != null && 
                            doc.getTags().stream().anyMatch(tag -> 
                                tag.toLowerCase().contains(lowerSearchTerm));
                    
                    boolean matchesCategory = doc.getCategory() != null && 
                            doc.getCategory().toLowerCase().contains(lowerSearchTerm);
                    
                    // Include deleted filter
                    boolean includeDoc = includeDeleted || !Boolean.TRUE.equals(doc.getIsDeleted());
                    
                    return (matchesTitle || matchesDescription || matchesTags || matchesCategory) && includeDoc;
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(filteredContent, allDocs.getPageable(), filteredContent.size());
    }
    
    /**
     * Complex filtering to exclude deleted documents
     */
    private Page<DocumentEntity> filterDeletedDocuments(Page<DocumentEntity> documents) {
        List<DocumentEntity> filteredContent = documents.getContent().stream()
                .filter(doc -> !Boolean.TRUE.equals(doc.getIsDeleted()))
                .collect(Collectors.toList());
        
        return new PageImpl<>(filteredContent, documents.getPageable(), filteredContent.size());
    }
    
    @Operation(
            summary = "Cập nhật kết quả xử lý tài liệu",
            description = """
            ## 📖 Mô tả
            API cập nhật kết quả xử lý tài liệu từ Automation Service sau khi OCR và phân loại hoàn tất.
            
            ## 🔹 Đầu vào
            
            🆔 **id** (bắt buộc, path)
            - **Loại**: string
            - **Mô tả**: ID của document cần cập nhật
            
            📄 **processingResult** (bắt buộc, body)
            - **Loại**: ProcessingResultRequest
            - **Mô tả**: Kết quả xử lý từ Automation Service
            
            ## 🔹 Đầu ra
            
            📝 **data**
            - **Loại**: DocumentEntity
            - **Mô tả**: Document đã được cập nhật
            """,
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Document updated successfully"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Document not found"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @PutMapping("/{id}/processing-result")
    public ResponseEntity<RestResponse<DocumentEntity>> updateProcessingResult(
            @Parameter(description = "ID của document cần cập nhật") @PathVariable String id,
            @Parameter(description = "Kết quả xử lý từ Automation Service") @RequestBody ProcessingResultRequest processingResult
    ) {
        try {
            log.info("Updating processing result for document: {}", id);
            
            DocumentEntity document = documentService.findDocumentById(id).orElse(null);
            if (document == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Update processing fields
            document.setOcrText(processingResult.getOcrText());
            document.setOcrStatus(processingResult.getOcrStatus());
            document.setClassificationResult(processingResult.getClassificationResult());
            document.setProcessingStatus(processingResult.getProcessingStatus());
            document.setProcessingError(processingResult.getProcessingError());
            document.setUpdatedAt(LocalDateTime.now());
            
            // Update document type based on classification
            if (processingResult.getClassificationResult() != null) {
                Map<String, Object> classification = (Map<String, Object>) processingResult.getClassificationResult();
                String documentType = (String) classification.get("document_type");
                if (documentType != null) {
                    document.setDocumentType(documentType);
                }
            }
            
            DocumentEntity updatedDocument = documentRepository.save(document);
            
            log.info("Processing result updated successfully for document: {}", id);
            
            return ResponseEntity.ok(RestResponse.<DocumentEntity>builder()
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Đã cập nhật kết quả xử lý tài liệu thành công")
                    .data(updatedDocument)
                    .build());
                    
        } catch (Exception e) {
            log.error("Failed to update processing result for document {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(RestResponse.<DocumentEntity>builder()
                    .statusCode(500)
                    .shortMessage("Internal Server Error")
                    .description("Lỗi hệ thống khi cập nhật kết quả xử lý: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    
    /**
     * Complex sorting logic for documents
     */
    private Page<DocumentEntity> sortDocuments(Page<DocumentEntity> documents, String sortBy, String sortDirection) {
        // This would implement complex sorting logic
        // For now, return as-is since the service should handle sorting
        return documents;
    }
}