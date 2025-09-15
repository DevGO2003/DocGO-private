package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.entity.ESignature;
import com.devgo2003.docgo.contract_service.service.ESignatureService;
import com.devgo2003.docgo.contract_service.dto.ESignatureCreateRequest;
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
@RequestMapping("/api/v1/contract-management-service/esignatures")
@Tag(name = "API Quáº£n lÃ½ Chá»¯ kÃ½ Ä‘iá»‡n tá»­", description = "CÃ¡c API Ä‘á»ƒ quáº£n lÃ½ chá»¯ kÃ½ Ä‘iá»‡n tá»­ trong há»‡ thá»‘ng DocGO")
public class ESignatureController {

    private final ESignatureService eSignatureService;
    private final HttpServletRequest request;

    public ESignatureController(ESignatureService eSignatureService, HttpServletRequest request) {
        this.eSignatureService = eSignatureService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Láº¥y danh sÃ¡ch táº¥t cáº£ chá»¯ kÃ½ Ä‘iá»‡n tá»­", 
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
        Loáº¡i: List<ESignature>
        MÃ´ táº£: Danh sÃ¡ch chá»¯ kÃ½ Ä‘iá»‡n tá»­
        
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
    public ResponseEntity<RestResponse<List<ESignature>>> getAllESignatures(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        List<ESignature> eSignatures = eSignatureService.getAllESignatures();
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ chá»¯ kÃ½ Ä‘iá»‡n tá»­ nÃ o.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch chá»¯ kÃ½ Ä‘iá»‡n tá»­ thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Láº¥y chi tiáº¿t chá»¯ kÃ½ Ä‘iá»‡n tá»­", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ”— id (báº¯t buá»™c, path)
        Loáº¡i: string
        MÃ´ táº£: ID cá»§a chá»¯ kÃ½ Ä‘iá»‡n tá»­ cáº§n láº¥y
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: ESignature
        MÃ´ táº£: ThÃ´ng tin chi tiáº¿t chá»¯ kÃ½ Ä‘iá»‡n tá»­
        
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
    public ResponseEntity<RestResponse<ESignature>> getESignature(@PathVariable String id) {
        Optional<ESignature> eSignature = eSignatureService.getESignatureById(id);
        
        if (eSignature.isEmpty()) {
            RestResponse<ESignature> response = RestResponse.<ESignature>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y chá»¯ kÃ½ Ä‘iá»‡n tá»­ vá»›i ID: " + id)
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y chi tiáº¿t chá»¯ kÃ½ Ä‘iá»‡n tá»­ thÃ nh cÃ´ng.")
            .data(eSignature.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Táº¡o chá»¯ kÃ½ Ä‘iá»‡n tá»­ má»›i", 
        description = """
        ðŸ”¹ Äáº§u vÃ o
        
        ðŸ“„ eSignature (báº¯t buá»™c, body)
        Loáº¡i: ESignatureCreateRequest
        MÃ´ táº£: ThÃ´ng tin chá»¯ kÃ½ Ä‘iá»‡n tá»­ cáº§n táº¡o (contractId, signerId, signerName, signerEmail, signatureType, signatureData)
        
        ðŸ”¹ Äáº§u ra
        
        ðŸ“ data
        Loáº¡i: ESignature
        MÃ´ táº£: ThÃ´ng tin chá»¯ kÃ½ Ä‘iá»‡n tá»­ Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng
        
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
    public ResponseEntity<RestResponse<ESignature>> createESignature(@RequestBody ESignatureCreateRequest request) {
        ESignature eSignature = eSignatureService.createESignature(request);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o chá»¯ kÃ½ Ä‘iá»‡n tá»­ thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/esignature")
    @Operation(summary = "Táº¡o e-signature má»›i", description = "Táº¡o e-signature má»›i cho contract")
    public ResponseEntity<RestResponse<ESignature>> createESignature(
            @PathVariable String contractId,
            @RequestParam String signerId,
            @RequestParam String signerName,
            @RequestParam String signerEmail,
            @RequestParam String signerRole,
            @RequestParam ESignature.SignatureType signatureType) {
        
        ESignature eSignature = eSignatureService.createESignature(contractId, signerId, signerName, signerEmail, signerRole, signatureType);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Táº¡o e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures")
    @Operation(summary = "Láº¥y danh sÃ¡ch e-signature", description = "Láº¥y táº¥t cáº£ e-signature cá»§a contract")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByContractId(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("KhÃ´ng cÃ³ e-signature nÃ o cho contract nÃ y.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/{id}")
    @Operation(summary = "Láº¥y e-signature theo ID", description = "Láº¥y chi tiáº¿t e-signature")
    public ResponseEntity<RestResponse<ESignature>> getESignatureById(@PathVariable String id) {
        Optional<ESignature> eSignature = eSignatureService.getESignatureById(id);
        
        if (eSignature.isEmpty()) {
            RestResponse<ESignature> response = RestResponse.<ESignature>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("KhÃ´ng tÃ¬m tháº¥y e-signature.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y e-signature thÃ nh cÃ´ng.")
            .data(eSignature.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/pending")
    @Operation(summary = "Láº¥y e-signature Ä‘ang pending", description = "Láº¥y danh sÃ¡ch e-signature Ä‘ang chá» kÃ½")
    public ResponseEntity<RestResponse<List<ESignature>>> getPendingSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getPendingSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘ang pending.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature pending thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/signed")
    @Operation(summary = "Láº¥y e-signature Ä‘Ã£ signed", description = "Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ kÃ½")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getSignedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘Ã£ signed.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature signed thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/declined")
    @Operation(summary = "Láº¥y e-signature Ä‘Ã£ declined", description = "Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ tá»« chá»‘i")
    public ResponseEntity<RestResponse<List<ESignature>>> getDeclinedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getDeclinedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘Ã£ declined.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature declined thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @GetMapping("/contracts/{contractId}/esignatures/verified")
    @Operation(summary = "Láº¥y e-signature Ä‘Ã£ verified", description = "Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ xÃ¡c thá»±c")
    public ResponseEntity<RestResponse<List<ESignature>>> getVerifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getVerifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘Ã£ verified.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature verified thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/required")
    @Operation(summary = "Láº¥y e-signature báº¯t buá»™c", description = "Láº¥y danh sÃ¡ch e-signature báº¯t buá»™c")
    public ResponseEntity<RestResponse<List<ESignature>>> getRequiredSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getRequiredSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature báº¯t buá»™c nÃ o.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature báº¯t buá»™c thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/optional")
    @Operation(summary = "Láº¥y e-signature tÃ¹y chá»n", description = "Láº¥y danh sÃ¡ch e-signature tÃ¹y chá»n")
    public ResponseEntity<RestResponse<List<ESignature>>> getOptionalSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getOptionalSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature tÃ¹y chá»n nÃ o.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature tÃ¹y chá»n thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/consented")
    @Operation(summary = "Láº¥y e-signature Ä‘Ã£ consent", description = "Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ Ä‘á»“ng Ã½")
    public ResponseEntity<RestResponse<List<ESignature>>> getConsentedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getConsentedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘Ã£ consent.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ consent thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/unconsented")
    @Operation(summary = "Láº¥y e-signature chÆ°a consent", description = "Láº¥y danh sÃ¡ch e-signature chÆ°a Ä‘á»“ng Ã½")
    public ResponseEntity<RestResponse<List<ESignature>>> getUnconsentedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getUnconsentedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o chÆ°a consent.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature chÆ°a consent thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/compliance-verified")
    @Operation(summary = "Láº¥y e-signature Ä‘Ã£ compliance verified", description = "Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ xÃ¡c thá»±c compliance")
    public ResponseEntity<RestResponse<List<ESignature>>> getComplianceVerifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getComplianceVerifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘Ã£ compliance verified.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ compliance verified thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/compliance-unverified")
    @Operation(summary = "Láº¥y e-signature chÆ°a compliance verified", description = "Láº¥y danh sÃ¡ch e-signature chÆ°a xÃ¡c thá»±c compliance")
    public ResponseEntity<RestResponse<List<ESignature>>> getComplianceUnverifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getComplianceUnverifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o chÆ°a compliance verified.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature chÆ°a compliance verified thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/signer/{signerId}")
    @Operation(summary = "Láº¥y e-signature theo signer ID", description = "Láº¥y danh sÃ¡ch e-signature cá»§a signer")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignerId(@PathVariable String signerId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignerId(signerId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o cá»§a signer nÃ y.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature cá»§a signer thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/signer/email/{signerEmail}")
    @Operation(summary = "Láº¥y e-signature theo signer email", description = "Láº¥y danh sÃ¡ch e-signature cá»§a signer email")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignerEmail(@PathVariable String signerEmail) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignerEmail(signerEmail);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o cá»§a signer email nÃ y.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature cá»§a signer email thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/type/{signatureType}")
    @Operation(summary = "Láº¥y e-signature theo signature type", description = "Láº¥y danh sÃ¡ch e-signature theo loáº¡i chá»¯ kÃ½")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignatureType(@PathVariable ESignature.SignatureType signatureType) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignatureType(signatureType);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o vá»›i signature type nÃ y.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature theo signature type thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/verification-method/{verificationMethod}")
    @Operation(summary = "Láº¥y e-signature theo verification method", description = "Láº¥y danh sÃ¡ch e-signature theo phÆ°Æ¡ng thá»©c xÃ¡c thá»±c")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByVerificationMethod(@PathVariable ESignature.VerificationMethod verificationMethod) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByVerificationMethod(verificationMethod);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o vá»›i verification method nÃ y.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature theo verification method thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/order-by-signature-order")
    @Operation(summary = "Láº¥y e-signature sáº¯p xáº¿p theo signature order", description = "Láº¥y danh sÃ¡ch e-signature sáº¯p xáº¿p theo thá»© tá»± kÃ½")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesOrderBySignatureOrder(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractIdOrderBySignatureOrder(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature sáº¯p xáº¿p theo signature order thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/order-by-signed-at")
    @Operation(summary = "Láº¥y e-signature sáº¯p xáº¿p theo thá»i gian kÃ½", description = "Láº¥y danh sÃ¡ch e-signature sáº¯p xáº¿p theo thá»i gian kÃ½")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesOrderBySignedAt(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractIdOrderBySignedAt(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature sáº¯p xáº¿p theo thá»i gian kÃ½ thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/signed-between")
    @Operation(summary = "Láº¥y e-signature theo thá»i gian kÃ½", description = "Láº¥y danh sÃ¡ch e-signature trong khoáº£ng thá»i gian kÃ½")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignedAtBetween(startDate, endDate);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o trong khoáº£ng thá»i gian kÃ½ nÃ y.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature theo thá»i gian kÃ½ thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/expired")
    @Operation(summary = "Láº¥y e-signature Ä‘Ã£ expired", description = "Láº¥y danh sÃ¡ch e-signature Ä‘Ã£ háº¿t háº¡n")
    public ResponseEntity<RestResponse<List<ESignature>>> getExpiredSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getExpiredSignatures(LocalDateTime.now());
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o Ä‘Ã£ expired.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature expired thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/expiring")
    @Operation(summary = "Láº¥y e-signature sáº¯p expired", description = "Láº¥y danh sÃ¡ch e-signature sáº¯p háº¿t háº¡n")
    public ResponseEntity<RestResponse<List<ESignature>>> getExpiringSignatures(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        List<ESignature> eSignatures = eSignatureService.getExpiringSignatures(dueDate);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o sáº¯p expired.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature expiring thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/high-verification-attempts")
    @Operation(summary = "Láº¥y e-signature cÃ³ verification attempts cao", description = "Láº¥y danh sÃ¡ch e-signature cÃ³ verification attempts cao")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignaturesWithHighVerificationAttempts(
            @PathVariable String contractId,
            @RequestParam Integer maxAttempts) {
        List<ESignature> eSignatures = eSignatureService.getSignaturesWithHighVerificationAttempts(maxAttempts);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o cÃ³ verification attempts cao.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature cÃ³ verification attempts cao thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/with-reminders")
    @Operation(summary = "Láº¥y e-signature cÃ³ reminders", description = "Láº¥y danh sÃ¡ch e-signature cÃ³ reminders")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignaturesWithReminders(
            @PathVariable String contractId,
            @RequestParam Integer reminderCount) {
        List<ESignature> eSignatures = eSignatureService.getSignaturesWithReminders(reminderCount);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("KhÃ´ng cÃ³ e-signature nÃ o cÃ³ reminders.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Láº¥y danh sÃ¡ch e-signature cÃ³ reminders thÃ nh cÃ´ng.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/sign")
    @Operation(summary = "KÃ½ e-signature", description = "KÃ½ e-signature")
    public ResponseEntity<RestResponse<ESignature>> signESignature(
            @PathVariable String id,
            @RequestParam String signatureData,
            @RequestParam String signatureImage,
            @RequestParam String ipAddress,
            @RequestParam String userAgent,
            @RequestBody Map<String, Object> deviceInfo) {
        ESignature eSignature = eSignatureService.signESignature(id, signatureData, signatureImage, ipAddress, userAgent, deviceInfo);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("KÃ½ e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/decline")
    @Operation(summary = "Tá»« chá»‘i e-signature", description = "Tá»« chá»‘i e-signature")
    public ResponseEntity<RestResponse<ESignature>> declineESignature(
            @PathVariable String id,
            @RequestParam String declineReason) {
        ESignature eSignature = eSignatureService.declineESignature(id, declineReason);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tá»« chá»‘i e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verify")
    @Operation(summary = "XÃ¡c thá»±c e-signature", description = "XÃ¡c thá»±c e-signature")
    public ResponseEntity<RestResponse<ESignature>> verifyESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.verifyESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ¡c thá»±c e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/fail-verification")
    @Operation(summary = "XÃ¡c thá»±c e-signature tháº¥t báº¡i", description = "XÃ¡c thá»±c e-signature tháº¥t báº¡i")
    public ResponseEntity<RestResponse<ESignature>> failVerificationESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.failVerificationESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ¡c thá»±c e-signature tháº¥t báº¡i thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/expire")
    @Operation(summary = "ÄÃ¡nh dáº¥u e-signature háº¿t háº¡n", description = "ÄÃ¡nh dáº¥u e-signature Ä‘Ã£ háº¿t háº¡n")
    public ResponseEntity<RestResponse<ESignature>> expireESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.expireESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("ÄÃ¡nh dáº¥u e-signature háº¿t háº¡n thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/cancel")
    @Operation(summary = "Há»§y e-signature", description = "Há»§y e-signature")
    public ResponseEntity<RestResponse<ESignature>> cancelESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.cancelESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Há»§y e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/increment-reminder")
    @Operation(summary = "TÄƒng reminder count", description = "TÄƒng sá»‘ láº§n nháº¯c nhá»Ÿ")
    public ResponseEntity<RestResponse<ESignature>> incrementReminderCount(@PathVariable String id) {
        ESignature eSignature = eSignatureService.incrementReminderCount(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("TÄƒng reminder count thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/give-consent")
    @Operation(summary = "Äá»“ng Ã½ e-signature", description = "Äá»“ng Ã½ e-signature")
    public ResponseEntity<RestResponse<ESignature>> giveLegalConsent(@PathVariable String id) {
        ESignature eSignature = eSignatureService.giveLegalConsent(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äá»“ng Ã½ e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verify-compliance")
    @Operation(summary = "XÃ¡c thá»±c compliance", description = "XÃ¡c thá»±c compliance")
    public ResponseEntity<RestResponse<ESignature>> verifyCompliance(
            @PathVariable String id,
            @RequestParam String verifiedBy) {
        ESignature eSignature = eSignatureService.verifyCompliance(id, verifiedBy);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ¡c thá»±c compliance thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/signature-order")
    @Operation(summary = "Cáº­p nháº­t signature order", description = "Cáº­p nháº­t thá»© tá»± kÃ½")
    public ResponseEntity<RestResponse<ESignature>> setSignatureOrder(
            @PathVariable String id,
            @RequestParam Integer signatureOrder) {
        ESignature eSignature = eSignatureService.setSignatureOrder(id, signatureOrder);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t signature order thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/required")
    @Operation(summary = "Cáº­p nháº­t isRequired", description = "Cáº­p nháº­t tráº¡ng thÃ¡i báº¯t buá»™c")
    public ResponseEntity<RestResponse<ESignature>> setIsRequired(
            @PathVariable String id,
            @RequestParam Boolean isRequired) {
        ESignature eSignature = eSignatureService.setIsRequired(id, isRequired);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t isRequired thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/expires-at")
    @Operation(summary = "Cáº­p nháº­t expires at", description = "Cáº­p nháº­t thá»i gian háº¿t háº¡n")
    public ResponseEntity<RestResponse<ESignature>> setExpiresAt(
            @PathVariable String id,
            @RequestParam LocalDateTime expiresAt) {
        ESignature eSignature = eSignatureService.setExpiresAt(id, expiresAt);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t expires at thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verification-method")
    @Operation(summary = "Cáº­p nháº­t verification method", description = "Cáº­p nháº­t phÆ°Æ¡ng thá»©c xÃ¡c thá»±c")
    public ResponseEntity<RestResponse<ESignature>> setVerificationMethod(
            @PathVariable String id,
            @RequestParam ESignature.VerificationMethod verificationMethod) {
        ESignature eSignature = eSignatureService.setVerificationMethod(id, verificationMethod);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t verification method thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verification-code")
    @Operation(summary = "Cáº­p nháº­t verification code", description = "Cáº­p nháº­t mÃ£ xÃ¡c thá»±c")
    public ResponseEntity<RestResponse<ESignature>> setVerificationCode(
            @PathVariable String id,
            @RequestParam String verificationCode) {
        ESignature eSignature = eSignatureService.setVerificationCode(id, verificationCode);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t verification code thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/certificate-data")
    @Operation(summary = "Cáº­p nháº­t certificate data", description = "Cáº­p nháº­t dá»¯ liá»‡u chá»©ng chá»‰")
    public ResponseEntity<RestResponse<ESignature>> setCertificateData(
            @PathVariable String id,
            @RequestParam String certificateData,
            @RequestParam String certificateIssuer,
            @RequestParam String certificateSerial,
            @RequestParam LocalDateTime validFrom,
            @RequestParam LocalDateTime validTo) {
        ESignature eSignature = eSignatureService.setCertificateData(id, certificateData, certificateIssuer, certificateSerial, validFrom, validTo);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t certificate data thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/location-info")
    @Operation(summary = "Cáº­p nháº­t location info", description = "Cáº­p nháº­t thÃ´ng tin vá»‹ trÃ­")
    public ResponseEntity<RestResponse<ESignature>> setLocationInfo(
            @PathVariable String id,
            @RequestBody Map<String, Object> locationInfo) {
        ESignature eSignature = eSignatureService.setLocationInfo(id, locationInfo);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t location info thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/audit-trail")
    @Operation(summary = "Cáº­p nháº­t audit trail", description = "Cáº­p nháº­t audit trail")
    public ResponseEntity<RestResponse<ESignature>> setAuditTrail(
            @PathVariable String id,
            @RequestParam String auditTrail) {
        ESignature eSignature = eSignatureService.setAuditTrail(id, auditTrail);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cáº­p nháº­t audit trail thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/esignatures/{id}")
    @Operation(summary = "XÃ³a e-signature", description = "Soft delete e-signature")
    public ResponseEntity<RestResponse<Void>> deleteESignature(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        eSignatureService.deleteESignature(id, deletedBy);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("XÃ³a e-signature thÃ nh cÃ´ng.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/restore")
    @Operation(summary = "KhÃ´i phá»¥c e-signature", description = "KhÃ´i phá»¥c e-signature Ä‘Ã£ xÃ³a")
    public ResponseEntity<RestResponse<ESignature>> restoreESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.restoreESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("KhÃ´i phá»¥c e-signature thÃ nh cÃ´ng.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count")
    @Operation(summary = "Äáº¿m sá»‘ e-signature", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature")
    public ResponseEntity<RestResponse<Long>> countESignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countESignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-by-status")
    @Operation(summary = "Äáº¿m sá»‘ e-signature theo status", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature theo status")
    public ResponseEntity<RestResponse<Long>> countESignaturesByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam ESignature.SignatureStatus status) {
        long count = eSignatureService.countESignaturesByContractIdAndStatus(contractId, status);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature theo status thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/signer/{signerId}/count")
    @Operation(summary = "Äáº¿m sá»‘ e-signature cá»§a signer", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature cá»§a signer")
    public ResponseEntity<RestResponse<Long>> countESignaturesBySignerId(@PathVariable String signerId) {
        long count = eSignatureService.countESignaturesBySignerId(signerId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature cá»§a signer thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-pending")
    @Operation(summary = "Äáº¿m sá»‘ e-signature pending", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘ang pending")
    public ResponseEntity<RestResponse<Long>> countPendingSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countPendingSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature pending thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-signed")
    @Operation(summary = "Äáº¿m sá»‘ e-signature signed", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘Ã£ signed")
    public ResponseEntity<RestResponse<Long>> countSignedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countSignedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature signed thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-declined")
    @Operation(summary = "Äáº¿m sá»‘ e-signature declined", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘Ã£ declined")
    public ResponseEntity<RestResponse<Long>> countDeclinedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countDeclinedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature declined thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-expired")
    @Operation(summary = "Äáº¿m sá»‘ e-signature expired", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘Ã£ expired")
    public ResponseEntity<RestResponse<Long>> countExpiredSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countExpiredSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature expired thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-verified")
    @Operation(summary = "Äáº¿m sá»‘ e-signature verified", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘Ã£ verified")
    public ResponseEntity<RestResponse<Long>> countVerifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countVerifiedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature verified thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-required")
    @Operation(summary = "Äáº¿m sá»‘ e-signature required", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature báº¯t buá»™c")
    public ResponseEntity<RestResponse<Long>> countRequiredSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countRequiredSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature required thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-optional")
    @Operation(summary = "Äáº¿m sá»‘ e-signature optional", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature tÃ¹y chá»n")
    public ResponseEntity<RestResponse<Long>> countOptionalSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countOptionalSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature optional thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-consented")
    @Operation(summary = "Äáº¿m sá»‘ e-signature consented", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘Ã£ consented")
    public ResponseEntity<RestResponse<Long>> countConsentedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countConsentedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature consented thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-unconsented")
    @Operation(summary = "Äáº¿m sá»‘ e-signature unconsented", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature chÆ°a consented")
    public ResponseEntity<RestResponse<Long>> countUnconsentedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countUnconsentedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature unconsented thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-compliance-verified")
    @Operation(summary = "Äáº¿m sá»‘ e-signature compliance verified", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature Ä‘Ã£ compliance verified")
    public ResponseEntity<RestResponse<Long>> countComplianceVerifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countComplianceVerifiedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature compliance verified thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-compliance-unverified")
    @Operation(summary = "Äáº¿m sá»‘ e-signature compliance unverified", description = "Äáº¿m sá»‘ lÆ°á»£ng e-signature chÆ°a compliance verified")
    public ResponseEntity<RestResponse<Long>> countComplianceUnverifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countComplianceUnverifiedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Äáº¿m sá»‘ e-signature compliance unverified thÃ nh cÃ´ng.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature", description = "Kiá»ƒm tra contract cÃ³ e-signature khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsESignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsESignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-pending")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature pending", description = "Kiá»ƒm tra contract cÃ³ e-signature pending khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsPendingSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsPendingSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature pending thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-signed")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature signed", description = "Kiá»ƒm tra contract cÃ³ e-signature signed khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsSignedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsSignedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature signed thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-declined")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature declined", description = "Kiá»ƒm tra contract cÃ³ e-signature declined khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsDeclinedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsDeclinedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature declined thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-expired")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature expired", description = "Kiá»ƒm tra contract cÃ³ e-signature expired khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsExpiredSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsExpiredSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature expired thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-verified")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature verified", description = "Kiá»ƒm tra contract cÃ³ e-signature verified khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsVerifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsVerifiedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature verified thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-required")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature required", description = "Kiá»ƒm tra contract cÃ³ e-signature required khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsRequiredSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsRequiredSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature required thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-optional")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature optional", description = "Kiá»ƒm tra contract cÃ³ e-signature optional khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsOptionalSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsOptionalSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature optional thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-consented")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature consented", description = "Kiá»ƒm tra contract cÃ³ e-signature consented khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsConsentedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsConsentedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature consented thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-unconsented")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature unconsented", description = "Kiá»ƒm tra contract cÃ³ e-signature unconsented khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsUnconsentedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsUnconsentedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature unconsented thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-compliance-verified")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature compliance verified", description = "Kiá»ƒm tra contract cÃ³ e-signature compliance verified khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsComplianceVerifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsComplianceVerifiedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature compliance verified thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-compliance-unverified")
    @Operation(summary = "Kiá»ƒm tra cÃ³ e-signature compliance unverified", description = "Kiá»ƒm tra contract cÃ³ e-signature compliance unverified khÃ´ng")
    public ResponseEntity<RestResponse<Boolean>> existsComplianceUnverifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsComplianceUnverifiedSignaturesByContractId(contractId);
        
                RestResponse<List<Version>> response = RestResponse.<List<Version>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiá»ƒm tra cÃ³ e-signature compliance unverified thÃ nh cÃ´ng.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}

