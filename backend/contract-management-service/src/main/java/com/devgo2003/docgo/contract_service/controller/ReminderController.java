package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Reminder;
import com.devgo2003.docgo.contract_service.service.ReminderService;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.common.util.ResponseBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/contract-management-service")
@Tag(name = "Reminder Management", description = "API quản lý nhắc nhở và lịch trình cho hợp đồng")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

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
