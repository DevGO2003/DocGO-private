package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Approval;
import com.devgo2003.docgo.contract_service.service.ApprovalService;
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
@Tag(name = "Approval Management", description = "API quản lý quy trình phê duyệt hợp đồng")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    @PostMapping("/contracts/{contractId}/approve")
    @Operation(summary = "Phê duyệt hợp đồng", description = "Tạo approval mới cho contract")
    public ResponseEntity<RestResponse<Approval>> createApproval(
            @PathVariable String contractId,
            @RequestParam String approverId,
            @RequestParam String approverName,
            @RequestParam String approverEmail,
            @RequestParam String approverRole,
            @RequestParam Approval.ApprovalPriority priority) {
        
        Approval approval = approvalService.createApproval(contractId, approverId, approverName, 
                                                         approverEmail, approverRole, priority);
        
        return ResponseBuilder.success(approval, "Tạo approval thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals")
    @Operation(summary = "Lấy danh sách approval theo contract ID", description = "Lấy tất cả approval của contract")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByContractId(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào cho contract này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval thành công");
    }

    @GetMapping("/approvals/{id}")
    @Operation(summary = "Lấy approval theo ID", description = "Lấy chi tiết approval")
    public ResponseEntity<RestResponse<Approval>> getApprovalById(@PathVariable String id) {
        Optional<Approval> approval = approvalService.getApprovalById(id);
        
        if (approval.isEmpty()) {
            return ResponseBuilder.notFound("Không tìm thấy approval");
        }
        
        return ResponseBuilder.success(approval.get(), "Lấy approval thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/pending")
    @Operation(summary = "Lấy approval đang pending", description = "Lấy danh sách approval đang chờ phê duyệt")
    public ResponseEntity<RestResponse<List<Approval>>> getPendingApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getPendingApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào đang pending");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval pending thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/approved")
    @Operation(summary = "Lấy approval đã approved", description = "Lấy danh sách approval đã được phê duyệt")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getApprovedApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào đã được phê duyệt");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval approved thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/rejected")
    @Operation(summary = "Lấy approval đã rejected", description = "Lấy danh sách approval đã bị từ chối")
    public ResponseEntity<RestResponse<List<Approval>>> getRejectedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getRejectedApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào bị từ chối");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval rejected thành công");
    }

    @GetMapping("/approvals/approver/{approverId}")
    @Operation(summary = "Lấy approval theo approver ID", description = "Lấy danh sách approval của approver")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverId(@PathVariable String approverId) {
        List<Approval> approvals = approvalService.getApprovalsByApproverId(approverId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào của approver này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval của approver thành công");
    }

    @GetMapping("/approvals/approver/email/{approverEmail}")
    @Operation(summary = "Lấy approval theo approver email", description = "Lấy danh sách approval của approver email")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverEmail(@PathVariable String approverEmail) {
        List<Approval> approvals = approvalService.getApprovalsByApproverEmail(approverEmail);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào của approver email này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval của approver email thành công");
    }

    @GetMapping("/approvals/approver/role/{approverRole}")
    @Operation(summary = "Lấy approval theo approver role", description = "Lấy danh sách approval của approver role")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverRole(@PathVariable String approverRole) {
        List<Approval> approvals = approvalService.getApprovalsByApproverRole(approverRole);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào của approver role này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval của approver role thành công");
    }

    @GetMapping("/approvals/expiring")
    @Operation(summary = "Lấy approval sắp hết hạn", description = "Lấy danh sách approval sắp hết hạn")
    public ResponseEntity<RestResponse<List<Approval>>> getExpiringApprovals(@RequestParam LocalDateTime dueDate) {
        List<Approval> approvals = approvalService.getExpiringApprovals(dueDate);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào sắp hết hạn");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval sắp hết hạn thành công");
    }

    @GetMapping("/approvals/expired")
    @Operation(summary = "Lấy approval đã hết hạn", description = "Lấy danh sách approval đã hết hạn")
    public ResponseEntity<RestResponse<List<Approval>>> getExpiredApprovals(@RequestParam LocalDateTime currentTime) {
        List<Approval> approvals = approvalService.getExpiredApprovals(currentTime);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào đã hết hạn");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval đã hết hạn thành công");
    }

    @GetMapping("/approvals/priority/{priority}")
    @Operation(summary = "Lấy approval theo priority", description = "Lấy danh sách approval theo mức độ ưu tiên")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByPriority(@PathVariable Approval.ApprovalPriority priority) {
        List<Approval> approvals = approvalService.getApprovalsByPriority(priority);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào với priority này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval theo priority thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/order/{approvalOrder}")
    @Operation(summary = "Lấy approval theo thứ tự", description = "Lấy danh sách approval theo thứ tự phê duyệt")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByOrder(@PathVariable String contractId, @PathVariable Integer approvalOrder) {
        List<Approval> approvals = approvalService.getApprovalsByOrder(contractId, approvalOrder);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào với thứ tự này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval theo thứ tự thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/required")
    @Operation(summary = "Lấy approval bắt buộc", description = "Lấy danh sách approval bắt buộc")
    public ResponseEntity<RestResponse<List<Approval>>> getRequiredApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getRequiredApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval bắt buộc nào");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval bắt buộc thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/optional")
    @Operation(summary = "Lấy approval tùy chọn", description = "Lấy danh sách approval tùy chọn")
    public ResponseEntity<RestResponse<List<Approval>>> getOptionalApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getOptionalApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval tùy chọn nào");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval tùy chọn thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/due-date")
    @Operation(summary = "Lấy approval theo due date", description = "Lấy danh sách approval trong khoảng due date")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByDueDateRange(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Approval> approvals = approvalService.getApprovalsByDueDateRange(contractId, startDate, endDate);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào trong khoảng thời gian này");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval theo due date thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/upcoming-due")
    @Operation(summary = "Lấy approval sắp đến hạn", description = "Lấy danh sách approval sắp đến hạn")
    public ResponseEntity<RestResponse<List<Approval>>> getUpcomingDueApprovals(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        List<Approval> approvals = approvalService.getUpcomingDueApprovals(contractId, dueDate);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào sắp đến hạn");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval sắp đến hạn thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/notified")
    @Operation(summary = "Lấy approval đã được notify", description = "Lấy danh sách approval đã được thông báo")
    public ResponseEntity<RestResponse<List<Approval>>> getNotifiedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getNotifiedApprovals(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào đã được thông báo");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval đã được notify thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/unnotified")
    @Operation(summary = "Lấy approval chưa được notify", description = "Lấy danh sách approval chưa được thông báo")
    public ResponseEntity<RestResponse<List<Approval>>> getUnnotifiedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getUnnotifiedApprovals(contractId);
        
        if (approvals.isEmpty()) {
            return ResponseBuilder.noContent("Không có approval nào chưa được thông báo");
        }
        
        return ResponseBuilder.success(approvals, "Lấy danh sách approval chưa được notify thành công");
    }

    @PutMapping("/approvals/{id}/approve")
    @Operation(summary = "Phê duyệt approval", description = "Phê duyệt approval với comments")
    public ResponseEntity<RestResponse<Approval>> approveApproval(
            @PathVariable String id,
            @RequestParam String comments) {
        Approval approval = approvalService.approveApproval(id, comments);
        
        return ResponseBuilder.success(approval, "Phê duyệt approval thành công");
    }

    @PutMapping("/approvals/{id}/reject")
    @Operation(summary = "Từ chối approval", description = "Từ chối approval với lý do")
    public ResponseEntity<RestResponse<Approval>> rejectApproval(
            @PathVariable String id,
            @RequestParam String rejectionReason) {
        Approval approval = approvalService.rejectApproval(id, rejectionReason);
        
        return ResponseBuilder.success(approval, "Từ chối approval thành công");
    }

    @PutMapping("/approvals/{id}/cancel")
    @Operation(summary = "Hủy approval", description = "Hủy approval")
    public ResponseEntity<RestResponse<Approval>> cancelApproval(@PathVariable String id) {
        Approval approval = approvalService.cancelApproval(id);
        
        return ResponseBuilder.success(approval, "Hủy approval thành công");
    }

    @PutMapping("/approvals/{id}/expire")
    @Operation(summary = "Đánh dấu approval hết hạn", description = "Đánh dấu approval đã hết hạn")
    public ResponseEntity<RestResponse<Approval>> markApprovalAsExpired(@PathVariable String id) {
        Approval approval = approvalService.markApprovalAsExpired(id);
        
        return ResponseBuilder.success(approval, "Đánh dấu approval hết hạn thành công");
    }

    @PutMapping("/approvals/{id}/increment-reminder")
    @Operation(summary = "Tăng reminder count", description = "Tăng số lần nhắc nhở")
    public ResponseEntity<RestResponse<Approval>> incrementReminderCount(@PathVariable String id) {
        Approval approval = approvalService.incrementReminderCount(id);
        
        return ResponseBuilder.success(approval, "Tăng reminder count thành công");
    }

    @PutMapping("/approvals/{id}/notify")
    @Operation(summary = "Đánh dấu đã notify", description = "Đánh dấu approval đã được thông báo")
    public ResponseEntity<RestResponse<Approval>> setNotificationTime(@PathVariable String id) {
        Approval approval = approvalService.setNotificationTime(id);
        
        return ResponseBuilder.success(approval, "Đánh dấu đã notify thành công");
    }

    @PutMapping("/approvals/{id}/due-date")
    @Operation(summary = "Cập nhật due date", description = "Cập nhật ngày hết hạn")
    public ResponseEntity<RestResponse<Approval>> setDueDate(
            @PathVariable String id,
            @RequestParam LocalDateTime dueDate) {
        Approval approval = approvalService.setDueDate(id, dueDate);
        
        return ResponseBuilder.success(approval, "Cập nhật due date thành công");
    }

    @PutMapping("/approvals/{id}/priority")
    @Operation(summary = "Cập nhật priority", description = "Cập nhật mức độ ưu tiên")
    public ResponseEntity<RestResponse<Approval>> setPriority(
            @PathVariable String id,
            @RequestParam Approval.ApprovalPriority priority) {
        Approval approval = approvalService.setPriority(id, priority);
        
        return ResponseBuilder.success(approval, "Cập nhật priority thành công");
    }

    @PutMapping("/approvals/{id}/order")
    @Operation(summary = "Cập nhật approval order", description = "Cập nhật thứ tự phê duyệt")
    public ResponseEntity<RestResponse<Approval>> setApprovalOrder(
            @PathVariable String id,
            @RequestParam Integer approvalOrder) {
        Approval approval = approvalService.setApprovalOrder(id, approvalOrder);
        
        return ResponseBuilder.success(approval, "Cập nhật approval order thành công");
    }

    @PutMapping("/approvals/{id}/required")
    @Operation(summary = "Cập nhật isRequired", description = "Cập nhật trạng thái bắt buộc")
    public ResponseEntity<RestResponse<Approval>> setIsRequired(
            @PathVariable String id,
            @RequestParam Boolean isRequired) {
        Approval approval = approvalService.setIsRequired(id, isRequired);
        
        return ResponseBuilder.success(approval, "Cập nhật isRequired thành công");
    }

    @DeleteMapping("/approvals/{id}")
    @Operation(summary = "Xóa approval", description = "Soft delete approval")
    public ResponseEntity<RestResponse<Void>> deleteApproval(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        approvalService.deleteApproval(id, deletedBy);
        
        return ResponseBuilder.success(null, "Xóa approval thành công");
    }

    @PutMapping("/approvals/{id}/restore")
    @Operation(summary = "Khôi phục approval", description = "Khôi phục approval đã xóa")
    public ResponseEntity<RestResponse<Approval>> restoreApproval(@PathVariable String id) {
        Approval approval = approvalService.restoreApproval(id);
        
        return ResponseBuilder.success(approval, "Khôi phục approval thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/count")
    @Operation(summary = "Đếm số approval", description = "Đếm số lượng approval theo status")
    public ResponseEntity<RestResponse<Long>> countApprovalsByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam Approval.ApprovalStatus status) {
        long count = approvalService.countApprovalsByContractIdAndStatus(contractId, status);
        
        return ResponseBuilder.success(count, "Đếm số approval thành công");
    }

    @GetMapping("/approvals/approver/{approverId}/count")
    @Operation(summary = "Đếm số approval của approver", description = "Đếm số lượng approval của approver theo status")
    public ResponseEntity<RestResponse<Long>> countApprovalsByApproverIdAndStatus(
            @PathVariable String approverId,
            @RequestParam Approval.ApprovalStatus status) {
        long count = approvalService.countApprovalsByApproverIdAndStatus(approverId, status);
        
        return ResponseBuilder.success(count, "Đếm số approval của approver thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/has-pending")
    @Operation(summary = "Kiểm tra có approval pending", description = "Kiểm tra contract có approval đang pending không")
    public ResponseEntity<RestResponse<Boolean>> hasPendingApprovals(@PathVariable String contractId) {
        boolean hasPending = approvalService.hasPendingApprovals(contractId);
        
        return ResponseBuilder.success(hasPending, "Kiểm tra approval pending thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/has-approved")
    @Operation(summary = "Kiểm tra có approval approved", description = "Kiểm tra contract có approval đã approved không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovedApprovals(@PathVariable String contractId) {
        boolean hasApproved = approvalService.hasApprovedApprovals(contractId);
        
        return ResponseBuilder.success(hasApproved, "Kiểm tra approval approved thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/has-rejected")
    @Operation(summary = "Kiểm tra có approval rejected", description = "Kiểm tra contract có approval đã rejected không")
    public ResponseEntity<RestResponse<Boolean>> hasRejectedApprovals(@PathVariable String contractId) {
        boolean hasRejected = approvalService.hasRejectedApprovals(contractId);
        
        return ResponseBuilder.success(hasRejected, "Kiểm tra approval rejected thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/has-expired")
    @Operation(summary = "Kiểm tra có approval expired", description = "Kiểm tra contract có approval đã hết hạn không")
    public ResponseEntity<RestResponse<Boolean>> hasExpiredApprovals(@PathVariable String contractId) {
        boolean hasExpired = approvalService.hasExpiredApprovals(contractId);
        
        return ResponseBuilder.success(hasExpired, "Kiểm tra approval expired thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/has-expiring")
    @Operation(summary = "Kiểm tra có approval expiring", description = "Kiểm tra contract có approval sắp hết hạn không")
    public ResponseEntity<RestResponse<Boolean>> hasExpiringApprovals(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        boolean hasExpiring = approvalService.hasExpiringApprovals(contractId, dueDate);
        
        return ResponseBuilder.success(hasExpiring, "Kiểm tra approval expiring thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/needs-reminder")
    @Operation(summary = "Kiểm tra cần reminder", description = "Kiểm tra contract có approval cần nhắc nhở không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsNeedingReminder(
            @PathVariable String contractId,
            @RequestParam Integer reminderCount) {
        boolean needsReminder = approvalService.hasApprovalsNeedingReminder(contractId, reminderCount);
        
        return ResponseBuilder.success(needsReminder, "Kiểm tra cần reminder thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/by-role/{approverRole}")
    @Operation(summary = "Kiểm tra có approval theo role", description = "Kiểm tra contract có approval theo role không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsByRole(
            @PathVariable String contractId,
            @PathVariable String approverRole) {
        boolean hasByRole = approvalService.hasApprovalsByRole(contractId, approverRole);
        
        return ResponseBuilder.success(hasByRole, "Kiểm tra approval theo role thành công");
    }

    @GetMapping("/contracts/{contractId}/approvals/by-role-status")
    @Operation(summary = "Kiểm tra có approval theo role và status", description = "Kiểm tra contract có approval theo role và status không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsByRoleAndStatus(
            @PathVariable String contractId,
            @RequestParam String approverRole,
            @RequestParam Approval.ApprovalStatus status) {
        boolean hasByRoleAndStatus = approvalService.hasApprovalsByRoleAndStatus(contractId, approverRole, status);
        
        return ResponseBuilder.success(hasByRoleAndStatus, "Kiểm tra approval theo role và status thành công");
    }
}
