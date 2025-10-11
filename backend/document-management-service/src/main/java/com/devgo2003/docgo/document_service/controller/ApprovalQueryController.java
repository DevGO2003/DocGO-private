package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.entity.Approval;
import com.devgo2003.docgo.document_service.service.ApprovalService;
import com.devgo2003.docgo.document_service.util.PaginatedResponseUtil;
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
 * Controller cho Approval Query APIs
 * Cung cấp các API query và search cho approvals
 */
@RestController
@RequestMapping("/api/v1/document-management-service/v1/approvals/query")
@Tag(name = "Approval Query Management", description = "API tìm kiếm và truy vấn phê duyệt")
@RequiredArgsConstructor
@Slf4j
public class ApprovalQueryController {

    private final ApprovalService approvalService;

    @GetMapping("/search")
    @Operation(
        summary = "Tìm kiếm phê duyệt",
        description = """
        ## 📖 Mô tả
        Tìm kiếm phê duyệt theo từ khóa với phân trang và sắp xếp.

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
        Mô tả: Bao gồm phê duyệt đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Approval>
        Mô tả: Danh sách phê duyệt tìm được

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
            @ApiResponse(responseCode = "204", description = "No approvals found"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Approval>>> searchApprovals(
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Từ khóa tìm kiếm") 
            @RequestParam(defaultValue = "") String searchTerm,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection,
            
            @Parameter(description = "Bao gồm phê duyệt đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Searching approvals with term: {}, page: {}, size: {}", searchTerm, pageNumber, pageSize);
        
        // TODO: Implement searchApprovals in service
        Page<Approval> approvals = approvalService.getAllApprovals(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        if (approvals.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không tìm thấy phê duyệt nào")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Approval> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            approvals, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tìm kiếm phê duyệt thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-contract/{contractId}")
    @Operation(
        summary = "Lấy phê duyệt theo hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách phê duyệt theo ID hợp đồng cụ thể.

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
        Loại: PaginatedResponse<Approval>
        Mô tả: Danh sách phê duyệt theo hợp đồng

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
            @ApiResponse(responseCode = "200", description = "Approvals retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No approvals found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Approval>>> getApprovalsByContract(
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
        
        log.info("Getting approvals by contract: {}, page: {}, size: {}", contractId, pageNumber, pageSize);
        
        // TODO: Implement getApprovalsByContract in service
        Page<Approval> approvals = approvalService.getAllApprovals(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (approvals.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có phê duyệt nào cho hợp đồng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Approval> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            approvals, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách phê duyệt theo hợp đồng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-user/{userId}")
    @Operation(
        summary = "Lấy phê duyệt theo người dùng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách phê duyệt theo ID người dùng cụ thể.

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
        Loại: PaginatedResponse<Approval>
        Mô tả: Danh sách phê duyệt theo người dùng

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
            @ApiResponse(responseCode = "200", description = "Approvals retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No approvals found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Approval>>> getApprovalsByUser(
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
        
        log.info("Getting approvals by user: {}, page: {}, size: {}", userId, pageNumber, pageSize);
        
        // TODO: Implement getApprovalsByUser in service
        Page<Approval> approvals = approvalService.getAllApprovals(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (approvals.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có phê duyệt nào của người dùng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Approval> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            approvals, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách phê duyệt theo người dùng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-status/{status}")
    @Operation(
        summary = "Lấy phê duyệt theo trạng thái",
        description = """
        ## 📖 Mô tả
        Lấy danh sách phê duyệt theo trạng thái cụ thể.

        ## 🔹 Đầu vào

        📄 status (bắt buộc, path)
        Loại: string
        Mô tả: Trạng thái phê duyệt cần lọc

        ## 🔹 Đầu ra

        📝 data
        Loại: List<Approval>
        Mô tả: Danh sách phê duyệt theo trạng thái

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
            @ApiResponse(responseCode = "200", description = "Approvals retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No approvals found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByStatus(
            @Parameter(description = "Trạng thái phê duyệt cần lọc", required = true)
            @PathVariable String status) {
        
        log.info("Getting approvals by status: {}", status);
        
        // TODO: Implement getApprovalsByStatus in service
        List<Approval> approvals = new java.util.ArrayList<>();
        
        if (approvals.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<Approval>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có phê duyệt nào với trạng thái này")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<List<Approval>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách phê duyệt theo trạng thái thành công")
            .data(approvals)
            .build());
    }

    @GetMapping("/pending")
    @Operation(
        summary = "Lấy phê duyệt đang chờ",
        description = """
        ## 📖 Mô tả
        Lấy danh sách phê duyệt đang chờ xử lý.

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

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Approval>
        Mô tả: Danh sách phê duyệt đang chờ

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
            @ApiResponse(responseCode = "200", description = "Pending approvals retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No pending approvals found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Approval>>> getPendingApprovals(
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
        
        log.info("Getting pending approvals, page: {}, size: {}", pageNumber, pageSize);
        
        // TODO: Implement getPendingApprovals in service
        Page<Approval> approvals = approvalService.getAllApprovals(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (approvals.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có phê duyệt nào đang chờ")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Approval> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            approvals, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Approval>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách phê duyệt đang chờ thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê phê duyệt",
        description = """
        ## 📖 Mô tả
        Lấy thống kê tổng quan về phê duyệt trong hệ thống.

        ## 🔹 Đầu vào

        Không có tham số đầu vào.

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Thống kê phê duyệt

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
            @ApiResponse(responseCode = "200", description = "Approval statistics retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> getApprovalStats() {
        log.info("Getting approval statistics");
        
        // TODO: Implement getApprovalStats in service
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalApprovals", 0);
        stats.put("pendingApprovals", 0);
        stats.put("approvedApprovals", 0);
        stats.put("rejectedApprovals", 0);
        stats.put("byStatus", new java.util.HashMap<>());
        stats.put("byUser", new java.util.HashMap<>());
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thống kê phê duyệt thành công")
            .data(stats)
            .build());
    }
}
