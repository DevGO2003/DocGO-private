package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.dto.FileDownloadResponse;
import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.entity.CommentEntity;
import com.devgo2003.docgo.document_service.service.FileStorageService;
import com.devgo2003.docgo.document_service.service.DocumentService;
import com.devgo2003.docgo.document_service.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/document-management-service/v1/documents")
@Tag(name = "📄 APIs Quản lý Tài liệu", description = "APIs quản lý tài liệu và tệp tin trong hệ thống DocGO")
public class DocumentController {

    private final FileStorageService fileStorageService;
    private final DocumentService documentService;
    private final CommentService commentService;

    @Autowired
    public DocumentController(FileStorageService fileStorageService, DocumentService documentService, CommentService commentService) {
        this.fileStorageService = fileStorageService;
        this.documentService = documentService;
        this.commentService = commentService;
    }

    @Operation(
            summary = "Tải xuống tài liệu",
            description = """
            ## 📖 Mô tả
            Tải xuống tệp tài liệu theo định danh file đã lưu trữ.

            ## 🔹 Đầu vào

            📄 fileId (bắt buộc, path)
            Loại: string
            Mô tả: ID của file cần download
            
            📄 userId (tùy chọn, query)
            Loại: string
            Mô tả: ID của người dùng yêu cầu download
            
            ## 🔹 Đầu ra

            📝 data
            Loại: FileDownloadResponse
            Mô tả: File content và metadata
            
            📊 apiVersion
            Loại: string
            Mô tả: Phiên bản API (v1)
            
            🔢 statusCode
            Loại: integer
            Mô tả: Mã trạng thái HTTP (200: OK, 404: Not Found)
            
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
                    @ApiResponse(responseCode = "200", description = "File downloaded successfully",
                            content = @Content(mediaType = "application/octet-stream")),
                    @ApiResponse(responseCode = "404", description = "File not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @Parameter(description = "ID of the file to download", required = true) @PathVariable String fileId,
            @Parameter(description = "User ID (optional)") @RequestParam(value = "userId", required = false) String userId
    ) {
        FileDownloadResponse download = fileStorageService.downloadFile(fileId, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.getFilename() + "\"")
                .body(download.getResource());
    }

    @Operation(
            summary = "Lấy danh sách tài liệu",
            description = """
            ## 📖 Mô tả
            Lấy danh sách tài liệu với phân trang, cho phép lọc theo người dùng.

            ## 🔹 Đầu vào

            📄 page (tùy chọn, query)
            Loại: integer
            Mô tả: Số trang (mặc định: 0)
            
            📄 size (tùy chọn, query)  
            Loại: integer
            Mô tả: Kích thước trang (mặc định: 10)
            
            📄 userId (tùy chọn, query)
            Loại: string
            Mô tả: ID của người dùng để lọc documents
            
            📄 documentType (tùy chọn, query)
            Loại: string
            Mô tả: Loại tài liệu (CONTRACT|GENERAL_FILE)
            
            ## 🔹 Đầu ra

            📝 data
            Loại: Page<DocumentEntity>
            Mô tả: Danh sách documents với phân trang
            
            📊 apiVersion
            Loại: string
            Mô tả: Phiên bản API (v1)
            
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
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @GetMapping
    public ResponseEntity<RestResponse<Page<DocumentEntity>>> getAllDocuments(
            @Parameter(description = "Page number (default: 0)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size (default: 10)") @RequestParam(value = "size", defaultValue = "10") int size,
            @Parameter(description = "User ID (optional)") @RequestParam(value = "userId", required = false) String userId,
            @Parameter(description = "Loại view dữ liệu (table|card|detail|full). Mặc định: full") @RequestParam(value = "view", defaultValue = "full") String view,
            @Parameter(description = "Loại tài liệu (CONTRACT|GENERAL_FILE)") @RequestParam(value = "documentType", required = false) String documentType
    ) {
        Page<DocumentEntity> documents = fileStorageService.getDocumentsByType(page, size, userId, documentType);
        return ResponseEntity.ok(RestResponse.success(documents, "Documents retrieved successfully"));
    }

    @Operation(
            summary = "Lấy chi tiết tài liệu",
            description = """
            ## 📖 Mô tả
            Lấy thông tin chi tiết của một tài liệu theo ID.

            ## 🔹 Đầu vào

            📄 id (bắt buộc, path)
            Loại: string
            Mô tả: ID của tài liệu cần lấy thông tin
            
            ## 🔹 Đầu ra

            📝 data
            Loại: DocumentEntity
            Mô tả: Thông tin chi tiết tài liệu bao gồm tất cả metadata và nested objects
            
            📊 apiVersion
            Loại: string
            Mô tả: Phiên bản API (v1)
            
            🔢 statusCode
            Loại: integer
            Mô tả: Mã trạng thái HTTP (200: OK, 404: Not Found)
            
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

    @Operation(
            summary = "Lấy danh sách bình luận của tài liệu",
            description = """
            ## 📖 Mô tả
            Lấy danh sách bình luận của một tài liệu với phân trang.

            ## 🔹 Đầu vào

            📄 documentId (bắt buộc, path)
            Loại: string
            Mô tả: ID của tài liệu
            
            📄 page (tùy chọn, query)
            Loại: integer
            Mô tả: Số trang (mặc định: 0)
            
            📄 size (tùy chọn, query)  
            Loại: integer
            Mô tả: Kích thước trang (mặc định: 10)
            
            ## 🔹 Đầu ra

            📝 data
            Loại: Page<CommentEntity>
            Mô tả: Danh sách bình luận với phân trang
            """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Document not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @GetMapping("/{documentId}/comments")
    public ResponseEntity<RestResponse<Page<CommentEntity>>> getComments(
            @Parameter(description = "ID của tài liệu", required = true) @PathVariable String documentId,
            @Parameter(description = "Page number (default: 0)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size (default: 10)") @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        // Verify document exists
        documentService.getDocumentById(documentId);
        
        Page<CommentEntity> comments = commentService.getCommentsByDocumentId(documentId, 
            org.springframework.data.domain.PageRequest.of(page, size));
        return ResponseEntity.ok(RestResponse.success(comments, "Comments retrieved successfully"));
    }

    @Operation(
            summary = "Thêm bình luận mới",
            description = """
            ## 📖 Mô tả
            Thêm bình luận mới cho một tài liệu.

            ## 🔹 Đầu vào

            📄 documentId (bắt buộc, path)
            Loại: string
            Mô tả: ID của tài liệu
            
            📄 comment (bắt buộc, body)
            Loại: CommentEntity
            Mô tả: Thông tin bình luận
            
            ## 🔹 Đầu ra

            📝 data
            Loại: CommentEntity
            Mô tả: Bình luận đã được tạo
            """,
            responses = {
                    @ApiResponse(responseCode = "201", description = "Comment created successfully"),
                    @ApiResponse(responseCode = "404", description = "Document not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @PostMapping("/{documentId}/comments")
    public ResponseEntity<RestResponse<CommentEntity>> addComment(
            @Parameter(description = "ID của tài liệu", required = true) @PathVariable String documentId,
            @RequestBody CommentEntity comment
    ) {
        // Verify document exists
        documentService.getDocumentById(documentId);
        
        CommentEntity savedComment = commentService.addComment(documentId, comment);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(RestResponse.success(savedComment, "Comment created successfully"));
    }

    @Operation(
            summary = "Cập nhật bình luận",
            description = """
            ## 📖 Mô tả
            Cập nhật nội dung của một bình luận.

            ## 🔹 Đầu vào

            📄 documentId (bắt buộc, path)
            Loại: string
            Mô tả: ID của tài liệu
            
            📄 commentId (bắt buộc, path)
            Loại: string
            Mô tả: ID của bình luận
            
            📄 comment (bắt buộc, body)
            Loại: CommentEntity
            Mô tả: Thông tin bình luận cập nhật
            
            ## 🔹 Đầu ra

            📝 data
            Loại: CommentEntity
            Mô tả: Bình luận đã được cập nhật
            """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Comment updated successfully"),
                    @ApiResponse(responseCode = "404", description = "Comment or document not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @PutMapping("/{documentId}/comments/{commentId}")
    public ResponseEntity<RestResponse<CommentEntity>> updateComment(
            @Parameter(description = "ID của tài liệu", required = true) @PathVariable String documentId,
            @Parameter(description = "ID của bình luận", required = true) @PathVariable String commentId,
            @RequestBody CommentEntity comment
    ) {
        CommentEntity updatedComment = commentService.updateComment(documentId, commentId, comment);
        return ResponseEntity.ok(RestResponse.success(updatedComment, "Comment updated successfully"));
    }

    @Operation(
            summary = "Xóa bình luận",
            description = """
            ## 📖 Mô tả
            Xóa một bình luận khỏi tài liệu.

            ## 🔹 Đầu vào

            📄 documentId (bắt buộc, path)
            Loại: string
            Mô tả: ID của tài liệu
            
            📄 commentId (bắt buộc, path)
            Loại: string
            Mô tả: ID của bình luận
            
            ## 🔹 Đầu ra

            📝 data
            Loại: null
            Mô tả: Bình luận đã được xóa
            """,
            responses = {
                    @ApiResponse(responseCode = "200", description = "Comment deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Comment or document not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    @DeleteMapping("/{documentId}/comments/{commentId}")
    public ResponseEntity<RestResponse<Void>> deleteComment(
            @Parameter(description = "ID của tài liệu", required = true) @PathVariable String documentId,
            @Parameter(description = "ID của bình luận", required = true) @PathVariable String commentId
    ) {
        commentService.deleteComment(documentId, commentId);
        return ResponseEntity.ok(RestResponse.success(null, "Comment deleted successfully"));
    }
}
