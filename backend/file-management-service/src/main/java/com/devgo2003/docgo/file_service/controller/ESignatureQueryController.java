package com.devgo2003.docgo.file_service.controller;

import com.devgo2003.docgo.file_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.file_service.common.response.RestResponse;
import com.devgo2003.docgo.file_service.entity.ESignature;
import com.devgo2003.docgo.file_service.service.ESignatureService;
import com.devgo2003.docgo.file_service.util.PaginatedResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho ESignature Query APIs
 * Cung cấp các API query và search cho e-signatures
 */
@RestController
@RequestMapping("/api/v1/file-management-service/esignatures/query")
@Tag(name = "ESignature Query Management", description = "API tìm kiếm và truy vấn chữ ký điện tử")
@RequiredArgsConstructor
@Slf4j
public class ESignatureQueryController {

    private final ESignatureService eSignatureService;

    @GetMapping("/search")
    @Operation(
        summary = "Tìm kiếm chữ ký điện tử",
        description = """
        ## 📖 Mô tả
        Tìm kiếm chữ ký điện tử theo từ khóa với phân trang và sắp xếp.

        ## 🔹 Đầu vào

        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)

        📄 pageSize (tùy chọn, query)
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 10)

        📄 sortBy (tùy chọn, query)
        Loại: string
        Mô tả: Trường sắp xếp (mặc định: createdAt)

        📄 sortDirection (tùy chọn, query)
        Loại: string
        Mô tả: Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC)

        📄 searchTerm (bắt buộc, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm

        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Bao gồm chữ ký đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<ESignature>
        Mô tả: Danh sách chữ ký điện tử tìm được

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
            @ApiResponse(responseCode = "200", description = "Search completed successfully"),
            @ApiResponse(responseCode = "204", description = "No e-signatures found"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<ESignature>>> searchESignatures(
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection,
            
            @Parameter(description = "Từ khóa tìm kiếm", required = true) 
            @RequestParam String searchTerm,
            
            @Parameter(description = "Bao gồm chữ ký đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Searching e-signatures with term: {}, page: {}, size: {}", searchTerm, pageNumber, pageSize);
        
        // TODO: Implement searchESignatures in service
        Page<ESignature> eSignatures = eSignatureService.getAllESignatures(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        if (eSignatures.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<ESignature>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không tìm thấy chữ ký điện tử nào")
                .data(null)
                .build());
        }
        
        PaginatedResponse<ESignature> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            eSignatures, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<ESignature>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tìm kiếm chữ ký điện tử thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-contract/{contractId}")
    @Operation(
        summary = "Lấy chữ ký điện tử theo hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách chữ ký điện tử theo ID hợp đồng cụ thể.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng

        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)

        📄 pageSize (tùy chọn, query)
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
        Loại: PaginatedResponse<ESignature>
        Mô tả: Danh sách chữ ký điện tử theo hợp đồng

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
            @ApiResponse(responseCode = "200", description = "E-signatures retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No e-signatures found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<ESignature>>> getESignaturesByContract(
            @Parameter(description = "ID của hợp đồng", required = true)
            @PathVariable String contractId,
            
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(defaultValue = "") String searchTerm,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting e-signatures by contract: {}, page: {}, size: {}", contractId, pageNumber, pageSize);
        
        // TODO: Implement getESignaturesByContract in service
        Page<ESignature> eSignatures = eSignatureService.getAllESignatures(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (eSignatures.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<ESignature>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có chữ ký điện tử nào cho hợp đồng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<ESignature> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            eSignatures, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<ESignature>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách chữ ký điện tử theo hợp đồng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-user/{userId}")
    @Operation(
        summary = "Lấy chữ ký điện tử theo người dùng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách chữ ký điện tử theo ID người dùng cụ thể.

        ## 🔹 Đầu vào

        📄 userId (bắt buộc, path)
        Loại: string
        Mô tả: ID của người dùng

        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)

        📄 pageSize (tùy chọn, query)
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
        Loại: PaginatedResponse<ESignature>
        Mô tả: Danh sách chữ ký điện tử theo người dùng

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
            @ApiResponse(responseCode = "200", description = "E-signatures retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No e-signatures found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<ESignature>>> getESignaturesByUser(
            @Parameter(description = "ID của người dùng", required = true)
            @PathVariable String userId,
            
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(defaultValue = "") String searchTerm,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting e-signatures by user: {}, page: {}, size: {}", userId, pageNumber, pageSize);
        
        // TODO: Implement getESignaturesByUser in service
        Page<ESignature> eSignatures = eSignatureService.getAllESignatures(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (eSignatures.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<ESignature>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có chữ ký điện tử nào của người dùng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<ESignature> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            eSignatures, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<ESignature>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách chữ ký điện tử theo người dùng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-status/{status}")
    @Operation(
        summary = "Lấy chữ ký điện tử theo trạng thái",
        description = """
        ## 📖 Mô tả
        Lấy danh sách chữ ký điện tử theo trạng thái cụ thể.

        ## 🔹 Đầu vào

        📄 status (bắt buộc, path)
        Loại: string
        Mô tả: Trạng thái chữ ký điện tử cần lọc

        ## 🔹 Đầu ra

        📝 data
        Loại: List<ESignature>
        Mô tả: Danh sách chữ ký điện tử theo trạng thái

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
            @ApiResponse(responseCode = "200", description = "E-signatures retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No e-signatures found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByStatus(
            @Parameter(description = "Trạng thái chữ ký điện tử cần lọc", required = true)
            @PathVariable String status) {
        
        log.info("Getting e-signatures by status: {}", status);
        
        // TODO: Implement getESignaturesByStatus in service
        List<ESignature> eSignatures = new java.util.ArrayList<>();
        
        if (eSignatures.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<ESignature>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có chữ ký điện tử nào với trạng thái này")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<List<ESignature>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách chữ ký điện tử theo trạng thái thành công")
            .data(eSignatures)
            .build());
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê chữ ký điện tử",
        description = """
        ## 📖 Mô tả
        Lấy thống kê tổng quan về chữ ký điện tử trong hệ thống.

        ## 🔹 Đầu vào

        Không có tham số đầu vào.

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Thống kê chữ ký điện tử

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK)

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
            @ApiResponse(responseCode = "200", description = "E-signature statistics retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> getESignatureStats() {
        log.info("Getting e-signature statistics");
        
        // TODO: Implement getESignatureStats in service
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalESignatures", 0);
        stats.put("activeESignatures", 0);
        stats.put("completedESignatures", 0);
        stats.put("pendingESignatures", 0);
        stats.put("byStatus", new java.util.HashMap<>());
        stats.put("byUser", new java.util.HashMap<>());
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thống kê chữ ký điện tử thành công")
            .data(stats)
            .build());
    }
}
