package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import com.devgo2003.docgo.document_service.service.FileStorageService;
import com.devgo2003.docgo.document_service.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/document-management-service/v1/documents")
@Tag(name = "📄 APIs Quản lý Tài liệu", description = "APIs quản lý tài liệu và tệp tin trong hệ thống DocGO")
public class DocumentController {

    private final FileStorageService fileStorageService;
    private final DocumentService documentService;

    @Autowired
    public DocumentController(FileStorageService fileStorageService, DocumentService documentService) {
        this.fileStorageService = fileStorageService;
        this.documentService = documentService;
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
            @Parameter(description = "Số trang (mặc định: 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang (mặc định: 10)") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        // This would typically call a service method to get paginated documents
        // For now, return a simple response
        return ResponseEntity.ok(RestResponse.<Page<DocumentEntity>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách tài liệu thành công")
                .data(null) // Would be populated with actual data
                .build());
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
}