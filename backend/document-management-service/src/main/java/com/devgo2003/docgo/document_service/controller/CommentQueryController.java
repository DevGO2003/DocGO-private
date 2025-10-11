package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.entity.Comment;
import com.devgo2003.docgo.document_service.service.CommentService;
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
 * Controller cho Comment Query APIs
 * Cung cấp các API query và search cho comments
 */
@RestController
@RequestMapping("/api/v1/document-management-service/v1/comments/query")
@Tag(name = "Comment Query Management", description = "API tìm kiếm và truy vấn bình luận")
@RequiredArgsConstructor
@Slf4j
public class CommentQueryController {

    private final CommentService commentService;

    @GetMapping("/search")
    @Operation(
        summary = "Tìm kiếm bình luận",
        description = """
        ## 📖 Mô tả
        Tìm kiếm bình luận theo từ khóa với phân trang và sắp xếp.

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
        Mô tả: Bao gồm bình luận đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Comment>
        Mô tả: Danh sách bình luận tìm được

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
            @ApiResponse(responseCode = "204", description = "No comments found"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Comment>>> searchComments(
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
            
            @Parameter(description = "Bao gồm bình luận đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Searching comments with term: {}, page: {}, size: {}", searchTerm, pageNumber, pageSize);
        
        // TODO: Implement searchComments in service
        Page<Comment> comments = commentService.getAllComments(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        if (comments.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Comment>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không tìm thấy bình luận nào")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Comment> paginatedResponse = PaginatedResponse.<Comment>builder()
            .content(comments.getContent())
            .pageNumber(comments.getNumber())
            .pageSize(comments.getSize())
            .totalElements(comments.getTotalElements())
            .totalPages(comments.getTotalPages())
            .first(comments.isFirst())
            .last(comments.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Comment>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tìm kiếm bình luận thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-contract/{contractId}")
    @Operation(
        summary = "Lấy bình luận theo hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách bình luận theo ID hợp đồng cụ thể.

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
        Loại: PaginatedResponse<Comment>
        Mô tả: Danh sách bình luận theo hợp đồng

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
            @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No comments found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Comment>>> getCommentsByContract(
            @Parameter(description = "ID của hợp đồng", required = true)
            @PathVariable String contractId,
            
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting comments by contract: {}, page: {}, size: {}", contractId, pageNumber, pageSize);
        
        // TODO: Implement getCommentsByContract in service
        Page<Comment> comments = commentService.getAllComments(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (comments.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Comment>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có bình luận nào cho hợp đồng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Comment> paginatedResponse = PaginatedResponse.<Comment>builder()
            .content(comments.getContent())
            .pageNumber(comments.getNumber())
            .pageSize(comments.getSize())
            .totalElements(comments.getTotalElements())
            .totalPages(comments.getTotalPages())
            .first(comments.isFirst())
            .last(comments.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Comment>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách bình luận theo hợp đồng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-user/{userId}")
    @Operation(
        summary = "Lấy bình luận theo người dùng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách bình luận theo ID người dùng cụ thể.

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
        Loại: PaginatedResponse<Comment>
        Mô tả: Danh sách bình luận theo người dùng

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
            @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No comments found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Comment>>> getCommentsByUser(
            @Parameter(description = "ID của người dùng", required = true)
            @PathVariable String userId,
            
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting comments by user: {}, page: {}, size: {}", userId, pageNumber, pageSize);
        
        // TODO: Implement getCommentsByUser in service
        Page<Comment> comments = commentService.getAllComments(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (comments.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Comment>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có bình luận nào của người dùng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Comment> paginatedResponse = PaginatedResponse.<Comment>builder()
            .content(comments.getContent())
            .pageNumber(comments.getNumber())
            .pageSize(comments.getSize())
            .totalElements(comments.getTotalElements())
            .totalPages(comments.getTotalPages())
            .first(comments.isFirst())
            .last(comments.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Comment>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách bình luận theo người dùng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/recent")
    @Operation(
        summary = "Lấy bình luận gần đây",
        description = """
        ## 📖 Mô tả
        Lấy danh sách bình luận gần đây nhất.

        ## 🔹 Đầu vào

        📄 limit (tùy chọn, query)
        Loại: integer
        Mô tả: Số lượng bình luận tối đa (mặc định: 10)

        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Bao gồm bình luận đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: List<Comment>
        Mô tả: Danh sách bình luận gần đây

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
            @ApiResponse(responseCode = "200", description = "Recent comments retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No recent comments found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<Comment>>> getRecentComments(
            @Parameter(description = "Số lượng bình luận tối đa (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int limit,
            
            @Parameter(description = "Bao gồm bình luận đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Getting recent comments, limit: {}", limit);
        
        // TODO: Implement getRecentComments in service
        List<Comment> comments = new java.util.ArrayList<>();
        
        if (comments.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<Comment>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có bình luận gần đây nào")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<List<Comment>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách bình luận gần đây thành công")
            .data(comments)
            .build());
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê bình luận",
        description = """
        ## 📖 Mô tả
        Lấy thống kê tổng quan về bình luận trong hệ thống.

        ## 🔹 Đầu vào

        Không có tham số đầu vào.

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Thống kê bình luận

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
            @ApiResponse(responseCode = "200", description = "Comment statistics retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> getCommentStats() {
        log.info("Getting comment statistics");
        
        // TODO: Implement getCommentStats in service
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalComments", 0);
        stats.put("activeComments", 0);
        stats.put("deletedComments", 0);
        stats.put("commentsByContract", new java.util.HashMap<>());
        stats.put("commentsByUser", new java.util.HashMap<>());
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thống kê bình luận thành công")
            .data(stats)
            .build());
    }
}
