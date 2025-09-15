package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.AuditLog;
import com.devgo2003.docgo.contract_service.service.AuditService;
import com.devgo2003.docgo.contract_service.dto.AuditLogCreateRequest;
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
@RequestMapping("/api/v1/contract-management-service/audit-logs")
@Tag(name = "API Quáº£n lÃ½ Audit Log", description = "CÃ¡c API Ä‘á»ƒ quáº£n lÃ½ nháº­t kÃ½ kiá»ƒm toÃ¡n trong há»‡ thá»‘ng DocGO")
public class AuditController {

    private final AuditService auditService;
    private final HttpServletRequest request;

    public AuditController(AuditService auditService, HttpServletRequest request) {
        this.auditService = auditService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Láº¥y danh sÃ¡ch táº¥t cáº£ audit log", 
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
        MÃ´ táº£: TrÆ°á»ng sáº¯p xáº¿p (máº·c Ä‘á»‹nh: timestamp)
        
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
        Loáº¡i: List<AuditLog>
        MÃ´ táº£: Danh sÃ¡ch audit log
        
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
    public ResponseEntity<RestResponse<List<AuditLog>>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        List<AuditLog> auditLogs = auditService.getAllAuditLogs();
        
        if (auditLogs.isEmpty()) {
            RestResponse<List<AuditLog>> response = RestResponse.<List<AuditLog>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ audit log nÃ o.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<AuditLog>> response = RestResponse.<List<AuditLog>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch audit log thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Láº¥y chi tiáº¿t audit log", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ”— id (báº¯t buá»™c, path)
        Loáº¡i: string
        MÃ´ táº£: ID cá»§a audit log cáº§n láº¥y
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: AuditLog
        MÃ´ táº£: ThÃ´ng tin chi tiáº¿t audit log
        
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
    public ResponseEntity<RestResponse<AuditLog>> getAuditLog(@PathVariable String id) {
        Optional<AuditLog> auditLog = auditService.getAuditLogById(id);
        
        if (auditLog.isEmpty()) {
            RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y audit log vá»›i ID: " + id)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y chi tiáº¿t audit log thÃ nh cÃ´ng.")
            .data(auditLog.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Táº¡o audit log má»›i", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ auditLog (báº¯t buá»™c, body)
        Loáº¡i: AuditLogCreateRequest
        MÃ´ táº£: ThÃ´ng tin audit log cáº§n táº¡o (eventType, eventCategory, action, description, userId, userName, contractId)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: AuditLog
        MÃ´ táº£: ThÃ´ng tin audit log Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng
        
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
    public ResponseEntity<RestResponse<AuditLog>> createAuditLog(@RequestBody AuditLogCreateRequest request) {
        AuditLog auditLog = auditService.createAuditLog(request);
        
        RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o audit log thÃ nh cÃ´ng.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/audit-logs")
    @Operation(summary = "Táº¡o audit log má»›i", description = "Táº¡o audit log má»›i")
    public ResponseEntity<RestResponse<AuditLog>> createAuditLog(
            @RequestParam String eventType,
            @RequestParam AuditLog.EventCategory eventCategory,
            @RequestParam String action,
            @RequestParam String description,
            @RequestParam String userId,
            @RequestParam String userName) {
        
        AuditLog auditLog = auditService.createAuditLog(eventType, eventCategory, action, description, userId, userName);
        
        RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o audit log thÃ nh cÃ´ng.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/audit-logs")
    @Operation(summary = "Táº¡o audit log cho contract", description = "Táº¡o audit log má»›i cho contract")
    public ResponseEntity<RestResponse<AuditLog>> createAuditLogForContract(
            @PathVariable String contractId,
            @RequestParam String eventType,
            @RequestParam AuditLog.EventCategory eventCategory,
            @RequestParam String action,
            @RequestParam String description,
            @RequestParam String userId,
            @RequestParam String userName) {
        
        AuditLog auditLog = auditService.createAuditLogForContract(contractId, eventType, eventCategory, action, description, userId, userName);
        
        RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o audit log cho contract thÃ nh cÃ´ng.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs")
    @Operation(summary = "Láº¥y danh sÃ¡ch audit log", description = "Láº¥y táº¥t cáº£ audit log cá»§a contract")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByContractId(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
            RestResponse<List<AuditLog>> response = RestResponse.<List<AuditLog>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ audit log nÃ o cho contract nÃ y.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<AuditLog>> response = RestResponse.<List<AuditLog>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch audit log thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/audit-logs/{id}")
    @Operation(summary = "Láº¥y audit log theo ID", description = "Láº¥y chi tiáº¿t audit log")
    public ResponseEntity<RestResponse<AuditLog>> getAuditLogById(@PathVariable String id) {
        Optional<AuditLog> auditLog = auditService.getAuditLogById(id);
        
        if (auditLog.isEmpty()) {
            RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y audit log.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<AuditLog> response = RestResponse.<AuditLog>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y audit log thÃ nh cÃ´ng.")
            .data(auditLog.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/category/{eventCategory}")
    @Operation(summary = "Láº¥y audit log theo event category", description = "Láº¥y danh sÃ¡ch audit log theo event category")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByEventCategory(
            @PathVariable String contractId,
            @PathVariable AuditLog.EventCategory eventCategory) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByEventCategory(contractId, eventCategory);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log nÃ o vá»›i event category nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch audit log theo event category thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/audit-logs/user/{userId}")
    @Operation(summary = "Láº¥y audit log theo user ID", description = "Láº¥y danh sÃ¡ch audit log cá»§a user")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByUserId(@PathVariable String userId) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByUserId(userId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log nÃ o cá»§a user nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch audit log cá»§a user thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/successful")
    @Operation(summary = "Láº¥y audit log successful", description = "Láº¥y danh sÃ¡ch audit log thÃ nh cÃ´ng")
    public ResponseEntity<RestResponse<List<AuditLog>>> getSuccessfulLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getSuccessfulLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log successful nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch audit log successful thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/failed")
    @Operation(summary = "Láº¥y audit log failed", description = "Láº¥y danh sÃ¡ch audit log tháº¥t báº¡i")
    public ResponseEntity<RestResponse<List<AuditLog>>> getFailedLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getFailedLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log failed nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch audit log failed thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/high-severity")
    @Operation(summary = "Láº¥y audit log high severity", description = "Láº¥y danh sÃ¡ch audit log má»©c Ä‘á»™ cao")
    public ResponseEntity<RestResponse<List<AuditLog>>> getHighSeverityLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getHighSeverityLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log high severity nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch audit log high severity thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/sensitive")
    @Operation(summary = "Láº¥y audit log sensitive", description = "Láº¥y danh sÃ¡ch audit log nháº¡y cáº£m")
    public ResponseEntity<RestResponse<List<AuditLog>>> getSensitiveLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getSensitiveLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log sensitive nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch audit log sensitive thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/compliance-required")
    @Operation(summary = "Láº¥y audit log compliance required", description = "Láº¥y danh sÃ¡ch audit log cáº§n compliance")
    public ResponseEntity<RestResponse<List<AuditLog>>> getComplianceRequiredLogs(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getComplianceRequiredLogsByContractId(contractId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log compliance required nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch audit log compliance required thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/order-by-created")
    @Operation(summary = "Láº¥y audit log sáº¯p xáº¿p theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch audit log sáº¯p xáº¿p theo thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsOrderByCreatedAt(@PathVariable String contractId) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByContractIdOrderByCreatedAt(contractId);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch audit log sáº¯p xáº¿p theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/created-between")
    @Operation(summary = "Láº¥y audit log theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch audit log trong khoáº£ng thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<AuditLog>>> getAuditLogsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<AuditLog> auditLogs = auditService.getAuditLogsByContractIdAndCreatedAtBetween(contractId, startDate, endDate);
        
        if (auditLogs.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ audit log nÃ o trong khoáº£ng thá»i gian nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch audit log theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(auditLogs)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/audit-logs/{id}/mark-success")
    @Operation(summary = "ÄÃ¡nh dáº¥u thÃ nh cÃ´ng", description = "ÄÃ¡nh dáº¥u audit log thÃ nh cÃ´ng")
    public ResponseEntity<RestResponse<AuditLog>> markAsSuccess(@PathVariable String id) {
        AuditLog auditLog = auditService.markAsSuccess(id);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u audit log thÃ nh cÃ´ng.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/audit-logs/{id}/mark-failure")
    @Operation(summary = "ÄÃ¡nh dáº¥u tháº¥t báº¡i", description = "ÄÃ¡nh dáº¥u audit log tháº¥t báº¡i")
    public ResponseEntity<RestResponse<AuditLog>> markAsFailure(
            @PathVariable String id,
            @RequestParam String errorCode,
            @RequestParam String errorMessage) {
        AuditLog auditLog = auditService.markAsFailure(id, errorCode, errorMessage);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u audit log tháº¥t báº¡i.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/audit-logs/{id}/mark-sensitive")
    @Operation(summary = "ÄÃ¡nh dáº¥u sensitive", description = "ÄÃ¡nh dáº¥u audit log lÃ  nháº¡y cáº£m")
    public ResponseEntity<RestResponse<AuditLog>> markAsSensitive(@PathVariable String id) {
        AuditLog auditLog = auditService.markAsSensitive(id);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u audit log sensitive.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/audit-logs/{id}/compliance-requirement")
    @Operation(summary = "Cáº­p nháº­t compliance requirement", description = "Cáº­p nháº­t yÃªu cáº§u compliance")
    public ResponseEntity<RestResponse<AuditLog>> setComplianceRequirement(
            @PathVariable String id,
            @RequestParam String complianceStandard) {
        AuditLog auditLog = auditService.setComplianceRequirement(id, complianceStandard);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t compliance requirement thÃ nh cÃ´ng.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/audit-logs/{id}/mark-exported")
    @Operation(summary = "ÄÃ¡nh dáº¥u Ä‘Ã£ exported", description = "ÄÃ¡nh dáº¥u audit log Ä‘Ã£ Ä‘Æ°á»£c exported")
    public ResponseEntity<RestResponse<AuditLog>> markAsExported(
            @PathVariable String id,
            @RequestParam String exportedBy) {
        AuditLog auditLog = auditService.markAsExported(id, exportedBy);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u audit log Ä‘Ã£ exported.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/audit-logs/{id}")
    @Operation(summary = "XÃ³a audit log", description = "Soft delete audit log")
    public ResponseEntity<RestResponse<Void>> deleteAuditLog(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        auditService.deleteAuditLog(id, deletedBy);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ³a audit log thÃ nh cÃ´ng.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/audit-logs/{id}/restore")
    @Operation(summary = "KhÃ´i phá»¥c audit log", description = "KhÃ´i phá»¥c audit log Ä‘Ã£ xÃ³a")
    public ResponseEntity<RestResponse<AuditLog>> restoreAuditLog(@PathVariable String id) {
        AuditLog auditLog = auditService.restoreAuditLog(id);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("KhÃ´i phá»¥c audit log thÃ nh cÃ´ng.")
            .data(auditLog)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/count")
    @Operation(summary = "Äáº¿m sá»‘ audit log", description = "Äáº¿m sá»‘ lÆ°á»£ng audit log")
    public ResponseEntity<RestResponse<Long>> countAuditLogsByContractId(@PathVariable String contractId) {
        long count = auditService.countAuditLogsByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ audit log thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/audit-logs/user/{userId}/count")
    @Operation(summary = "Äáº¿m sá»‘ audit log cá»§a user", description = "Äáº¿m sá»‘ lÆ°á»£ng audit log cá»§a user")
    public ResponseEntity<RestResponse<Long>> countAuditLogsByUserId(@PathVariable String userId) {
        long count = auditService.countAuditLogsByUserId(userId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ audit log cá»§a user thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/audit-logs/exists")
    @Operation(summary = "Kiá»ƒm tra cÃ³ audit log", description = "Kiá»ƒm tra contract cÃ³ audit log khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsAuditLogsByContractId(@PathVariable String contractId) {
        boolean exists = auditService.existsAuditLogsByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ audit log thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

