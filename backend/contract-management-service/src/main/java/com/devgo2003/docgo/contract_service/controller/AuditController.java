package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.AuditLog;
import com.devgo2003.docgo.contract_service.service.AuditService;
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
@Tag(name = "Audit Management", description = "API quản lý audit log cho hợp đồng")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @PostMapping("/audit-logs")
    @Operation(summary = "Tạo audit log mới", description = "Tạo audit log mới")
    public ResponseEntity<RestResponse<AuditLog>> createAuditLog(
            @RequestParam String eventType,
            @RequestParam AuditLog.EventCategory eventCategory,
            @RequestParam String action,
            @RequestParam String description,
            @RequestParam String userId,
            @RequestParam String userName) {
        
        AuditLog auditLog = auditService.createAuditLog(eventType, eventCategory, action, description, userId, userName);
        
        return ResponseBuilder.success(auditLog, "Tạo audit log thành công");
    }

    @PostMapping("/contracts/{contractId}/audit-logs")
    @Operation(summary = "Tạo audit log cho contract", description = "Tạo audit log mới cho contract")
    public ResponseEntity<RestResponse<AuditLog>> createAuditLogForContract(
            @PathVariable String contractId,
            @RequestParam String eventType,
            @RequestParam AuditLog.EventCategory eventCategory,
            @RequestParam String action,
            @RequestParam String description,
            @RequestParam String userId,
            @RequestParam String userName) {
        
        AuditLog auditLog = auditService.createAuditLogForContract(contractId, eventType, eventCategory, action, description, userId, userName);
        
        return ResponseBuilder.success(auditLog, "Tạo audit log cho contract thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs")
    @Operation(summary = "Lấy danh sách audit log", description = "Lấy tất cả audit log của contract")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByContractId(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log nào cho contract này");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log thành công");
    }

    @GetMapping("/audit-logs/{id}")
    @Operation(summary = "Lấy audit log theo ID", description = "Lấy chi tiết audit log")
    public ResponseEntity<RestResponse<AuditLog>> getAuditLogById(@PathVariable String id) {
        Optional<AuditLog> auditLog = auditService.getAuditLogById(id);
        
        if (auditLog.isEmpty()) {
            return ResponseBuilder.notFound("Không tìm thấy audit log");
        }
        
        return ResponseBuilder.success(auditLog.get(), "Lấy audit log thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/category/{eventCategory}")
    @Operation(summary = "Lấy audit log theo event category", description = "Lấy danh sách audit log theo event category")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByEventCategory(
            @PathVariable String contractId,
            @PathVariable AuditLog.EventCategory eventCategory) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByEventCategory(contractId, eventCategory);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log nào với event category này");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log theo event category thành công");
    }

    @GetMapping("/audit-logs/user/{userId}")
    @Operation(summary = "Lấy audit log theo user ID", description = "Lấy danh sách audit log của user")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByUserId(@PathVariable String userId) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByUserId(userId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log nào của user này");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log của user thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/successful")
    @Operation(summary = "Lấy audit log successful", description = "Lấy danh sách audit log thành công")
    public ResponseEntity<RestResponse<List<AuditLog>>> getSuccessfulLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getSuccessfulLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log successful nào");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log successful thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/failed")
    @Operation(summary = "Lấy audit log failed", description = "Lấy danh sách audit log thất bại")
    public ResponseEntity<RestResponse<List<AuditLog>>> getFailedLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getFailedLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log failed nào");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log failed thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/high-severity")
    @Operation(summary = "Lấy audit log high severity", description = "Lấy danh sách audit log mức độ cao")
    public ResponseEntity<RestResponse<List<AuditLog>>> getHighSeverityLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getHighSeverityLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log high severity nào");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log high severity thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/sensitive")
    @Operation(summary = "Lấy audit log sensitive", description = "Lấy danh sách audit log nhạy cảm")
    public ResponseEntity<RestResponse<List<AuditLog>>> getSensitiveLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getSensitiveLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log sensitive nào");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log sensitive thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/compliance-required")
    @Operation(summary = "Lấy audit log compliance required", description = "Lấy danh sách audit log cần compliance")
    public ResponseEntity<RestResponse<List<AuditLog>>> getComplianceRequiredLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getComplianceRequiredLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log compliance required nào");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log compliance required thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/order-by-created")
    @Operation(summary = "Lấy audit log sắp xếp theo thời gian tạo", description = "Lấy danh sách audit log sắp xếp theo thời gian tạo")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsOrderByCreatedAt(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByContractIdOrderByCreatedAt(contractId);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log nào");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log sắp xếp theo thời gian tạo thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/created-between")
    @Operation(summary = "Lấy audit log theo thời gian tạo", description = "Lấy danh sách audit log trong khoảng thời gian tạo")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByContractIdAndCreatedAtBetween(contractId, startDate, endDate);
        
        if (auditLogs.isEmpty()) {
            return ResponseBuilder.noContent("Không có audit log nào trong khoảng thời gian này");
        }
        
        return ResponseBuilder.success(auditLogs, "Lấy danh sách audit log theo thời gian tạo thành công");
    }

    @PutMapping("/audit-logs/{id}/mark-success")
    @Operation(summary = "Đánh dấu thành công", description = "Đánh dấu audit log thành công")
    public ResponseEntity<RestResponse<AuditLog>> markAsSuccess(@PathVariable String id) {
        AuditLog auditLog = auditService.markAsSuccess(id);
        
        return ResponseBuilder.success(auditLog, "Đánh dấu audit log thành công");
    }

    @PutMapping("/audit-logs/{id}/mark-failure")
    @Operation(summary = "Đánh dấu thất bại", description = "Đánh dấu audit log thất bại")
    public ResponseEntity<RestResponse<AuditLog>> markAsFailure(
            @PathVariable String id,
            @RequestParam String errorCode,
            @RequestParam String errorMessage) {
        AuditLog auditLog = auditService.markAsFailure(id, errorCode, errorMessage);
        
        return ResponseBuilder.success(auditLog, "Đánh dấu audit log thất bại");
    }

    @PutMapping("/audit-logs/{id}/mark-sensitive")
    @Operation(summary = "Đánh dấu sensitive", description = "Đánh dấu audit log là nhạy cảm")
    public ResponseEntity<RestResponse<AuditLog>> markAsSensitive(@PathVariable String id) {
        AuditLog auditLog = auditService.markAsSensitive(id);
        
        return ResponseBuilder.success(auditLog, "Đánh dấu audit log sensitive");
    }

    @PutMapping("/audit-logs/{id}/compliance-requirement")
    @Operation(summary = "Cập nhật compliance requirement", description = "Cập nhật yêu cầu compliance")
    public ResponseEntity<RestResponse<AuditLog>> setComplianceRequirement(
            @PathVariable String id,
            @RequestParam String complianceStandard) {
        AuditLog auditLog = auditService.setComplianceRequirement(id, complianceStandard);
        
        return ResponseBuilder.success(auditLog, "Cập nhật compliance requirement thành công");
    }

    @PutMapping("/audit-logs/{id}/mark-exported")
    @Operation(summary = "Đánh dấu đã exported", description = "Đánh dấu audit log đã được exported")
    public ResponseEntity<RestResponse<AuditLog>> markAsExported(
            @PathVariable String id,
            @RequestParam String exportedBy) {
        AuditLog auditLog = auditService.markAsExported(id, exportedBy);
        
        return ResponseBuilder.success(auditLog, "Đánh dấu audit log đã exported");
    }

    @DeleteMapping("/audit-logs/{id}")
    @Operation(summary = "Xóa audit log", description = "Soft delete audit log")
    public ResponseEntity<RestResponse<Void>> deleteAuditLog(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        auditService.deleteAuditLog(id, deletedBy);
        
        return ResponseBuilder.success(null, "Xóa audit log thành công");
    }

    @PutMapping("/audit-logs/{id}/restore")
    @Operation(summary = "Khôi phục audit log", description = "Khôi phục audit log đã xóa")
    public ResponseEntity<RestResponse<AuditLog>> restoreAuditLog(@PathVariable String id) {
        AuditLog auditLog = auditService.restoreAuditLog(id);
        
        return ResponseBuilder.success(auditLog, "Khôi phục audit log thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/count")
    @Operation(summary = "Đếm số audit log", description = "Đếm số lượng audit log")
    public ResponseEntity<RestResponse<Long>> countAuditLogsByContractId(@PathVariable String contractId) {
        long count = auditService.countAuditLogsByContractId(contractId);
        
        return ResponseBuilder.success(count, "Đếm số audit log thành công");
    }

    @GetMapping("/audit-logs/user/{userId}/count")
    @Operation(summary = "Đếm số audit log của user", description = "Đếm số lượng audit log của user")
    public ResponseEntity<RestResponse<Long>> countAuditLogsByUserId(@PathVariable String userId) {
        long count = auditService.countAuditLogsByUserId(userId);
        
        return ResponseBuilder.success(count, "Đếm số audit log của user thành công");
    }

    @GetMapping("/contracts/{contractId}/audit-logs/exists")
    @Operation(summary = "Kiểm tra có audit log", description = "Kiểm tra contract có audit log không")
    public ResponseEntity<RestResponse<Boolean>> existsAuditLogsByContractId(@PathVariable String contractId) {
        boolean exists = auditService.existsAuditLogsByContractId(contractId);
        
        return ResponseBuilder.success(exists, "Kiểm tra có audit log thành công");
    }
}
