package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.entity.Reminder;
import com.devgo2003.docgo.document_service.service.ReminderService;
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
 * Controller cho Reminder Query APIs
 * Cung cấp các API query và search cho reminders
 */
@RestController
@RequestMapping("/api/v1/document-management-service/v1/reminders/query")
@Tag(name = "Reminder Query Management", description = "API tìm kiếm và truy vấn nhắc nhở")
@RequiredArgsConstructor
@Slf4j
public class ReminderQueryController {

    private final ReminderService reminderService;

    @GetMapping("/search")
    @Operation(
        summary = "Tìm kiếm nhắc nhở",
        description = """
        ## 📖 Mô tả
        Tìm kiếm nhắc nhở theo từ khóa với phân trang và sắp xếp.

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
        Mô tả: Bao gồm nhắc nhở đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Reminder>
        Mô tả: Danh sách nhắc nhở tìm được

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
            @ApiResponse(responseCode = "204", description = "No reminders found"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Reminder>>> searchReminders(
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
            
            @Parameter(description = "Bao gồm nhắc nhở đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Searching reminders with term: {}, page: {}, size: {}", searchTerm, pageNumber, pageSize);
        
        // TODO: Implement searchReminders in service
        Page<Reminder> reminders = reminderService.getAllReminders(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        if (reminders.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không tìm thấy nhắc nhở nào")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Reminder> paginatedResponse = PaginatedResponse.<Reminder>builder()
            .content(reminders.getContent())
            .pageNumber(reminders.getNumber())
            .pageSize(reminders.getSize())
            .totalElements(reminders.getTotalElements())
            .totalPages(reminders.getTotalPages())
            .first(reminders.isFirst())
            .last(reminders.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tìm kiếm nhắc nhở thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-contract/{contractId}")
    @Operation(
        summary = "Lấy nhắc nhở theo hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách nhắc nhở theo ID hợp đồng cụ thể.

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
        Loại: PaginatedResponse<Reminder>
        Mô tả: Danh sách nhắc nhở theo hợp đồng

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
            @ApiResponse(responseCode = "200", description = "Reminders retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No reminders found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Reminder>>> getRemindersByContract(
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
        
        log.info("Getting reminders by contract: {}, page: {}, size: {}", contractId, pageNumber, pageSize);
        
        // TODO: Implement getRemindersByContract in service
        Page<Reminder> reminders = reminderService.getAllReminders(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (reminders.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có nhắc nhở nào cho hợp đồng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Reminder> paginatedResponse = PaginatedResponse.<Reminder>builder()
            .content(reminders.getContent())
            .pageNumber(reminders.getNumber())
            .pageSize(reminders.getSize())
            .totalElements(reminders.getTotalElements())
            .totalPages(reminders.getTotalPages())
            .first(reminders.isFirst())
            .last(reminders.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách nhắc nhở theo hợp đồng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-user/{userId}")
    @Operation(
        summary = "Lấy nhắc nhở theo người dùng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách nhắc nhở theo ID người dùng cụ thể.

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
        Loại: PaginatedResponse<Reminder>
        Mô tả: Danh sách nhắc nhở theo người dùng

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
            @ApiResponse(responseCode = "200", description = "Reminders retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No reminders found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Reminder>>> getRemindersByUser(
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
        
        log.info("Getting reminders by user: {}, page: {}, size: {}", userId, pageNumber, pageSize);
        
        // TODO: Implement getRemindersByUser in service
        Page<Reminder> reminders = reminderService.getAllReminders(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (reminders.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có nhắc nhở nào của người dùng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Reminder> paginatedResponse = PaginatedResponse.<Reminder>builder()
            .content(reminders.getContent())
            .pageNumber(reminders.getNumber())
            .pageSize(reminders.getSize())
            .totalElements(reminders.getTotalElements())
            .totalPages(reminders.getTotalPages())
            .first(reminders.isFirst())
            .last(reminders.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách nhắc nhở theo người dùng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/upcoming")
    @Operation(
        summary = "Lấy nhắc nhở sắp tới",
        description = """
        ## 📖 Mô tả
        Lấy danh sách nhắc nhở sắp tới (trong vòng 7 ngày).

        ## 🔹 Đầu vào

        📄 days (tùy chọn, query)
        Loại: integer
        Mô tả: Số ngày trước khi nhắc nhở (mặc định: 7)

        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)

        📄 pageSize (tùy chọn, query)
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 10)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Reminder>
        Mô tả: Danh sách nhắc nhở sắp tới

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
            @ApiResponse(responseCode = "200", description = "Upcoming reminders retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No upcoming reminders found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Reminder>>> getUpcomingReminders(
            @Parameter(description = "Số ngày trước khi nhắc nhở (mặc định: 7)") 
            @RequestParam(defaultValue = "7") int days,
            
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize) {
        
        log.info("Getting upcoming reminders within {} days, page: {}, size: {}", days, pageNumber, pageSize);
        
        // TODO: Implement getUpcomingReminders in service
        Page<Reminder> reminders = reminderService.getAllReminders(pageNumber, pageSize, "scheduledAt", "ASC", false);
        
        if (reminders.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có nhắc nhở nào sắp tới")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Reminder> paginatedResponse = PaginatedResponse.<Reminder>builder()
            .content(reminders.getContent())
            .pageNumber(reminders.getNumber())
            .pageSize(reminders.getSize())
            .totalElements(reminders.getTotalElements())
            .totalPages(reminders.getTotalPages())
            .first(reminders.isFirst())
            .last(reminders.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Reminder>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách nhắc nhở sắp tới thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê nhắc nhở",
        description = """
        ## 📖 Mô tả
        Lấy thống kê tổng quan về nhắc nhở trong hệ thống.

        ## 🔹 Đầu vào

        Không có tham số đầu vào.

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Thống kê nhắc nhở

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
            @ApiResponse(responseCode = "200", description = "Reminder statistics retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> getReminderStats() {
        log.info("Getting reminder statistics");
        
        // TODO: Implement getReminderStats in service
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalReminders", 0);
        stats.put("activeReminders", 0);
        stats.put("completedReminders", 0);
        stats.put("upcomingReminders", 0);
        stats.put("overdueReminders", 0);
        stats.put("byType", new java.util.HashMap<>());
        stats.put("byUser", new java.util.HashMap<>());
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thống kê nhắc nhở thành công")
            .data(stats)
            .build());
    }
}
