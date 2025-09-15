package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Reminder;
import com.devgo2003.docgo.contract_service.service.ReminderService;
import com.devgo2003.docgo.contract_service.dto.ReminderCreateRequest;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.common.util.ResponseBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/contract-management-service/reminders")
@Tag(name = "API Quản lý Nhắc nhở", description = "Các API để quản lý nhắc nhở trong hệ thống DocGO")
public class ReminderController {

    private final ReminderService reminderService;
    private final HttpServletRequest request;

    public ReminderController(ReminderService reminderService, HttpServletRequest request) {
        this.reminderService = reminderService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Lấy danh sách tất cả nhắc nhở", 
        description = """
        🔹 Đầu vào
        
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
        
        📄 searchTerm (tùy chọn, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm
        
        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Bao gồm bản ghi đã xóa (mặc định: false)
        
        🔹 Đầu ra
        
        📝 data
        Loại: List<Reminder>
        Mô tả: Danh sách nhắc nhở
        
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
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔗 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<List<Reminder>>> getAllReminders(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        List<Reminder> reminders = reminderService.getAllReminders();
        
        if (reminders.isEmpty()) {
            RestResponse<List<Reminder>> response = RestResponse.<List<Reminder>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có nhắc nhở nào.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Reminder>> response = RestResponse.<List<Reminder>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách nhắc nhở thành công.")
            .data(reminders)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Lấy chi tiết nhắc nhở", 
        description = """
        🔹 Đầu vào
        
        🔗 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của nhắc nhở cần lấy
        
        🔹 Đầu ra
        
        📝 data
        Loại: Reminder
        Mô tả: Thông tin chi tiết nhắc nhở
        
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
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔗 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Reminder>> getReminder(@PathVariable String id) {
        Optional<Reminder> reminder = reminderService.getReminderById(id);
        
        if (reminder.isEmpty()) {
            RestResponse<Reminder> response = RestResponse.<Reminder>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy nhắc nhở với ID: " + id)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<Reminder> response = RestResponse.<Reminder>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy chi tiết nhắc nhở thành công.")
            .data(reminder.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Tạo nhắc nhở mới", 
        description = """
        🔹 Đầu vào
        
        📄 reminder (bắt buộc, body)
        Loại: ReminderCreateRequest
        Mô tả: Thông tin nhắc nhở cần tạo (contractId, title, description, reminderType, reminderDate, isRecurring, recurringPattern)
        
        🔹 Đầu ra
        
        📝 data
        Loại: Reminder
        Mô tả: Thông tin nhắc nhở đã được tạo thành công
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (201: Created)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔗 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Reminder>> createReminder(@RequestBody ReminderCreateRequest request) {
        Reminder reminder = reminderService.createReminder(request);
        
        RestResponse<Reminder> response = RestResponse.<Reminder>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Tạo nhắc nhở thành công.")
            .data(reminder)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/reminders")
    @Operation(summary = "Tạo reminder mới", description = "Tạo reminder mới cho contract")
    public ResponseEntity<RestResponse<Reminder>> createReminder(
            @PathVariable String contractId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Reminder.ReminderType reminderType,
            @RequestParam LocalDateTime scheduledAt) {
        
        Reminder reminder = reminderService.createReminder(contractId, title, description, reminderType, scheduledAt);
        
        return ResponseBuilder.success(reminder, "Tạo reminder thành công");
    }

    @GetMapping("/contracts/{contractId}/reminders")
    @Operation(summary = "Lấy danh sách reminder", description = "Lấy tất cả reminder của contract")
    public ResponseEntity<RestResponse<List<Reminder>>> getRemindersByContractId(@PathVariable String contractId) {
        List<Reminder> reminders = reminderService.getRemindersByContractId(contractId);
        
        if (reminders.isEmpty()) {
            return ResponseBuilder.noContent("Không có reminder nào cho contract này");
        }
        
        return ResponseBuilder.success(reminders, "Lấy danh sách reminder thành công");
    }

    @GetMapping("/reminders/{id}")
    @Operation(summary = "Lấy reminder theo ID", description = "Lấy chi tiết reminder")
    public ResponseEntity<RestResponse<Reminder>> getReminderById(@PathVariable String id) {
        Optional<Reminder> reminder = reminderService.getReminderById(id);
        
        if (reminder.isEmpty()) {
            return ResponseBuilder.notFound("Không tìm thấy reminder");
        }
        
        return ResponseBuilder.success(reminder.get(), "Lấy reminder thành công");
    }

    @GetMapping("/contracts/{contractId}/reminders/pending")
    @Operation(summary = "Lấy reminder pending", description = "Lấy danh sách reminder đang pending")
    public ResponseEntity<RestResponse<List<Reminder>>> getPendingReminders(@PathVariable String contractId) {
        List<Reminder> reminders = reminderService.getPendingRemindersByContractId(contractId);
        
        if (reminders.isEmpty()) {
            return ResponseBuilder.noContent("Không có reminder nào đang pending");
        }
        
        return ResponseBuilder.success(reminders, "Lấy danh sách reminder pending thành công");
    }

    @GetMapping("/contracts/{contractId}/reminders/completed")
    @Operation(summary = "Lấy reminder completed", description = "Lấy danh sách reminder đã hoàn thành")
    public ResponseEntity<RestResponse<List<Reminder>>> getCompletedReminders(@PathVariable String contractId) {
        List<Reminder> reminders = reminderService.getCompletedRemindersByContractId(contractId);
        
        if (reminders.isEmpty()) {
            return ResponseBuilder.noContent("Không có reminder nào đã hoàn thành");
        }
        
        return ResponseBuilder.success(reminders, "Lấy danh sách reminder completed thành công");
    }

    @GetMapping("/contracts/{contractId}/reminders/escalated")
    @Operation(summary = "Lấy reminder escalated", description = "Lấy danh sách reminder đã escalated")
    public ResponseEntity<RestResponse<List<Reminder>>> getEscalatedReminders(@PathVariable String contractId) {
        List<Reminder> reminders = reminderService.getEscalatedRemindersByContractId(contractId);
        
        if (reminders.isEmpty()) {
            return ResponseBuilder.noContent("Không có reminder nào đã escalated");
        }
        
        return ResponseBuilder.success(reminders, "Lấy danh sách reminder escalated thành công");
    }

    @GetMapping("/reminders/due")
    @Operation(summary = "Lấy reminder đến hạn", description = "Lấy danh sách reminder đến hạn")
    public ResponseEntity<RestResponse<List<Reminder>>> getDueReminders(@RequestParam LocalDateTime currentTime) {
        List<Reminder> reminders = reminderService.getDueReminders(currentTime);
        
        if (reminders.isEmpty()) {
            return ResponseBuilder.noContent("Không có reminder nào đến hạn");
        }
        
        return ResponseBuilder.success(reminders, "Lấy danh sách reminder đến hạn thành công");
    }

    @GetMapping("/reminders/overdue")
    @Operation(summary = "Lấy reminder quá hạn", description = "Lấy danh sách reminder quá hạn")
    public ResponseEntity<RestResponse<List<Reminder>>> getOverdueReminders(@RequestParam LocalDateTime currentTime) {
        List<Reminder> reminders = reminderService.getOverdueReminders(currentTime);
        
        if (reminders.isEmpty()) {
            return ResponseBuilder.noContent("Không có reminder nào quá hạn");
        }
        
        return ResponseBuilder.success(reminders, "Lấy danh sách reminder quá hạn thành công");
    }

    @PutMapping("/reminders/{id}/send")
    @Operation(summary = "Gửi reminder", description = "Gửi reminder")
    public ResponseEntity<RestResponse<Reminder>> sendReminder(@PathVariable String id) {
        Reminder reminder = reminderService.sendReminder(id);
        
        return ResponseBuilder.success(reminder, "Gửi reminder thành công");
    }

    @PutMapping("/reminders/{id}/complete")
    @Operation(summary = "Hoàn thành reminder", description = "Đánh dấu reminder hoàn thành")
    public ResponseEntity<RestResponse<Reminder>> completeReminder(
            @PathVariable String id,
            @RequestParam String completedBy,
            @RequestParam String completionNotes) {
        Reminder reminder = reminderService.completeReminder(id, completedBy, completionNotes);
        
        return ResponseBuilder.success(reminder, "Hoàn thành reminder thành công");
    }

    @PutMapping("/reminders/{id}/cancel")
    @Operation(summary = "Hủy reminder", description = "Hủy reminder")
    public ResponseEntity<RestResponse<Reminder>> cancelReminder(
            @PathVariable String id,
            @RequestParam String cancelledBy,
            @RequestParam String cancellationReason) {
        Reminder reminder = reminderService.cancelReminder(id, cancelledBy, cancellationReason);
        
        return ResponseBuilder.success(reminder, "Hủy reminder thành công");
    }

    @PutMapping("/reminders/{id}/escalate")
    @Operation(summary = "Escalate reminder", description = "Escalate reminder")
    public ResponseEntity<RestResponse<Reminder>> escalateReminder(
            @PathVariable String id,
            @RequestParam String escalatedTo) {
        Reminder reminder = reminderService.escalateReminder(id, escalatedTo);
        
        return ResponseBuilder.success(reminder, "Escalate reminder thành công");
    }

    @DeleteMapping("/reminders/{id}")
    @Operation(summary = "Xóa reminder", description = "Soft delete reminder")
    public ResponseEntity<RestResponse<Void>> deleteReminder(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        reminderService.deleteReminder(id, deletedBy);
        
        return ResponseBuilder.success(null, "Xóa reminder thành công");
    }

    @PutMapping("/reminders/{id}/restore")
    @Operation(summary = "Khôi phục reminder", description = "Khôi phục reminder đã xóa")
    public ResponseEntity<RestResponse<Reminder>> restoreReminder(@PathVariable String id) {
        Reminder reminder = reminderService.restoreReminder(id);
        
        return ResponseBuilder.success(reminder, "Khôi phục reminder thành công");
    }

    @GetMapping("/contracts/{contractId}/reminders/count")
    @Operation(summary = "Đếm số reminder", description = "Đếm số lượng reminder")
    public ResponseEntity<RestResponse<Long>> countRemindersByContractId(@PathVariable String contractId) {
        long count = reminderService.countRemindersByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số reminder thành công");
    }

    @GetMapping("/contracts/{contractId}/reminders/exists")
    @Operation(summary = "Kiểm tra có reminder", description = "Kiểm tra contract có reminder không")
    public ResponseEntity<RestResponse<Boolean>> existsRemindersByContractId(@PathVariable String contractId) {
        boolean exists = reminderService.existsRemindersByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có reminder thành công");
    }
}
