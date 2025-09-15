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
@Tag(name = "API Quáº£n lÃ½ PhÃª duyá»‡t", description = "CÃ¡c API Ä‘á»ƒ quáº£n lÃ½ quy trÃ¬nh phÃª duyá»‡t há»£p Ä‘á»“ng trong há»‡ thá»‘ng DocGO")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final HttpServletRequest request;

    public ApprovalController(ApprovalService approvalService, HttpServletRequest request) {
        this.approvalService = approvalService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Láº¥y danh sÃ¡ch táº¥t cáº£ phÃª duyá»‡t", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ pageNumber (tÃ¹y chá»n, query)
        Loáº¡i: integer
        MÃ´ táº£: Sá»‘ trang (máº·c Ä‘á»‹nh: 0)
        
        ðŸ“„ pageSize (tÃ¹y chá»n, query)
        Loáº¡i: integer
        MÃ´ táº£: KÃ­ch thÆ°á»›c trang (máº·c Ä‘á»‹nh: 10)
        
        ðŸ“„ sortBy (tÃ¹y chá»n, query)
        Loáº¡i: string
        MÃ´ táº£: TrÆ°á»ng sáº¯p xáº¿p (máº·c Ä‘á»‹nh: createdAt)
        
        ðŸ“„ sortDirection (tÃ¹y chá»n, query)
        Loáº¡i: string
        MÃ´ táº£: HÆ°á»›ng sáº¯p xáº¿p: ASC hoáº·c DESC (máº·c Ä‘á»‹nh: DESC)
        
        ðŸ“„ searchTerm (tÃ¹y chá»n, query)
        Loáº¡i: string
        MÃ´ táº£: Tá»« khÃ³a tÃ¬m kiáº¿m
        
        ðŸ“„ includeDeleted (tÃ¹y chá»n, query)
        Loáº¡i: boolean
        MÃ´ táº£: Bao gá»“m báº£n ghi Ä‘Ã£ xÃ³a (máº·c Ä‘á»‹nh: false)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: PaginatedResponse<Approval>
        MÃ´ táº£: Danh sÃ¡ch phÃª duyá»‡t cÃ³ phÃ¢n trang
        
        ðŸ“Š apiVersion
        Loáº¡i: string
        MÃ´ táº£: PhiÃªn báº£n API (v1)
        
        ðŸ”¢ statusCode
        Loáº¡i: integer
        MÃ´ táº£: MÃ£ tráº¡ng thÃ¡i HTTP (200: OK, 204: No Content)
        
        ðŸ“‹ shortMessage
        Loáº¡i: string
        MÃ´ táº£: ThÃ´ng bÃ¡o ngáº¯n gá»n vá» káº¿t quáº£
        
        ðŸ“– description
        Loáº¡i: string
        MÃ´ táº£: MÃ´ táº£ chi tiáº¿t vá» káº¿t quáº£ xá»­ lÃ½
        
        â° timestamp
        Loáº¡i: string
        MÃ´ táº£: Thá»i Ä‘iá»ƒm xá»­ lÃ½ request (ISO-8601)
        
        ðŸ”— requestId
        Loáº¡i: string
        MÃ´ táº£: ID duy nháº¥t cá»§a request
        
        ðŸ“ path
        Loáº¡i: string
        MÃ´ táº£: ÄÆ°á»ng dáº«n API Ä‘Æ°á»£c gá»i
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
                .description("KhÃ´ng cÃ³ phÃª duyá»‡t nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch phÃª duyá»‡t thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Láº¥y chi tiáº¿t phÃª duyá»‡t", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ”— id (báº¯t buá»™c, path)
        Loáº¡i: string
        MÃ´ táº£: ID cá»§a phÃª duyá»‡t cáº§n láº¥y
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: Approval
        MÃ´ táº£: ThÃ´ng tin chi tiáº¿t phÃª duyá»‡t
        
        ðŸ“Š apiVersion
        Loáº¡i: string
        MÃ´ táº£: PhiÃªn báº£n API (v1)
        
        ðŸ”¢ statusCode
        Loáº¡i: integer
        MÃ´ táº£: MÃ£ tráº¡ng thÃ¡i HTTP (200: OK, 404: Not Found)
        
        ðŸ“‹ shortMessage
        Loáº¡i: string
        MÃ´ táº£: ThÃ´ng bÃ¡o ngáº¯n gá»n vá» káº¿t quáº£
        
        ðŸ“– description
        Loáº¡i: string
        MÃ´ táº£: MÃ´ táº£ chi tiáº¿t vá» káº¿t quáº£ xá»­ lÃ½
        
        â° timestamp
        Loáº¡i: string
        MÃ´ táº£: Thá»i Ä‘iá»ƒm xá»­ lÃ½ request (ISO-8601)
        
        ðŸ”— requestId
        Loáº¡i: string
        MÃ´ táº£: ID duy nháº¥t cá»§a request
        
        ðŸ“ path
        Loáº¡i: string
        MÃ´ táº£: ÄÆ°á»ng dáº«n API Ä‘Æ°á»£c gá»i
        """
    )
    public ResponseEntity<RestResponse<Approval>> getApproval(@PathVariable String id) {
        Optional<Approval> approval = approvalService.getApprovalById(id);
        
        if (approval.isEmpty()) {
            RestResponse<Approval> response = RestResponse.<Approval>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y phÃª duyá»‡t vá»›i ID: " + id)
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
            .description("Láº¥y chi tiáº¿t phÃª duyá»‡t thÃ nh cÃ´ng.")
            .data(approval.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Táº¡o phÃª duyá»‡t má»›i", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ approval (báº¯t buá»™c, body)
        Loáº¡i: ApprovalCreateRequest
        MÃ´ táº£: ThÃ´ng tin phÃª duyá»‡t cáº§n táº¡o (contractId, approverId, approverName, approverEmail, approverRole, priority, dueDate, approvalOrder, isRequired)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: Approval
        MÃ´ táº£: ThÃ´ng tin phÃª duyá»‡t Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng
        
        ðŸ“Š apiVersion
        Loáº¡i: string
        MÃ´ táº£: PhiÃªn báº£n API (v1)
        
        ðŸ”¢ statusCode
        Loáº¡i: integer
        MÃ´ táº£: MÃ£ tráº¡ng thÃ¡i HTTP (201: Created)
        
        ðŸ“‹ shortMessage
        Loáº¡i: string
        MÃ´ táº£: ThÃ´ng bÃ¡o ngáº¯n gá»n vá» káº¿t quáº£
        
        ðŸ“– description
        Loáº¡i: string
        MÃ´ táº£: MÃ´ táº£ chi tiáº¿t vá» káº¿t quáº£ xá»­ lÃ½
        
        â° timestamp
        Loáº¡i: string
        MÃ´ táº£: Thá»i Ä‘iá»ƒm xá»­ lÃ½ request (ISO-8601)
        
        ðŸ”— requestId
        Loáº¡i: string
        MÃ´ táº£: ID duy nháº¥t cá»§a request
        
        ðŸ“ path
        Loáº¡i: string
        MÃ´ táº£: ÄÆ°á»ng dáº«n API Ä‘Æ°á»£c gá»i
        """
    )
    public ResponseEntity<RestResponse<Approval>> createApproval(@RequestBody ApprovalCreateRequest request) {
        Approval approval = approvalService.createApproval(request);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o phÃª duyá»‡t thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/approve")
    @Operation(summary = "PhÃª duyá»‡t há»£p Ä‘á»“ng", description = "Táº¡o approval má»›i cho contract")
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
            .description("Táº¡o approval thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals")
    @Operation(summary = "Láº¥y danh sÃ¡ch approval theo contract ID", description = "Láº¥y táº¥t cáº£ approval cá»§a contract")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByContractId(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
            RestResponse<List<Approval>> response = RestResponse.<List<Approval>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ approval nÃ o cho contract nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/{id}")
    @Operation(summary = "Láº¥y approval theo ID", description = "Láº¥y chi tiáº¿t approval")
    public ResponseEntity<RestResponse<Approval>> getApprovalById(@PathVariable String id) {
        Optional<Approval> approval = approvalService.getApprovalById(id);
        
        if (approval.isEmpty()) {
            RestResponse<Approval> response = RestResponse.<Approval>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y approval.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y approval thÃ nh cÃ´ng.")
            .data(approval.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/pending")
    @Operation(summary = "Láº¥y approval Ä‘ang pending", description = "Láº¥y danh sÃ¡ch approval Ä‘ang chá» phÃª duyá»‡t")
    public ResponseEntity<RestResponse<List<Approval>>> getPendingApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getPendingApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o Ä‘ang pending.")
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
            .description("Láº¥y danh sÃ¡ch approval pending thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/approved")
    @Operation(summary = "Láº¥y approval Ä‘Ã£ approved", description = "Láº¥y danh sÃ¡ch approval Ä‘Ã£ Ä‘Æ°á»£c phÃª duyá»‡t")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getApprovedApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o Ä‘Ã£ Ä‘Æ°á»£c phÃª duyá»‡t.")
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
            .description("Láº¥y danh sÃ¡ch approval approved thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/rejected")
    @Operation(summary = "Láº¥y approval Ä‘Ã£ rejected", description = "Láº¥y danh sÃ¡ch approval Ä‘Ã£ bá»‹ tá»« chá»‘i")
    public ResponseEntity<RestResponse<List<Approval>>> getRejectedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getRejectedApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o bá»‹ tá»« chá»‘i.")
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
            .description("Láº¥y danh sÃ¡ch approval rejected thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/{approverId}")
    @Operation(summary = "Láº¥y approval theo approver ID", description = "Láº¥y danh sÃ¡ch approval cá»§a approver")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverId(@PathVariable String approverId) {
        List<Approval> approvals = approvalService.getApprovalsByApproverId(approverId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o cá»§a approver nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval cá»§a approver thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/email/{approverEmail}")
    @Operation(summary = "Láº¥y approval theo approver email", description = "Láº¥y danh sÃ¡ch approval cá»§a approver email")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverEmail(@PathVariable String approverEmail) {
        List<Approval> approvals = approvalService.getApprovalsByApproverEmail(approverEmail);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o cá»§a approver email nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval cá»§a approver email thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/role/{approverRole}")
    @Operation(summary = "Láº¥y approval theo approver role", description = "Láº¥y danh sÃ¡ch approval cá»§a approver role")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByApproverRole(@PathVariable String approverRole) {
        List<Approval> approvals = approvalService.getApprovalsByApproverRole(approverRole);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o cá»§a approver role nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval cá»§a approver role thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/expiring")
    @Operation(summary = "Láº¥y approval sáº¯p háº¿t háº¡n", description = "Láº¥y danh sÃ¡ch approval sáº¯p háº¿t háº¡n")
    public ResponseEntity<RestResponse<List<Approval>>> getExpiringApprovals(@RequestParam LocalDateTime dueDate) {
        List<Approval> approvals = approvalService.getExpiringApprovals(dueDate);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o sáº¯p háº¿t háº¡n.")
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
            .description("Láº¥y danh sÃ¡ch approval sáº¯p háº¿t háº¡n thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/expired")
    @Operation(summary = "Láº¥y approval Ä‘Ã£ háº¿t háº¡n", description = "Láº¥y danh sÃ¡ch approval Ä‘Ã£ háº¿t háº¡n")
    public ResponseEntity<RestResponse<List<Approval>>> getExpiredApprovals(@RequestParam LocalDateTime currentTime) {
        List<Approval> approvals = approvalService.getExpiredApprovals(currentTime);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o Ä‘Ã£ háº¿t háº¡n.")
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
            .description("Láº¥y danh sÃ¡ch approval Ä‘Ã£ háº¿t háº¡n thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/priority/{priority}")
    @Operation(summary = "Láº¥y approval theo priority", description = "Láº¥y danh sÃ¡ch approval theo má»©c Ä‘á»™ Æ°u tiÃªn")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByPriority(@PathVariable Approval.ApprovalPriority priority) {
        List<Approval> approvals = approvalService.getApprovalsByPriority(priority);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o vá»›i priority nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval theo priority thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/order/{approvalOrder}")
    @Operation(summary = "Láº¥y approval theo thá»© tá»±", description = "Láº¥y danh sÃ¡ch approval theo thá»© tá»± phÃª duyá»‡t")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByOrder(@PathVariable String contractId, @PathVariable Integer approvalOrder) {
        List<Approval> approvals = approvalService.getApprovalsByOrder(contractId, approvalOrder);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o vá»›i thá»© tá»± nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval theo thá»© tá»± thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/required")
    @Operation(summary = "Láº¥y approval báº¯t buá»™c", description = "Láº¥y danh sÃ¡ch approval báº¯t buá»™c")
    public ResponseEntity<RestResponse<List<Approval>>> getRequiredApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getRequiredApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval báº¯t buá»™c nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch approval báº¯t buá»™c thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/optional")
    @Operation(summary = "Láº¥y approval tÃ¹y chá»n", description = "Láº¥y danh sÃ¡ch approval tÃ¹y chá»n")
    public ResponseEntity<RestResponse<List<Approval>>> getOptionalApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getOptionalApprovalsByContractId(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval tÃ¹y chá»n nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch approval tÃ¹y chá»n thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/due-date")
    @Operation(summary = "Láº¥y approval theo due date", description = "Láº¥y danh sÃ¡ch approval trong khoáº£ng due date")
    public ResponseEntity<RestResponse<List<Approval>>> getApprovalsByDueDateRange(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Approval> approvals = approvalService.getApprovalsByDueDateRange(contractId, startDate, endDate);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o trong khoáº£ng thá»i gian nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch approval theo due date thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/upcoming-due")
    @Operation(summary = "Láº¥y approval sáº¯p Ä‘áº¿n háº¡n", description = "Láº¥y danh sÃ¡ch approval sáº¯p Ä‘áº¿n háº¡n")
    public ResponseEntity<RestResponse<List<Approval>>> getUpcomingDueApprovals(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        List<Approval> approvals = approvalService.getUpcomingDueApprovals(contractId, dueDate);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o sáº¯p Ä‘áº¿n háº¡n.")
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
            .description("Láº¥y danh sÃ¡ch approval sáº¯p Ä‘áº¿n háº¡n thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/notified")
    @Operation(summary = "Láº¥y approval Ä‘Ã£ Ä‘Æ°á»£c notify", description = "Láº¥y danh sÃ¡ch approval Ä‘Ã£ Ä‘Æ°á»£c thÃ´ng bÃ¡o")
    public ResponseEntity<RestResponse<List<Approval>>> getNotifiedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getNotifiedApprovals(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o Ä‘Ã£ Ä‘Æ°á»£c thÃ´ng bÃ¡o.")
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
            .description("Láº¥y danh sÃ¡ch approval Ä‘Ã£ Ä‘Æ°á»£c notify thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/unnotified")
    @Operation(summary = "Láº¥y approval chÆ°a Ä‘Æ°á»£c notify", description = "Láº¥y danh sÃ¡ch approval chÆ°a Ä‘Æ°á»£c thÃ´ng bÃ¡o")
    public ResponseEntity<RestResponse<List<Approval>>> getUnnotifiedApprovals(@PathVariable String contractId) {
        List<Approval> approvals = approvalService.getUnnotifiedApprovals(contractId);
        
        if (approvals.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ approval nÃ o chÆ°a Ä‘Æ°á»£c thÃ´ng bÃ¡o.")
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
            .description("Láº¥y danh sÃ¡ch approval chÆ°a Ä‘Æ°á»£c notify thÃ nh cÃ´ng.")
            .data(approvals)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/approve")
    @Operation(summary = "PhÃª duyá»‡t approval", description = "PhÃª duyá»‡t approval vá»›i comments")
    public ResponseEntity<RestResponse<Approval>> approveApproval(
            @PathVariable String id,
            @RequestParam String comments) {
        Approval approval = approvalService.approveApproval(id, comments);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("PhÃª duyá»‡t approval thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/reject")
    @Operation(summary = "Tá»« chá»‘i approval", description = "Tá»« chá»‘i approval vá»›i lÃ½ do")
    public ResponseEntity<RestResponse<Approval>> rejectApproval(
            @PathVariable String id,
            @RequestParam String rejectionReason) {
        Approval approval = approvalService.rejectApproval(id, rejectionReason);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tá»« chá»‘i approval thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/cancel")
    @Operation(summary = "Há»§y approval", description = "Há»§y approval")
    public ResponseEntity<RestResponse<Approval>> cancelApproval(@PathVariable String id) {
        Approval approval = approvalService.cancelApproval(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Há»§y approval thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/expire")
    @Operation(summary = "ÄÃ¡nh dáº¥u approval háº¿t háº¡n", description = "ÄÃ¡nh dáº¥u approval Ä‘Ã£ háº¿t háº¡n")
    public ResponseEntity<RestResponse<Approval>> markApprovalAsExpired(@PathVariable String id) {
        Approval approval = approvalService.markApprovalAsExpired(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u approval háº¿t háº¡n thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/increment-reminder")
    @Operation(summary = "TÄƒng reminder count", description = "TÄƒng sá»‘ láº§n nháº¯c nhá»Ÿ")
    public ResponseEntity<RestResponse<Approval>> incrementReminderCount(@PathVariable String id) {
        Approval approval = approvalService.incrementReminderCount(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("TÄƒng reminder count thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/notify")
    @Operation(summary = "ÄÃ¡nh dáº¥u Ä‘Ã£ notify", description = "ÄÃ¡nh dáº¥u approval Ä‘Ã£ Ä‘Æ°á»£c thÃ´ng bÃ¡o")
    public ResponseEntity<RestResponse<Approval>> setNotificationTime(@PathVariable String id) {
        Approval approval = approvalService.setNotificationTime(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u Ä‘Ã£ notify thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/due-date")
    @Operation(summary = "Cáº­p nháº­t due date", description = "Cáº­p nháº­t ngÃ y háº¿t háº¡n")
    public ResponseEntity<RestResponse<Approval>> setDueDate(
            @PathVariable String id,
            @RequestParam LocalDateTime dueDate) {
        Approval approval = approvalService.setDueDate(id, dueDate);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t due date thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/priority")
    @Operation(summary = "Cáº­p nháº­t priority", description = "Cáº­p nháº­t má»©c Ä‘á»™ Æ°u tiÃªn")
    public ResponseEntity<RestResponse<Approval>> setPriority(
            @PathVariable String id,
            @RequestParam Approval.ApprovalPriority priority) {
        Approval approval = approvalService.setPriority(id, priority);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t priority thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/order")
    @Operation(summary = "Cáº­p nháº­t approval order", description = "Cáº­p nháº­t thá»© tá»± phÃª duyá»‡t")
    public ResponseEntity<RestResponse<Approval>> setApprovalOrder(
            @PathVariable String id,
            @RequestParam Integer approvalOrder) {
        Approval approval = approvalService.setApprovalOrder(id, approvalOrder);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t approval order thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/required")
    @Operation(summary = "Cáº­p nháº­t isRequired", description = "Cáº­p nháº­t tráº¡ng thÃ¡i báº¯t buá»™c")
    public ResponseEntity<RestResponse<Approval>> setIsRequired(
            @PathVariable String id,
            @RequestParam Boolean isRequired) {
        Approval approval = approvalService.setIsRequired(id, isRequired);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t isRequired thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/approvals/{id}")
    @Operation(summary = "XÃ³a approval", description = "Soft delete approval")
    public ResponseEntity<RestResponse<Void>> deleteApproval(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        approvalService.deleteApproval(id, deletedBy);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ³a approval thÃ nh cÃ´ng.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/approvals/{id}/restore")
    @Operation(summary = "KhÃ´i phá»¥c approval", description = "KhÃ´i phá»¥c approval Ä‘Ã£ xÃ³a")
    public ResponseEntity<RestResponse<Approval>> restoreApproval(@PathVariable String id) {
        Approval approval = approvalService.restoreApproval(id);
        
        RestResponse<Approval> response = RestResponse.<Approval>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("KhÃ´i phá»¥c approval thÃ nh cÃ´ng.")
            .data(approval)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/count")
    @Operation(summary = "Äáº¿m sá»‘ approval", description = "Äáº¿m sá»‘ lÆ°á»£ng approval theo status")
    public ResponseEntity<RestResponse<Long>> countApprovalsByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam Approval.ApprovalStatus status) {
        long count = approvalService.countApprovalsByContractIdAndStatus(contractId, status);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ approval thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/approvals/approver/{approverId}/count")
    @Operation(summary = "Äáº¿m sá»‘ approval cá»§a approver", description = "Äáº¿m sá»‘ lÆ°á»£ng approval cá»§a approver theo status")
    public ResponseEntity<RestResponse<Long>> countApprovalsByApproverIdAndStatus(
            @PathVariable String approverId,
            @RequestParam Approval.ApprovalStatus status) {
        long count = approvalService.countApprovalsByApproverIdAndStatus(approverId, status);
        
        RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ approval cá»§a approver thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-pending")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval pending", description = "Kiá»ƒm tra contract cÃ³ approval Ä‘ang pending khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasPendingApprovals(@PathVariable String contractId) {
        boolean hasPending = approvalService.hasPendingApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval pending thÃ nh cÃ´ng.")
            .data(hasPending)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-approved")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval approved", description = "Kiá»ƒm tra contract cÃ³ approval Ä‘Ã£ approved khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasApprovedApprovals(@PathVariable String contractId) {
        boolean hasApproved = approvalService.hasApprovedApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval approved thÃ nh cÃ´ng.")
            .data(hasApproved)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-rejected")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval rejected", description = "Kiá»ƒm tra contract cÃ³ approval Ä‘Ã£ rejected khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasRejectedApprovals(@PathVariable String contractId) {
        boolean hasRejected = approvalService.hasRejectedApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval rejected thÃ nh cÃ´ng.")
            .data(hasRejected)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-expired")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval expired", description = "Kiá»ƒm tra contract cÃ³ approval Ä‘Ã£ háº¿t háº¡n khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasExpiredApprovals(@PathVariable String contractId) {
        boolean hasExpired = approvalService.hasExpiredApprovals(contractId);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval expired thÃ nh cÃ´ng.")
            .data(hasExpired)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/has-expiring")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval expiring", description = "Kiá»ƒm tra contract cÃ³ approval sáº¯p háº¿t háº¡n khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasExpiringApprovals(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        boolean hasExpiring = approvalService.hasExpiringApprovals(contractId, dueDate);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval expiring thÃ nh cÃ´ng.")
            .data(hasExpiring)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/needs-reminder")
    @Operation(summary = "Kiá»ƒm tra cáº§n reminder", description = "Kiá»ƒm tra contract cÃ³ approval cáº§n nháº¯c nhá»Ÿ khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsNeedingReminder(
            @PathVariable String contractId,
            @RequestParam Integer reminderCount) {
        boolean needsReminder = approvalService.hasApprovalsNeedingReminder(contractId, reminderCount);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cáº§n reminder thÃ nh cÃ´ng.")
            .data(needsReminder)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/by-role/{approverRole}")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval theo role", description = "Kiá»ƒm tra contract cÃ³ approval theo role khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsByRole(
            @PathVariable String contractId,
            @PathVariable String approverRole) {
        boolean hasByRole = approvalService.hasApprovalsByRole(contractId, approverRole);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval theo role thÃ nh cÃ´ng.")
            .data(hasByRole)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/approvals/by-role-status")
    @Operation(summary = "Kiá»ƒm tra cÃ³ approval theo role vÃ  status", description = "Kiá»ƒm tra contract cÃ³ approval theo role vÃ  status khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> hasApprovalsByRoleAndStatus(
            @PathVariable String contractId,
            @RequestParam String approverRole,
            @RequestParam Approval.ApprovalStatus status) {
        boolean hasByRoleAndStatus = approvalService.hasApprovalsByRoleAndStatus(contractId, approverRole, status);
        
        RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra approval theo role vÃ  status thÃ nh cÃ´ng.")
            .data(hasByRoleAndStatus)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

