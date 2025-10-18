package com.devgo2003.docgo.file_service.controller;

import com.devgo2003.docgo.file_service.dto.RestResponse;
import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/file-management-service/documents")
@Tag(name = "Document Management", description = "API quản lý tài liệu")
public class DocumentController {

    @Autowired
    private FileService fileService;

    @GetMapping("/{id}")
    @Operation(
        summary = "Lấy chi tiết tài liệu",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tài liệu cần lấy
        
        🔹 Đầu ra
        
        📝 data
        Loại: FileEntity
        Mô tả: Thông tin chi tiết tài liệu với schema mới
        
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
        """
    )
    public ResponseEntity<RestResponse<FileEntity>> getDocument(
            @Parameter(description = "ID của tài liệu cần lấy") 
            @PathVariable String id) {
        
        try {
            FileEntity document = fileService.getDocumentById(id);
            
            if (document == null) {
                return ResponseEntity.ok(RestResponse.<FileEntity>builder()
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description("Không tìm thấy tài liệu với ID: " + id)
                    .data(null)
                    .build());
            }
            
            return ResponseEntity.ok(RestResponse.<FileEntity>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy thông tin tài liệu thành công")
                .data(document)
                .build());
                
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<FileEntity>builder()
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi hệ thống: " + e.getMessage())
                .data(null)
                .build());
        }
    }
}