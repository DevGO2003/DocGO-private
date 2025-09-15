package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.Version;
import com.devgo2003.docgo.contract_service.service.VersionService;
import com.devgo2003.docgo.contract_service.dto.VersionCreateRequest;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contract-management-service/versions")
@Tag(name = "API Quáº£n lÃ½ PhiÃªn báº£n", description = "CÃ¡c API Ä‘á»ƒ quáº£n lÃ½ phiÃªn báº£n há»£p Ä‘á»“ng trong há»‡ thá»‘ng DocGO")
public class VersionController {

    private final VersionService versionService;
    private final HttpServletRequest request;

    public VersionController(VersionService versionService, HttpServletRequest request) {
        this.versionService = versionService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Láº¥y danh sÃ¡ch táº¥t cáº£ phiÃªn báº£n", 
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
        Loáº¡i: List<Version>
        MÃ´ táº£: Danh sÃ¡ch phiÃªn báº£n
        
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
    public ResponseEntity<RestResponse<List<Version>>> getAllVersions(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        List<Version> versions = versionService.getAllVersions();
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ phiÃªn báº£n nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch phiÃªn báº£n thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Láº¥y chi tiáº¿t phiÃªn báº£n", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ”— id (báº¯t buá»™c, path)
        Loáº¡i: string
        MÃ´ táº£: ID cá»§a phiÃªn báº£n cáº§n láº¥y
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: Version
        MÃ´ táº£: ThÃ´ng tin chi tiáº¿t phiÃªn báº£n
        
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
    public ResponseEntity<RestResponse<Version>> getVersion(@PathVariable String id) {
        Optional<Version> version = versionService.getVersionById(id);
        
        if (version.isEmpty()) {
            RestResponse<Version> response = RestResponse.<Version>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y phiÃªn báº£n vá»›i ID: " + id)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y chi tiáº¿t phiÃªn báº£n thÃ nh cÃ´ng.")
            .data(version.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Táº¡o phiÃªn báº£n má»›i", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ version (báº¯t buá»™c, body)
        Loáº¡i: VersionCreateRequest
        MÃ´ táº£: ThÃ´ng tin phiÃªn báº£n cáº§n táº¡o (contractId, versionNumber, changeDescription, changeType, createdBy)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: Version
        MÃ´ táº£: ThÃ´ng tin phiÃªn báº£n Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng
        
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
    public ResponseEntity<RestResponse<Version>> createVersion(@RequestBody VersionCreateRequest request) {
        Version version = versionService.createVersion(request);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o phiÃªn báº£n thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/versions")
    @Operation(summary = "Táº¡o version má»›i", description = "Táº¡o version má»›i cho contract")
    public ResponseEntity<RestResponse<Version>> createVersion(
            @PathVariable String contractId,
            @RequestParam String versionNumber,
            @RequestParam String versionName,
            @RequestParam Version.ChangeType changeType,
            @RequestParam String changesSummary) {
        
        Version version = versionService.createVersion(contractId, versionNumber, versionName, changeType, changesSummary);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o version thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions")
    @Operation(summary = "Láº¥y danh sÃ¡ch version", description = "Láº¥y táº¥t cáº£ version cá»§a contract")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByContractId(@PathVariable String contractId) {
        List<Version> versions = versionService.getVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o cho contract nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/versions/{id}")
    @Operation(summary = "Láº¥y version theo ID", description = "Láº¥y chi tiáº¿t version")
    public ResponseEntity<RestResponse<Version>> getVersionById(@PathVariable String id) {
        Optional<Version> version = versionService.getVersionById(id);
        
        if (version.isEmpty()) {
            RestResponse<Version> response = RestResponse.<Version>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y version vá»›i ID: " + id)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y version thÃ nh cÃ´ng.")
            .data(version.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/current")
    @Operation(summary = "Láº¥y version hiá»‡n táº¡i", description = "Láº¥y version hiá»‡n táº¡i cá»§a contract")
    public ResponseEntity<RestResponse<Version>> getCurrentVersion(@PathVariable String contractId) {
        Optional<Version> version = versionService.getCurrentVersionByContractId(contractId);
        
        if (version.isEmpty()) {
            RestResponse<Version> response = RestResponse.<Version>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng cÃ³ version hiá»‡n táº¡i cho contract: " + contractId)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y version hiá»‡n táº¡i thÃ nh cÃ´ng.")
            .data(version.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/published")
    @Operation(summary = "Láº¥y version Ä‘Ã£ published", description = "Láº¥y danh sÃ¡ch version Ä‘Ã£ published")
    public ResponseEntity<RestResponse<List<Version>>> getPublishedVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getPublishedVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o Ä‘Ã£ published.")
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
            .description("Láº¥y danh sÃ¡ch version published thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/unpublished")
    @Operation(summary = "Láº¥y version chÆ°a published", description = "Láº¥y danh sÃ¡ch version chÆ°a published")
    public ResponseEntity<RestResponse<List<Version>>> getUnpublishedVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getUnpublishedVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o chÆ°a published.")
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
            .description("Láº¥y danh sÃ¡ch version unpublished thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/change-type/{changeType}")
    @Operation(summary = "Láº¥y version theo change type", description = "Láº¥y danh sÃ¡ch version theo loáº¡i thay Ä‘á»•i")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChangeType(
            @PathVariable String contractId,
            @PathVariable Version.ChangeType changeType) {
        List<Version> versions = versionService.getVersionsByChangeType(contractId, changeType);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o vá»›i change type nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo change type thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/current-list")
    @Operation(summary = "Láº¥y danh sÃ¡ch version hiá»‡n táº¡i", description = "Láº¥y danh sÃ¡ch version Ä‘ang lÃ  current")
    public ResponseEntity<RestResponse<List<Version>>> getCurrentVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getCurrentVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o Ä‘ang lÃ  current.")
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
            .description("Láº¥y danh sÃ¡ch version current thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/published-list")
    @Operation(summary = "Láº¥y danh sÃ¡ch version published", description = "Láº¥y danh sÃ¡ch version Ä‘Ã£ published")
    public ResponseEntity<RestResponse<List<Version>>> getPublishedVersionsList(@PathVariable String contractId) {
        List<Version> versions = versionService.getPublishedVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o Ä‘Ã£ published.")
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
            .description("Láº¥y danh sÃ¡ch version published thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/approval-required")
    @Operation(summary = "Láº¥y version cáº§n approval", description = "Láº¥y danh sÃ¡ch version cáº§n phÃª duyá»‡t")
    public ResponseEntity<RestResponse<List<Version>>> getApprovalRequiredVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getApprovalRequiredVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o cáº§n approval.")
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
            .description("Láº¥y danh sÃ¡ch version cáº§n approval thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/no-approval-required")
    @Operation(summary = "Láº¥y version khÃ´ng cáº§n approval", description = "Láº¥y danh sÃ¡ch version khÃ´ng cáº§n phÃª duyá»‡t")
    public ResponseEntity<RestResponse<List<Version>>> getNoApprovalRequiredVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getNoApprovalRequiredVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o khÃ´ng cáº§n approval.")
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
            .description("Láº¥y danh sÃ¡ch version khÃ´ng cáº§n approval thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/previous/{previousVersionId}")
    @Operation(summary = "Láº¥y version theo previous version", description = "Láº¥y danh sÃ¡ch version theo previous version ID")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByPreviousVersionId(
            @PathVariable String contractId,
            @PathVariable String previousVersionId) {
        List<Version> versions = versionService.getVersionsByPreviousVersionId(previousVersionId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o vá»›i previous version nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo previous version thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/order-by-version")
    @Operation(summary = "Láº¥y version sáº¯p xáº¿p theo version number", description = "Láº¥y danh sÃ¡ch version sáº¯p xáº¿p theo version number")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsOrderByVersionNumber(@PathVariable String contractId) {
        List<Version> versions = versionService.getVersionsByContractIdOrderByVersionNumber(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version sáº¯p xáº¿p theo version number thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/order-by-created")
    @Operation(summary = "Láº¥y version sáº¯p xáº¿p theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch version sáº¯p xáº¿p theo thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsOrderByCreatedAt(@PathVariable String contractId) {
        List<Version> versions = versionService.getVersionsByContractIdOrderByCreatedAt(contractId);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version sáº¯p xáº¿p theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/created-between")
    @Operation(summary = "Láº¥y version theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch version trong khoáº£ng thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByCreatedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Version> versions = versionService.getVersionsByCreatedAtBetween(startDate, endDate);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o trong khoáº£ng thá»i gian nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/published-between")
    @Operation(summary = "Láº¥y version theo thá»i gian published", description = "Láº¥y danh sÃ¡ch version trong khoáº£ng thá»i gian published")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByPublishedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Version> versions = versionService.getVersionsByPublishedAtBetween(startDate, endDate);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o trong khoáº£ng thá»i gian published nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo thá»i gian published thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/approved-between")
    @Operation(summary = "Láº¥y version theo thá»i gian approved", description = "Láº¥y danh sÃ¡ch version trong khoáº£ng thá»i gian approved")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByApprovedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Version> versions = versionService.getVersionsByApprovedAtBetween(startDate, endDate);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o trong khoáº£ng thá»i gian approved nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo thá»i gian approved thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/published-by/{publishedBy}")
    @Operation(summary = "Láº¥y version theo published by", description = "Láº¥y danh sÃ¡ch version theo ngÆ°á»i published")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByPublishedBy(
            @PathVariable String contractId,
            @PathVariable String publishedBy) {
        List<Version> versions = versionService.getVersionsByPublishedBy(publishedBy);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o Ä‘Æ°á»£c published bá»Ÿi ngÆ°á»i nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo published by thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/approved-by/{approvedBy}")
    @Operation(summary = "Láº¥y version theo approved by", description = "Láº¥y danh sÃ¡ch version theo ngÆ°á»i approved")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByApprovedBy(
            @PathVariable String contractId,
            @PathVariable String approvedBy) {
        List<Version> versions = versionService.getVersionsByApprovedBy(approvedBy);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o Ä‘Æ°á»£c approved bá»Ÿi ngÆ°á»i nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo approved by thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/tags")
    @Operation(summary = "Láº¥y version theo tags", description = "Láº¥y danh sÃ¡ch version theo tags")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByTags(
            @PathVariable String contractId,
            @RequestParam String[] tags) {
        List<Version> versions = versionService.getVersionsByContractIdAndTags(contractId, tags);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o vá»›i tags nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo tags thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/change-type/{changeType}/order-by-created")
    @Operation(summary = "Láº¥y version theo change type sáº¯p xáº¿p theo thá»i gian táº¡o", description = "Láº¥y danh sÃ¡ch version theo change type sáº¯p xáº¿p theo thá»i gian táº¡o")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChangeTypeOrderByCreatedAt(
            @PathVariable String contractId,
            @PathVariable Version.ChangeType changeType) {
        List<Version> versions = versionService.getVersionsByContractIdAndChangeTypeOrderByCreatedAt(contractId, changeType);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o vá»›i change type nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo change type sáº¯p xáº¿p theo thá»i gian táº¡o thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/change-type/{changeType}/order-by-version")
    @Operation(summary = "Láº¥y version theo change type sáº¯p xáº¿p theo version number", description = "Láº¥y danh sÃ¡ch version theo change type sáº¯p xáº¿p theo version number")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChangeTypeOrderByVersionNumber(
            @PathVariable String contractId,
            @PathVariable Version.ChangeType changeType) {
        List<Version> versions = versionService.getVersionsByContractIdAndChangeTypeOrderByVersionNumber(contractId, changeType);
        
        if (versions.isEmpty()) {
            RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ version nÃ o vá»›i change type nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo change type sáº¯p xáº¿p theo version number thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/previous/{previousVersionId}/list")
    @Operation(summary = "Láº¥y version theo previous version ID", description = "Láº¥y danh sÃ¡ch version theo previous version ID")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByContractIdAndPreviousVersionId(
            @PathVariable String contractId,
            @PathVariable String previousVersionId) {
        List<Version> versions = versionService.getVersionsByContractIdAndPreviousVersionId(contractId, previousVersionId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version nÃ o vá»›i previous version ID nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo previous version ID thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/file-path/{filePath}")
    @Operation(summary = "Láº¥y version theo file path", description = "Láº¥y danh sÃ¡ch version theo file path")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByFilePath(
            @PathVariable String contractId,
            @PathVariable String filePath) {
        List<Version> versions = versionService.getVersionsByContractIdAndFilePath(contractId, filePath);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version nÃ o vá»›i file path nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo file path thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/checksum/{checksum}")
    @Operation(summary = "Láº¥y version theo checksum", description = "Láº¥y danh sÃ¡ch version theo checksum")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByChecksum(
            @PathVariable String contractId,
            @PathVariable String checksum) {
        List<Version> versions = versionService.getVersionsByContractIdAndChecksum(contractId, checksum);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version nÃ o vá»›i checksum nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo checksum thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/file-size/{fileSize}")
    @Operation(summary = "Láº¥y version theo file size", description = "Láº¥y danh sÃ¡ch version theo file size")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByFileSize(
            @PathVariable String contractId,
            @PathVariable Long fileSize) {
        List<Version> versions = versionService.getVersionsByContractIdAndFileSize(contractId, fileSize);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version nÃ o vá»›i file size nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo file size thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/file-size-between")
    @Operation(summary = "Láº¥y version theo file size trong khoáº£ng", description = "Láº¥y danh sÃ¡ch version theo file size trong khoáº£ng")
    public ResponseEntity<RestResponse<List<Version>>> getVersionsByFileSizeBetween(
            @PathVariable String contractId,
            @RequestParam Long minSize,
            @RequestParam Long maxSize) {
        List<Version> versions = versionService.getVersionsByContractIdAndFileSizeBetween(contractId, minSize, maxSize);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version nÃ o vá»›i file size trong khoáº£ng nÃ y.")
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
            .description("Láº¥y danh sÃ¡ch version theo file size trong khoáº£ng thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/rollback")
    @Operation(summary = "Láº¥y version rollback", description = "Láº¥y danh sÃ¡ch version rollback")
    public ResponseEntity<RestResponse<List<Version>>> getRollbackVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getRollbackVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version rollback nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version rollback thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/rollback-by-type")
    @Operation(summary = "Láº¥y version rollback theo change type", description = "Láº¥y danh sÃ¡ch version rollback theo change type")
    public ResponseEntity<RestResponse<List<Version>>> getRollbackVersionsByChangeType(@PathVariable String contractId) {
        List<Version> versions = versionService.getRollbackVersionsByContractIdAndChangeType(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version rollback nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version rollback theo change type thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/draft")
    @Operation(summary = "Láº¥y version draft", description = "Láº¥y danh sÃ¡ch version draft")
    public ResponseEntity<RestResponse<List<Version>>> getDraftVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getDraftVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version draft nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version draft thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/major")
    @Operation(summary = "Láº¥y version major", description = "Láº¥y danh sÃ¡ch version major")
    public ResponseEntity<RestResponse<List<Version>>> getMajorVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getMajorVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version major nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version major thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/minor")
    @Operation(summary = "Láº¥y version minor", description = "Láº¥y danh sÃ¡ch version minor")
    public ResponseEntity<RestResponse<List<Version>>> getMinorVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getMinorVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version minor nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version minor thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/patch")
    @Operation(summary = "Láº¥y version patch", description = "Láº¥y danh sÃ¡ch version patch")
    public ResponseEntity<RestResponse<List<Version>>> getPatchVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getPatchVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version patch nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version patch thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/hotfix")
    @Operation(summary = "Láº¥y version hotfix", description = "Láº¥y danh sÃ¡ch version hotfix")
    public ResponseEntity<RestResponse<List<Version>>> getHotfixVersions(@PathVariable String contractId) {
        List<Version> versions = versionService.getHotfixVersionsByContractId(contractId);
        
        if (versions.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ version hotfix nÃ o.")
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
            .description("Láº¥y danh sÃ¡ch version hotfix thÃ nh cÃ´ng.")
            .data(versions)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/publish")
    @Operation(summary = "Publish version", description = "Publish version")
    public ResponseEntity<RestResponse<Version>> publishVersion(
            @PathVariable String id,
            @RequestParam String publishedBy) {
        Version version = versionService.publishVersion(id, publishedBy);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Publish version thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/approve")
    @Operation(summary = "Approve version", description = "Approve version")
    public ResponseEntity<RestResponse<Version>> approveVersion(
            @PathVariable String id,
            @RequestParam String approvedBy) {
        Version version = versionService.approveVersion(id, approvedBy);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Approve version thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/mark-current")
    @Operation(summary = "ÄÃ¡nh dáº¥u version hiá»‡n táº¡i", description = "ÄÃ¡nh dáº¥u version lÃ  current")
    public ResponseEntity<RestResponse<Version>> markVersionAsCurrent(@PathVariable String id) {
        Version version = versionService.markVersionAsCurrent(id);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u version hiá»‡n táº¡i thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/unmark-current")
    @Operation(summary = "Bá» Ä‘Ã¡nh dáº¥u version hiá»‡n táº¡i", description = "Bá» Ä‘Ã¡nh dáº¥u version lÃ  current")
    public ResponseEntity<RestResponse<Version>> unmarkVersionAsCurrent(@PathVariable String id) {
        Version version = versionService.unmarkVersionAsCurrent(id);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Bá» Ä‘Ã¡nh dáº¥u version hiá»‡n táº¡i thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/rollback")
    @Operation(summary = "Rollback version", description = "Rollback version")
    public ResponseEntity<RestResponse<Version>> rollbackVersion(
            @PathVariable String id,
            @RequestParam String rollbackReason) {
        Version version = versionService.rollbackVersion(id, rollbackReason);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Rollback version thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/previous-version")
    @Operation(summary = "Cáº­p nháº­t previous version ID", description = "Cáº­p nháº­t previous version ID")
    public ResponseEntity<RestResponse<Version>> setPreviousVersionId(
            @PathVariable String id,
            @RequestParam String previousVersionId) {
        Version version = versionService.setPreviousVersionId(id, previousVersionId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t previous version ID thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/file-path")
    @Operation(summary = "Cáº­p nháº­t file path", description = "Cáº­p nháº­t file path")
    public ResponseEntity<RestResponse<Version>> setFilePath(
            @PathVariable String id,
            @RequestParam String filePath) {
        Version version = versionService.setFilePath(id, filePath);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t file path thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/file-size")
    @Operation(summary = "Cáº­p nháº­t file size", description = "Cáº­p nháº­t file size")
    public ResponseEntity<RestResponse<Version>> setFileSize(
            @PathVariable String id,
            @RequestParam Long fileSize) {
        Version version = versionService.setFileSize(id, fileSize);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t file size thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/checksum")
    @Operation(summary = "Cáº­p nháº­t checksum", description = "Cáº­p nháº­t checksum")
    public ResponseEntity<RestResponse<Version>> setChecksum(
            @PathVariable String id,
            @RequestParam String checksum) {
        Version version = versionService.setChecksum(id, checksum);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t checksum thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/approval-required")
    @Operation(summary = "Cáº­p nháº­t approval required", description = "Cáº­p nháº­t tráº¡ng thÃ¡i cáº§n approval")
    public ResponseEntity<RestResponse<Version>> setApprovalRequired(
            @PathVariable String id,
            @RequestParam Boolean approvalRequired) {
        Version version = versionService.setApprovalRequired(id, approvalRequired);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t approval required thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/tags")
    @Operation(summary = "Cáº­p nháº­t tags", description = "Cáº­p nháº­t tags")
    public ResponseEntity<RestResponse<Version>> setTags(
            @PathVariable String id,
            @RequestParam String[] tags) {
        Version version = versionService.setTags(id, tags);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t tags thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/detailed-changes")
    @Operation(summary = "Cáº­p nháº­t detailed changes", description = "Cáº­p nháº­t detailed changes")
    public ResponseEntity<RestResponse<Version>> setDetailedChanges(
            @PathVariable String id,
            @RequestBody Map<String, Object> detailedChanges) {
        Version version = versionService.setDetailedChanges(id, detailedChanges);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t detailed changes thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/versions/{id}")
    @Operation(summary = "XÃ³a version", description = "Soft delete version")
    public ResponseEntity<RestResponse<Void>> deleteVersion(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        versionService.deleteVersion(id, deletedBy);
        
        RestResponse<Version> response = RestResponse.<Version>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ³a version thÃ nh cÃ´ng.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/versions/{id}/restore")
    @Operation(summary = "KhÃ´i phá»¥c version", description = "KhÃ´i phá»¥c version Ä‘Ã£ xÃ³a")
    public ResponseEntity<RestResponse<Version>> restoreVersion(@PathVariable String id) {
        Version version = versionService.restoreVersion(id);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("KhÃ´i phá»¥c version thÃ nh cÃ´ng.")
            .data(version)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/count")
    @Operation(summary = "Äáº¿m sá»‘ version", description = "Äáº¿m sá»‘ lÆ°á»£ng version")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractId(@PathVariable String contractId) {
        long count = versionService.countVersionsByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ version thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/count-by-change-type")
    @Operation(summary = "Äáº¿m sá»‘ version theo change type", description = "Äáº¿m sá»‘ lÆ°á»£ng version theo change type")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractIdAndChangeType(
            @PathVariable String contractId,
            @RequestParam Version.ChangeType changeType) {
        long count = versionService.countVersionsByContractIdAndChangeType(contractId, changeType);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ version theo change type thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/count-by-published")
    @Operation(summary = "Äáº¿m sá»‘ version theo published status", description = "Äáº¿m sá»‘ lÆ°á»£ng version theo published status")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractIdAndIsPublished(
            @PathVariable String contractId,
            @RequestParam Boolean isPublished) {
        long count = versionService.countVersionsByContractIdAndIsPublished(contractId, isPublished);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ version theo published status thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/count-by-current")
    @Operation(summary = "Äáº¿m sá»‘ version theo current status", description = "Äáº¿m sá»‘ lÆ°á»£ng version theo current status")
    public ResponseEntity<RestResponse<Long>> countVersionsByContractIdAndIsCurrent(
            @PathVariable String contractId,
            @RequestParam Boolean isCurrent) {
        long count = versionService.countVersionsByContractIdAndIsCurrent(contractId, isCurrent);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ version theo current status thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-version-number")
    @Operation(summary = "Kiá»ƒm tra tá»“n táº¡i version number", description = "Kiá»ƒm tra version number Ä‘Ã£ tá»“n táº¡i chÆ°a")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByContractIdAndVersionNumber(
            @PathVariable String contractId,
            @RequestParam String versionNumber) {
        boolean exists = versionService.existsVersionByContractIdAndVersionNumber(contractId, versionNumber);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra tá»“n táº¡i version number thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-current")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version current", description = "Kiá»ƒm tra contract cÃ³ version current khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsCurrentVersionByContractId(@PathVariable String contractId) {
        boolean exists = versionService.existsCurrentVersionByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version current thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-published")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version published", description = "Kiá»ƒm tra contract cÃ³ version published khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsPublishedVersionByContractId(@PathVariable String contractId) {
        boolean exists = versionService.existsPublishedVersionByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version published thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-change-type")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo change type", description = "Kiá»ƒm tra contract cÃ³ version theo change type khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByChangeType(
            @PathVariable String contractId,
            @RequestParam Version.ChangeType changeType) {
        boolean exists = versionService.existsVersionByChangeType(contractId, changeType);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo change type thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-tags")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo tags", description = "Kiá»ƒm tra contract cÃ³ version theo tags khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByTags(
            @PathVariable String contractId,
            @RequestParam String[] tags) {
        boolean exists = versionService.existsVersionByTags(contractId, tags);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo tags thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-file-path")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo file path", description = "Kiá»ƒm tra contract cÃ³ version theo file path khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByFilePath(
            @PathVariable String contractId,
            @RequestParam String filePath) {
        boolean exists = versionService.existsVersionByFilePath(contractId, filePath);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo file path thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-checksum")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo checksum", description = "Kiá»ƒm tra contract cÃ³ version theo checksum khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByChecksum(
            @PathVariable String contractId,
            @RequestParam String checksum) {
        boolean exists = versionService.existsVersionByChecksum(contractId, checksum);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo checksum thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-file-size")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo file size", description = "Kiá»ƒm tra contract cÃ³ version theo file size khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByFileSize(
            @PathVariable String contractId,
            @RequestParam Long fileSize) {
        boolean exists = versionService.existsVersionByFileSize(contractId, fileSize);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo file size thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-previous-version")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo previous version", description = "Kiá»ƒm tra contract cÃ³ version theo previous version khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByPreviousVersionId(
            @PathVariable String contractId,
            @RequestParam String previousVersionId) {
        boolean exists = versionService.existsVersionByPreviousVersionId(contractId, previousVersionId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo previous version thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-published-by")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo published by", description = "Kiá»ƒm tra contract cÃ³ version theo published by khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByPublishedBy(
            @PathVariable String contractId,
            @RequestParam String publishedBy) {
        boolean exists = versionService.existsVersionByPublishedBy(contractId, publishedBy);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo published by thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-approved-by")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo approved by", description = "Kiá»ƒm tra contract cÃ³ version theo approved by khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByApprovedBy(
            @PathVariable String contractId,
            @RequestParam String approvedBy) {
        boolean exists = versionService.existsVersionByApprovedBy(contractId, approvedBy);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo approved by thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-description")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo description", description = "Kiá»ƒm tra contract cÃ³ version theo description chá»©a tá»« khÃ³a khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByDescriptionContaining(
            @PathVariable String contractId,
            @RequestParam String keyword) {
        boolean exists = versionService.existsVersionByDescriptionContaining(contractId, keyword);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo description thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/versions/exists-by-changes-summary")
    @Operation(summary = "Kiá»ƒm tra cÃ³ version theo changes summary", description = "Kiá»ƒm tra contract cÃ³ version theo changes summary chá»©a tá»« khÃ³a khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVersionByChangesSummaryContaining(
            @PathVariable String contractId,
            @RequestParam String keyword) {
        boolean exists = versionService.existsVersionByChangesSummaryContaining(contractId, keyword);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ version theo changes summary thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

