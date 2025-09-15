package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Approval;
import com.devgo2003.docgo.contract_service.service.ApprovalService;
import com.devgo2003.docgo.contract_service.dto.ApprovalCreateRequest;
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
@RequestMapping("/api/v1/contract-management-service/approvals")
@Tag(name = "API Quản lý Phê duyệt", description = "Các API để quản lý quy trình phê duyệt hợp đồng trong hệ thống DocGO")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final HttpServletRequest request;

    public ApprovalController(ApprovalService approvalService, HttpServletRequest request) {
        this.approvalService = approvalService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Lấy danh sách tất cả phê duyệt", 
        description = """
        🔹 Đầu vào
        
        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số[object Object]n        Loại: integer
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
        
        📦 data
        Loại: PaginatedResponse<Approval>
        Mô tả: Danh sách phê duyệt có phân trang
        
        🧾 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔧 statusCode
        Loại: integer
        Mô tả: ma[object Object] shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📝 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🆔 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<List<Approval>>> getAllApprovals(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        List<Approval> approvals = approvalService.getAllApprovals();
        
        if (approvals.isEmpty()) {
            RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có phê duyệt nào.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách phê duyệt thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Lấy chi tiết phê duyệt", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của phê duyệt cần lấy
        
        🔹 Đầu ra
        
        📦 data
        Loại: Approval
        Mô tả: Thông tin chi tiết phê duyệt
        
        🧾 apiVersion
        Loại: string
        [object Object]n        Mô tả: ma trạng thái HTTP (200: OK, 404: Not Found)
        
        📨 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📝 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🆔 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Approval>> getApproval(@PathVariable String id) {
        Optional<Approval> approval = approvalService.getApprovalById(id);
        
        if (approval.isEmpty()) {
            RestResponse<Approval> response = RestResponse.<Approval>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy phê duyệt với ID: " + id)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy chi tiết phê duyệt thành công.")
            .data(approval.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Tạo phê duyệt mới", 
        description = """
        🔹 Đầu vào
        
        📄 approval (bắt buộc, body)
        Loại: ApprovalCreateRequest
        Mô tả: Thông tin phê duyệt cần tạo (contractId, approverId, approverName, approverEmail, approverRole, priority, dueDate, approvalOrder, isRequired)
        
        🔹 Đầu ra
        
        📦 data
        Loại: Approval
        Mô tả: Thông tin phê duyệt đã được tạo thành công
        
        🧾 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔧 statusCode
        Loại: integer
        Mô tả: ma trạng thái HTTP (2[object Object]ô tả: Thông báo ngắn gọn về kết quả
        
        📝 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        ⏰ timestamp
        Loại: string
        Mô tả: Thời điểm xử lý request (ISO-8601)
        
        🆔 requestId
        Loại: string
        Mô tả: ID duy nhất của request
        
        📍 path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Approval>> createApproval(@RequestBody ApprovalCreateRequest request) {
        Approval approval = approvalService.createApproval(request);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Tạo phê duyệt thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

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
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Tạo approval thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals")
    @Operation(summary = "Lấy danh sách approval theo contract ID", description = "Lấy tất cả approval của contract")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByContractId(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có approval nào cho contract này.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/{id}")
    @Operation(summary = "Lấy approval theo ID", description = "Lấy chi tiết approval")
    public ResponseEntity<RestResponse<Approval>> getApprovalById(@PathVariable String id) {
        Optional<Approval> approval = approvalService.getApprovalById(id);
        
        if (approval.isEmpty()) {
            RestResponse<Approval> response = RestResponse.<Approval>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy approval.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
                RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy approval thành công.")
            .data(approval.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/pending")
    @Operation(summary = "Lấy approval đang pending", description = "Lấy danh sách approval đang chờ phê duyệt")
    public ResponseEntity<RestResponse<List<Approval>>> getPendingApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getPendingApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào đang pending.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval pending thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/approved")
    @Operation(summary = "Lấy approval đã approved", description = "Lấy danh sách approval đã được phê duyệt")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getApprovedApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào đã được phê duyệt.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval approved thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/rejected")
    @Operation(summary = "Lấy approval đã rejected", description = "Lấy danh sách approval đã bị từ chối")
    public ResponseEntity<RestResponse<List<Approval>>> getRejectedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getRejectedApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào bị từ chối.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval rejected thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/{approverId}")
    @Operation(summary = "Lấy approval theo approver ID", description = "Lấy danh sách approval của approver")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverId(@PathVariable String approverId) {
        List<Approval> approvals = approvalService.getApprovalsByApproverId(approverId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào của approver này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval của approver thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/email/{approverEmail}")
    @Operation(summary = "Lấy approval theo approver email", description = "Lấy danh sách approval của approver email")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverEmail(@PathVariable String approverEmail) {
        List<Approval> approvals = approvalService.getApprovalsByApproverEmail(approverEmail);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào của approver email này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval của approver email thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/role/{approverRole}")
    @Operation(summary = "Lấy approval theo approver role", description = "Lấy danh sách approval của approver role")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverRole(@PathVariable String approverRole) {
        List<Approval> approvals = approvalService.getApprovalsByApproverRole(approverRole);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào của approver role này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval của approver role thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/expiring")
    @Operation(summary = "Lấy approval sắp hết hạn", description = "Lấy danh sách approval sắp hết hạn")
    public ResponseEntity<RestResponse<List<Approval>>> getExpiringApprovals(@RequestParam LocalDateTime dueDate) {
        List<Approval> approvals = approvalService.getExpiringApprovals(dueDate);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào sắp hết hạn.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval sắp hết hạn thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/expired")
    @Operation(summary = "Lấy approval đã hết hạn", description = "Lấy danh sách approval đã hết hạn")
    public ResponseEntity<RestResponse<List<Approval>>> getExpiredApprovals(@RequestParam LocalDateTime currentTime) {
        List<Approval> approvals = approvalService.getExpiredApprovals(currentTime);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào đã hết hạn.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval đã hết hạn thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/priority/{priority}")
    @Operation(summary = "Lấy approval theo priority", description = "Lấy danh sách approval theo mức độ ưu tiên")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByPriority(@PathVariable Approval.ApprovalPriority priority) {
        List<Approval> approvals = approvalService.getApprovalsByPriority(priority);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào với priority này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval theo priority thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/order/{approvalOrder}")
    @Operation(summary = "Lấy approval theo thứ tự", description = "Lấy danh sách approval theo thứ tự phê duyệt")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByOrder(@PathVariable String contractId, @PathVariable Integer approvalOrder) {
        List<Approval> approvals = approvalService.getApprovalsByOrder(contractId, approvalOrder);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào với thứ tự này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval theo thứ tự thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/required")
    @Operation(summary = "Lấy approval bắt buộc", description = "Lấy danh sách approval bắt buộc")
    public ResponseEntity<RestResponse<List<Approval>>> getRequiredApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getRequiredApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval bắt buộc nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval bắt buộc thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/optional")
    @Operation(summary = "Lấy approval tùy chọn", description = "Lấy danh sách approval tùy chọn")
    public ResponseEntity<RestResponse<List<Approval>>> getOptionalApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getOptionalApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval tùy chọn nào.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval tùy chọn thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/due-date")
    @Operation(summary = "Lấy approval theo due date", description = "Lấy danh sách approval trong khoảng due date")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByDueDaterange(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Approval> approvals = approvalService.getApprovalsByDueDaterange(contractId, startDate, endDate);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào trong khoảng thời gian này.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval theo due date thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/upcoming-due")
    @Operation(summary = "Lấy approval sắp đến hạn", description = "Lấy danh sách approval sắp đến hạn")
    public ResponseEntity<RestResponse<List<Approval>>> getUpcomingDueApprovals(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        List<Approval> approvals = approvalService.getUpcomingDueApprovals(contractId, dueDate);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào sắp đến hạn.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval sắp đến hạn thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/notified")
    @Operation(summary = "Lấy approval đã được notify", description = "Lấy danh sách approval đã được thông báo")
    public ResponseEntity<RestResponse<List<Approval>>> getNotifiedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getNotifiedApprovals(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào đã được thông báo.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval đã được notify thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/unnotified")
    @Operation(summary = "Lấy approval chưa được notify", description = "Lấy danh sách approval chưa được thông báo")
    public ResponseEntity<RestResponse<List<Approval>>> getUnnotifiedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getUnnotifiedApprovals(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có approval nào chưa được thông báo.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách approval chưa được notify thành công.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/approve")
    @Operation(summary = "Phê duyệt approval", description = "Phê duyệt approval với comments")
    public ResponseEntity<RestResponse<Approval>> approveApproval(
            @PathVariable String id,
            @RequestParam String comments) {
        Approval approval = approvalService.approveApproval(id, comments);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Phê duyệt approval thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/reject")
    @Operation(summary = "Từ chối approval", description = "Từ chối approval với lý do")
    public ResponseEntity<RestResponse<Approval>> rejectApproval(
            @PathVariable String id,
            @RequestParam String rejectionReason) {
        Approval approval = approvalService.rejectApproval(id, rejectionReason);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Từ chối approval thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/cancel")
    @Operation(summary = "Hủy approval", description = "Hủy approval")
    public ResponseEntity<RestResponse<Approval>> cancelApproval(@PathVariable String id) {
        Approval approval = approvalService.cancelApproval(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Hủy approval thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/expire")
    @Operation(summary = "Đánh dấu approval hết hạn", description = "Đánh dấu approval đã hết hạn")
    public ResponseEntity<RestResponse<Approval>> markApprovalAsExpired(@PathVariable String id) {
        Approval approval = approvalService.markApprovalAsExpired(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đánh dấu approval hết hạn thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/increment-reminder")
    @Operation(summary = "Tăng reminder count", description = "Tăng số lần nhắc nhở")
    public ResponseEntity<RestResponse<Approval>> incrementReminderCount(@PathVariable String id) {
        Approval approval = approvalService.incrementReminderCount(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tăng reminder count thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/notify")
    @Operation(summary = "Đánh dấu đã notify", description = "Đánh dấu approval đã được thông báo")
    public ResponseEntity<RestResponse<Approval>> setNotificationTime(@PathVariable String id) {
        Approval approval = approvalService.setNotificationTime(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đánh dấu đã notify thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/due-date")
    @Operation(summary = "Cập nhật due date", description = "Cập nhật ngày hết hạn")
    public ResponseEntity<RestResponse<Approval>> setDueDate(
            @PathVariable String id,
            @RequestParam LocalDateTime dueDate) {
        Approval approval = approvalService.setDueDate(id, dueDate);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật due date thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/priority")
    @Operation(summary = "Cập nhật priority", description = "Cập nhật mức độ ưu tiên")
    public ResponseEntity<RestResponse<Approval>> setPriority(
            @PathVariable String id,
            @RequestParam Approval.ApprovalPriority priority) {
        Approval approval = approvalService.setPriority(id, priority);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật priority thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/order")
    @Operation(summary = "Cập nhật approval order", description = "Cập nhật thứ tự phê duyệt")
    public ResponseEntity<RestResponse<Approval>> setApprovalOrder(
            @PathVariable String id,
            @RequestParam Integer approvalOrder) {
        Approval approval = approvalService.setApprovalOrder(id, approvalOrder);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật approval order thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/required")
    @Operation(summary = "Cập nhật isRequired", description = "Cập nhật trạng thái bắt buộc")
    public ResponseEntity<RestResponse<Approval>> setIsRequired(
            @PathVariable String id,
            @RequestParam Boolean isRequired) {
        Approval approval = approvalService.setIsRequired(id, isRequired);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật isRequired thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/approvals/{id}")
    @Operation(summary = "Xóa approval", description = "Soft delete approval")
    public ResponseEntity<RestResponse<Void>> deleteApproval(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        approvalService.deleteApproval(id, deletedBy);
        
        RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Xóa approval thành công.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/restore")
    @Operation(summary = "Khôi phục approval", description = "Khôi phục approval đã xóa")
    public ResponseEntity<RestResponse<Approval>> restoreApproval(@PathVariable String id) {
        Approval approval = approvalService.restoreApproval(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Khôi phục approval thành công.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/count")
    @Operation(summary = "Đếm số approval", description = "Đếm số lượng approval theo status")
    public ResponseEntity<RestResponse<Long>> countApprovalsByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam Approval.ApprovalStatus status) {
        long count = approvalService.countApprovalsByContractIdAndStatus(contractId, status);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số approval thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/{approverId}/count")
    @Operation(summary = "Đếm số approval của approver", description = "Đếm số lượng approval của approver theo status")
    public ResponseEntity<RestResponse<Long>> countApprovalsByApproverIdAndStatus(
            @PathVariable String approverId,
            @RequestParam Approval.ApprovalStatus status) {
        long count = approvalService.countApprovalsByApproverIdAndStatus(approverId, status);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số approval của approver thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-pending")
    @Operation(summary = "Kiểm tra có approval pending", description = "Kiểm tra contract có approval đang pending không")
    public ResponseEntity<RestResponse<Boolean>> hasPendingApprovals(@PathVariable String contractId) {
        boolean hasPending = approvalService.hasPendingApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval pending thành công.")
            .data(hasPending)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-approved")
    @Operation(summary = "Kiểm tra có approval approved", description = "Kiểm tra contract có approval đã approved không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovedApprovals(@PathVariable String contractId) {
        boolean hasApproved = approvalService.hasApprovedApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval approved thành công.")
            .data(hasApproved)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-rejected")
    @Operation(summary = "Kiểm tra có approval rejected", description = "Kiểm tra contract có approval đã rejected không")
    public ResponseEntity<RestResponse<Boolean>> hasRejectedApprovals(@PathVariable String contractId) {
        boolean hasRejected = approvalService.hasRejectedApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval rejected thành công.")
            .data(hasRejected)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-expired")
    @Operation(summary = "Kiểm tra có approval expired", description = "Kiểm tra contract có approval đã hết hạn không")
    public ResponseEntity<RestResponse<Boolean>> hasExpiredApprovals(@PathVariable String contractId) {
        boolean hasExpired = approvalService.hasExpiredApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval expired thành công.")
            .data(hasExpired)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-expiring")
    @Operation(summary = "Kiểm tra có approval expiring", description = "Kiểm tra contract có approval sắp hết hạn không")
    public ResponseEntity<RestResponse<Boolean>> hasExpiringApprovals(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        boolean hasExpiring = approvalService.hasExpiringApprovals(contractId, dueDate);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval expiring thành công.")
            .data(hasExpiring)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/needs-reminder")
    @Operation(summary = "Kiểm tra cần reminder", description = "Kiểm tra contract có approval cần nhắc nhở không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsNeedingReminder(
            @PathVariable String contractId,
            @RequestParam Integer reminderCount) {
        boolean needsReminder = approvalService.hasApprovalsNeedingReminder(contractId, reminderCount);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra cần reminder thành công.")
            .data(needsReminder)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/by-role/{approverRole}")
    @Operation(summary = "Kiểm tra có approval theo role", description = "Kiểm tra contract có approval theo role không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsByRole(
            @PathVariable String contractId,
            @PathVariable String approverRole) {
        boolean hasByRole = approvalService.hasApprovalsByRole(contractId, approverRole);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval theo role thành công.")
            .data(hasByRole)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/by-role-status")
    @Operation(summary = "Kiểm tra có approval theo role và status", description = "Kiểm tra contract có approval theo role và status không")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsByRoleAndStatus(
            @PathVariable String contractId,
            @RequestParam String approverRole,
            @RequestParam Approval.ApprovalStatus status) {
        boolean hasByRoleAndStatus = approvalService.hasApprovalsByRoleAndStatus(contractId, approverRole, status);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra approval theo role và status thành công.")
            .data(hasByRoleAndStatus)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}


