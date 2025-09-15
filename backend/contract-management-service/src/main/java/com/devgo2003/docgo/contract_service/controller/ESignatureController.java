package com.devgo2003.docgo.contract_service.controller;
// encoding: utf-8

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
@Tag(name = "API Quản lý chữ ký điện tử", description = "Các API để quản lý chữ ký điện tử trong hệ thống DocGO")
public class ESignatureController {

    private final ESignatureService eSignatureService;
    private final HttpServletRequest request;

    public ESignatureController(ESignatureService eSignatureService, HttpServletRequest request) {
        this.eSignatureService = eSignatureService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Lấy danh sách chữ ký điện tử",
        description = "Hỗ trợ query phân trang: pageNumber, pageSize, sortBy, sortDirection, searchTerm, includeDeleted"
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
                .description("Không có chữ ký điện tử nào.")
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
            .description("Lấy danh sách chữ ký điện tử thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Lấy chi tiết chữ ký điện tử", 
        description = """
        🔹 Đầu vào
        
        🔸 id (bắt buộc, path)
        Loại: string
        mô tả: ID của chữ ký điện tử cần lấy
        
        🔹 Đầu ra
        
        🔸 data
        Loại: ESignature
        mô tả: Thông tin chi tiết chữ ký điện tử
        
        🔸 apiVersion
        Loại: string
        mô tả: Phiên bản API (v1)
        
        🔸 statusCode
        Loại: integer
        mô tả: mã trạng thái HTTP (200: OK, 404: Not Found)
        
        🔸 shortMessage
        Loại: string
        mô tả: Thông báo ngắn gọn về kết quả
        
        🔸 description
        Loại: string
        mô tả: mô tả chi tiết về kết quả xử lý
        
        🔸 timestamp
        Loại: string
        mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔸 requestId
        Loại: string
        mô tả: ID duy nhất của request
        
        🔸 path
        Loại: string
        mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<ESignature>> getESignature(@PathVariable String id) {
        Optional<ESignature> eSignature = eSignatureService.getESignatureById(id);
        
        if (eSignature.isEmpty()) {
            RestResponse<ESignature> response = RestResponse.<ESignature>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy chữ ký điện tử với ID: " + id)
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
            .description("Lấy chi tiết chữ ký điện tử thành công.")
            .data(eSignature.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @Operation(
        summary = "Tạo chữ ký điện tử mới", 
        description = """
        🔹 Đầu vào
        
        🔸 eSignature (bắt buộc, body)
        Loại: ESignatureCreateRequest
        mô tả: Thông tin chữ ký điện tử cần tạo (contractId, signerId, signerName, signerEmail, signatureType, signatureData)
        
        🔹 Đầu ra
        
        🔸 data
        Loại: ESignature
        mô tả: Thông tin chữ ký điện tử đã được tạo thành công
        
        🔸 apiVersion
        Loại: string
        mô tả: Phiên bản API (v1)
        
        🔸 statusCode
        Loại: integer
        mô tả: mã trạng thái HTTP (201: Created)
        
        🔸 shortMessage
        Loại: string
        mô tả: Thông báo ngắn gọn về kết quả
        
        🔸 description
        Loại: string
        mô tả: mô tả chi tiết về kết quả xử lý
        
        🔸 timestamp
        Loại: string
        mô tả: Thời điểm xử lý request (ISO-8601)
        
        🔸 requestId
        Loại: string
        mô tả: ID duy nhất của request
        
        🔸 path
        Loại: string
        mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<ESignature>> createESignature(@RequestBody ESignatureCreateRequest request) {
        ESignature eSignature = eSignatureService.createESignature(request);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(201)
            .shortMessage("Created")
            .description("Tạo chữ ký điện tử thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(this.request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/contracts/{contractId}/esignature")
    @Operation(summary = "Tạo e-signature mới", description = "Tạo e-signature mới cho contract")
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
            .description("Tạo e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures")
    @Operation(summary = "Lấy danh sách e-signature", description = "Lấy tất cả e-signature của contract")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByContractId(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có e-signature nào cho contract này.")
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
            .description("Lấy danh sách e-signature thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/{id}")
    @Operation(summary = "Lấy e-signature theo ID", description = "Lấy chi tiết e-signature")
    public ResponseEntity<RestResponse<ESignature>> getESignatureById(@PathVariable String id) {
        Optional<ESignature> eSignature = eSignatureService.getESignatureById(id);
        
        if (eSignature.isEmpty()) {
            RestResponse<ESignature> response = RestResponse.<ESignature>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy e-signature.")
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
            .description("Lấy e-signature thành công.")
            .data(eSignature.get())
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/pending")
    @Operation(summary = "Lấy e-signature đang pending", description = "Lấy danh sách e-signature đang chờ ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getPendingSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getPendingSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đang pending.")
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
            .description("Lấy danh sách e-signature pending thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/signed")
    @Operation(summary = "Lấy e-signature đã signed", description = "Lấy danh sách e-signature đã ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getSignedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đã signed.")
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
            .description("Lấy danh sách e-signature signed thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/declined")
    @Operation(summary = "Lấy e-signature đã declined", description = "Lấy danh sách e-signature đã từ chối")
    public ResponseEntity<RestResponse<List<ESignature>>> getDeclinedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getDeclinedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đã declined.")
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
            .description("Lấy danh sách e-signature declined thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @GetMapping("/contracts/{contractId}/esignatures/verified")
    @Operation(summary = "Lấy e-signature đã verified", description = "Lấy danh sách e-signature đã xác thực")
    public ResponseEntity<RestResponse<List<ESignature>>> getVerifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getVerifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đã verified.")
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
            .description("Lấy danh sách e-signature verified thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/required")
    @Operation(summary = "Lấy e-signature bắt buộc", description = "Lấy danh sách e-signature bắt buộc")
    public ResponseEntity<RestResponse<List<ESignature>>> getRequiredSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getRequiredSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature bắt buộc nào.")
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
            .description("Lấy danh sách e-signature bắt buộc thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/optional")
    @Operation(summary = "Lấy e-signature tùy chọn", description = "Lấy danh sách e-signature tùy chọn")
    public ResponseEntity<RestResponse<List<ESignature>>> getOptionalSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getOptionalSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature tùy chọn nào.")
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
            .description("Lấy danh sách e-signature tùy chọn thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/consented")
    @Operation(summary = "Lấy e-signature đã consent", description = "Lấy danh sách e-signature đã đồng ý")
    public ResponseEntity<RestResponse<List<ESignature>>> getConsentedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getConsentedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
            RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đã consent.")
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
            .description("Lấy danh sách e-signature đã consent thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/unconsented")
    @Operation(summary = "Lấy e-signature chưa consent", description = "Lấy danh sách e-signature chưa đồng ý")
    public ResponseEntity<RestResponse<List<ESignature>>> getUnconsentedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getUnconsentedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào chưa consent.")
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
            .description("Lấy danh sách e-signature chưa consent thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/compliance-verified")
    @Operation(summary = "Lấy e-signature đã compliance verified", description = "Lấy danh sách e-signature đã xác thực compliance")
    public ResponseEntity<RestResponse<List<ESignature>>> getComplianceVerifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getComplianceVerifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đã compliance verified.")
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
            .description("Lấy danh sách e-signature đã compliance verified thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/compliance-unverified")
    @Operation(summary = "Lấy e-signature chưa compliance verified", description = "Lấy danh sách e-signature chưa xác thực compliance")
    public ResponseEntity<RestResponse<List<ESignature>>> getComplianceUnverifiedSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getComplianceUnverifiedSignaturesByContractId(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào chưa compliance verified.")
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
            .description("Lấy danh sách e-signature chưa compliance verified thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/signer/{signerId}")
    @Operation(summary = "Lấy e-signature theo signer ID", description = "Lấy danh sách e-signature của signer")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignerId(@PathVariable String signerId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignerId(signerId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào của signer này.")
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
            .description("Lấy danh sách e-signature của signer thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/signer/email/{signerEmail}")
    @Operation(summary = "Lấy e-signature theo signer email", description = "Lấy danh sách e-signature của signer email")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignerEmail(@PathVariable String signerEmail) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignerEmail(signerEmail);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào của signer email này.")
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
            .description("Lấy danh sách e-signature của signer email thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/type/{signatureType}")
    @Operation(summary = "Lấy e-signature theo signature type", description = "Lấy danh sách e-signature theo loại chữ ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignatureType(@PathVariable ESignature.SignatureType signatureType) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignatureType(signatureType);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào với signature type này.")
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
            .description("Lấy danh sách e-signature theo signature type thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/verification-method/{verificationMethod}")
    @Operation(summary = "Lấy e-signature theo verification method", description = "Lấy danh sách e-signature theo phương thức xác thực")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesByVerificationMethod(@PathVariable ESignature.VerificationMethod verificationMethod) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByVerificationMethod(verificationMethod);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào với verification method này.")
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
            .description("Lấy danh sách e-signature theo verification method thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/order-by-signature-order")
    @Operation(summary = "Lấy e-signature sắp xếp theo signature order", description = "Lấy danh sách e-signature sắp xếp theo thứ tự ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesOrderBySignatureOrder(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractIdOrderBySignatureOrder(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào.")
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
            .description("Lấy danh sách e-signature sắp xếp theo signature order thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/order-by-signed-at")
    @Operation(summary = "Lấy e-signature sắp xếp theo thời gian ký", description = "Lấy danh sách e-signature sắp xếp theo thời gian ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesOrderBySignedAt(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesByContractIdOrderBySignedAt(contractId);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào.")
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
            .description("Lấy danh sách e-signature sắp xếp theo thời gian ký thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/signed-between")
    @Operation(summary = "Lấy e-signature theo thời gian ký", description = "Lấy danh sách e-signature trong khoảng thời gian ký")
    public ResponseEntity<RestResponse<List<ESignature>>> getESignaturesBySignedAtBetween(
            @PathVariable String contractId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<ESignature> eSignatures = eSignatureService.getESignaturesBySignedAtBetween(startDate, endDate);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào trong khoảng thời gian ký này.")
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
            .description("Lấy danh sách e-signature theo thời gian ký thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/expired")
    @Operation(summary = "Lấy e-signature đã expired", description = "Lấy danh sách e-signature đã hết hạn")
    public ResponseEntity<RestResponse<List<ESignature>>> getExpiredSignatures(@PathVariable String contractId) {
        List<ESignature> eSignatures = eSignatureService.getExpiredSignatures(LocalDateTime.now());
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào đã expired.")
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
            .description("Lấy danh sách e-signature expired thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/expiring")
    @Operation(summary = "Lấy e-signature sắp expired", description = "Lấy danh sách e-signature sắp hết hạn")
    public ResponseEntity<RestResponse<List<ESignature>>> getExpiringSignatures(
            @PathVariable String contractId,
            @RequestParam LocalDateTime dueDate) {
        List<ESignature> eSignatures = eSignatureService.getExpiringSignatures(dueDate);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào sắp expired.")
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
            .description("Lấy danh sách e-signature expiring thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/high-verification-attempts")
    @Operation(summary = "Lấy e-signature có verification attempts cao", description = "Lấy danh sách e-signature có verification attempts cao")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignaturesWithHighVerificationAttempts(
            @PathVariable String contractId,
            @RequestParam Integer maxAttempts) {
        List<ESignature> eSignatures = eSignatureService.getSignaturesWithHighVerificationAttempts(maxAttempts);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào có verification attempts cao.")
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
            .description("Lấy danh sách e-signature có verification attempts cao thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/with-reminders")
    @Operation(summary = "Lấy e-signature có reminders", description = "Lấy danh sách e-signature có reminders")
    public ResponseEntity<RestResponse<List<ESignature>>> getSignaturesWithReminders(
            @PathVariable String contractId,
            @RequestParam Integer reminderCount) {
        List<ESignature> eSignatures = eSignatureService.getSignaturesWithReminders(reminderCount);
        
        if (eSignatures.isEmpty()) {
                    RestResponse<List<ESignature>> response = RestResponse.<List<ESignature>>builder()
            .apiVersion("v1")
            .statusCode(204)
            .shortMessage("No Content")
            .description("Không có e-signature nào có reminders.")
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
            .description("Lấy danh sách e-signature có reminders thành công.")
            .data(eSignatures)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/sign")
    @Operation(summary = "Ký e-signature", description = "Ký e-signature")
    public ResponseEntity<RestResponse<ESignature>> signESignature(
            @PathVariable String id,
            @RequestParam String signatureData,
            @RequestParam String signatureImage,
            @RequestParam String ipAddress,
            @RequestParam String useragent,
            @RequestBody Map<String, Object> deviceInfo) {
        ESignature eSignature = eSignatureService.signESignature(id, signatureData, signatureImage, ipAddress, useragent, deviceInfo);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Ký e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/decline")
    @Operation(summary = "Từ chối e-signature", description = "Từ chối e-signature")
    public ResponseEntity<RestResponse<ESignature>> declineESignature(
            @PathVariable String id,
            @RequestParam String declineReason) {
        ESignature eSignature = eSignatureService.declineESignature(id, declineReason);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Từ chối e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verify")
    @Operation(summary = "Xác thực e-signature", description = "Xác thực e-signature")
    public ResponseEntity<RestResponse<ESignature>> verifyESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.verifyESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Xác thực e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/fail-verification")
    @Operation(summary = "Xác thực e-signature thất bại", description = "Xác thực e-signature thất bại")
    public ResponseEntity<RestResponse<ESignature>> failVerificationESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.failVerificationESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Xác thực e-signature thất bại thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/expire")
    @Operation(summary = "Đánh dấu e-signature hết hạn", description = "Đánh dấu e-signature đã hết hạn")
    public ResponseEntity<RestResponse<ESignature>> expireESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.expireESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đánh dấu e-signature hết hạn thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/cancel")
    @Operation(summary = "Hủy e-signature", description = "Hủy e-signature")
    public ResponseEntity<RestResponse<ESignature>> cancelESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.cancelESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Hủy e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/increment-reminder")
    @Operation(summary = "Tăng reminder count", description = "Tăng số lần nhắc nhở")
    public ResponseEntity<RestResponse<ESignature>> incrementReminderCount(@PathVariable String id) {
        ESignature eSignature = eSignatureService.incrementReminderCount(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tăng reminder count thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/give-consent")
    @Operation(summary = "Đồng ý e-signature", description = "Đồng ý e-signature")
    public ResponseEntity<RestResponse<ESignature>> giveLegalConsent(@PathVariable String id) {
        ESignature eSignature = eSignatureService.giveLegalConsent(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đồng ý e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verify-compliance")
    @Operation(summary = "Xác thực compliance", description = "Xác thực compliance")
    public ResponseEntity<RestResponse<ESignature>> verifyCompliance(
            @PathVariable String id,
            @RequestParam String verifiedBy) {
        ESignature eSignature = eSignatureService.verifyCompliance(id, verifiedBy);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Xác thực compliance thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/signature-order")
    @Operation(summary = "Cập nhật signature order", description = "Cập nhật thứ tự ký")
    public ResponseEntity<RestResponse<ESignature>> setSignatureOrder(
            @PathVariable String id,
            @RequestParam Integer signatureOrder) {
        ESignature eSignature = eSignatureService.setSignatureOrder(id, signatureOrder);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật signature order thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/required")
    @Operation(summary = "Cập nhật isRequired", description = "Cập nhật trạng thái bắt buộc")
    public ResponseEntity<RestResponse<ESignature>> setIsRequired(
            @PathVariable String id,
            @RequestParam Boolean isRequired) {
        ESignature eSignature = eSignatureService.setIsRequired(id, isRequired);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật isRequired thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/expires-at")
    @Operation(summary = "Cập nhật expires at", description = "Cập nhật thời gian hết hạn")
    public ResponseEntity<RestResponse<ESignature>> setExpiresAt(
            @PathVariable String id,
            @RequestParam LocalDateTime expiresAt) {
        ESignature eSignature = eSignatureService.setExpiresAt(id, expiresAt);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật expires at thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verification-method")
    @Operation(summary = "Cập nhật verification method", description = "Cập nhật phương thức xác thực")
    public ResponseEntity<RestResponse<ESignature>> setVerificationMethod(
            @PathVariable String id,
            @RequestParam ESignature.VerificationMethod verificationMethod) {
        ESignature eSignature = eSignatureService.setVerificationMethod(id, verificationMethod);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật verification method thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/verification-code")
    @Operation(summary = "Cập nhật verification code", description = "Cập nhật mã xác thực")
    public ResponseEntity<RestResponse<ESignature>> setVerificationCode(
            @PathVariable String id,
            @RequestParam String verificationCode) {
        ESignature eSignature = eSignatureService.setVerificationCode(id, verificationCode);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật verification code thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/certificate-data")
    @Operation(summary = "Cập nhật certificate data", description = "Cập nhật dữ liệu chứng chỉ")
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
            .description("Cập nhật certificate data thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/location-info")
    @Operation(summary = "Cập nhật location info", description = "Cập nhật thông tin vị trí")
    public ResponseEntity<RestResponse<ESignature>> setLocationInfo(
            @PathVariable String id,
            @RequestBody Map<String, Object> locationInfo) {
        ESignature eSignature = eSignatureService.setLocationInfo(id, locationInfo);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật location info thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/audit-trail")
    @Operation(summary = "Cập nhật audit trail", description = "Cập nhật audit trail")
    public ResponseEntity<RestResponse<ESignature>> setAuditTrail(
            @PathVariable String id,
            @RequestParam String auditTrail) {
        ESignature eSignature = eSignatureService.setAuditTrail(id, auditTrail);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Cập nhật audit trail thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/esignatures/{id}")
    @Operation(summary = "Xóa e-signature", description = "Soft delete e-signature")
    public ResponseEntity<RestResponse<Void>> deleteESignature(
            @PathVariable String id,
            @RequestParam String deletedBy) {
        eSignatureService.deleteESignature(id, deletedBy);
        
                RestResponse<Void> response = RestResponse.<Void>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Xóa e-signature thành công.")
            .data(null)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/esignatures/{id}/restore")
    @Operation(summary = "Khôi phục e-signature", description = "Khôi phục e-signature đã xóa")
    public ResponseEntity<RestResponse<ESignature>> restoreESignature(@PathVariable String id) {
        ESignature eSignature = eSignatureService.restoreESignature(id);
        
        RestResponse<ESignature> response = RestResponse.<ESignature>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Khôi phục e-signature thành công.")
            .data(eSignature)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count")
    @Operation(summary = "Đếm số e-signature", description = "Đếm số lượng e-signature")
    public ResponseEntity<RestResponse<Long>> countESignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countESignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-by-status")
    @Operation(summary = "Đếm số e-signature theo status", description = "Đếm số lượng e-signature theo status")
    public ResponseEntity<RestResponse<Long>> countESignaturesByContractIdAndStatus(
            @PathVariable String contractId,
            @RequestParam ESignature.SignatureStatus status) {
        long count = eSignatureService.countESignaturesByContractIdAndStatus(contractId, status);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature theo status thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/esignatures/signer/{signerId}/count")
    @Operation(summary = "Đếm số e-signature của signer", description = "Đếm số lượng e-signature của signer")
    public ResponseEntity<RestResponse<Long>> countESignaturesBySignerId(@PathVariable String signerId) {
        long count = eSignatureService.countESignaturesBySignerId(signerId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature của signer thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-pending")
    @Operation(summary = "Đếm số e-signature pending", description = "Đếm số lượng e-signature đang pending")
    public ResponseEntity<RestResponse<Long>> countPendingSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countPendingSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature pending thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-signed")
    @Operation(summary = "Đếm số e-signature signed", description = "Đếm số lượng e-signature đã signed")
    public ResponseEntity<RestResponse<Long>> countSignedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countSignedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature signed thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-declined")
    @Operation(summary = "Đếm số e-signature declined", description = "Đếm số lượng e-signature đã declined")
    public ResponseEntity<RestResponse<Long>> countDeclinedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countDeclinedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature declined thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-expired")
    @Operation(summary = "Đếm số e-signature expired", description = "Đếm số lượng e-signature đã expired")
    public ResponseEntity<RestResponse<Long>> countExpiredSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countExpiredSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature expired thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-verified")
    @Operation(summary = "Đếm số e-signature verified", description = "Đếm số lượng e-signature đã verified")
    public ResponseEntity<RestResponse<Long>> countVerifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countVerifiedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature verified thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-required")
    @Operation(summary = "Đếm số e-signature required", description = "Đếm số lượng e-signature bắt buộc")
    public ResponseEntity<RestResponse<Long>> countRequiredSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countRequiredSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature required thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-optional")
    @Operation(summary = "Đếm số e-signature optional", description = "Đếm số lượng e-signature tùy chọn")
    public ResponseEntity<RestResponse<Long>> countOptionalSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countOptionalSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature optional thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-consented")
    @Operation(summary = "Đếm số e-signature consented", description = "Đếm số lượng e-signature đã consented")
    public ResponseEntity<RestResponse<Long>> countConsentedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countConsentedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature consented thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-unconsented")
    @Operation(summary = "Đếm số e-signature unconsented", description = "Đếm số lượng e-signature chưa consented")
    public ResponseEntity<RestResponse<Long>> countUnconsentedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countUnconsentedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature unconsented thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-compliance-verified")
    @Operation(summary = "Đếm số e-signature compliance verified", description = "Đếm số lượng e-signature đã compliance verified")
    public ResponseEntity<RestResponse<Long>> countComplianceVerifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countComplianceVerifiedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature compliance verified thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/count-compliance-unverified")
    @Operation(summary = "Đếm số e-signature compliance unverified", description = "Đếm số lượng e-signature chưa compliance verified")
    public ResponseEntity<RestResponse<Long>> countComplianceUnverifiedSignaturesByContractId(@PathVariable String contractId) {
        long count = eSignatureService.countComplianceUnverifiedSignaturesByContractId(contractId);
        
                RestResponse<Long> response = RestResponse.<Long>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Đếm số e-signature compliance unverified thành công.")
            .data(count)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists")
    @Operation(summary = "Kiểm tra có e-signature", description = "Kiểm tra contract có e-signature không")
    public ResponseEntity<RestResponse<Boolean>> existsESignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsESignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-pending")
    @Operation(summary = "Kiểm tra có e-signature pending", description = "Kiểm tra contract có e-signature pending không")
    public ResponseEntity<RestResponse<Boolean>> existsPendingSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsPendingSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature pending thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-signed")
    @Operation(summary = "Kiểm tra có e-signature signed", description = "Kiểm tra contract có e-signature signed không")
    public ResponseEntity<RestResponse<Boolean>> existsSignedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsSignedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature signed thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-declined")
    @Operation(summary = "Kiểm tra có e-signature declined", description = "Kiểm tra contract có e-signature declined không")
    public ResponseEntity<RestResponse<Boolean>> existsDeclinedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsDeclinedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature declined thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-expired")
    @Operation(summary = "Kiểm tra có e-signature expired", description = "Kiểm tra contract có e-signature expired không")
    public ResponseEntity<RestResponse<Boolean>> existsExpiredSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsExpiredSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature expired thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-verified")
    @Operation(summary = "Kiểm tra có e-signature verified", description = "Kiểm tra contract có e-signature verified không")
    public ResponseEntity<RestResponse<Boolean>> existsVerifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsVerifiedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature verified thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-required")
    @Operation(summary = "Kiểm tra có e-signature required", description = "Kiểm tra contract có e-signature required không")
    public ResponseEntity<RestResponse<Boolean>> existsRequiredSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsRequiredSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature required thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-optional")
    @Operation(summary = "Kiểm tra có e-signature optional", description = "Kiểm tra contract có e-signature optional không")
    public ResponseEntity<RestResponse<Boolean>> existsOptionalSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsOptionalSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature optional thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-consented")
    @Operation(summary = "Kiểm tra có e-signature consented", description = "Kiểm tra contract có e-signature consented không")
    public ResponseEntity<RestResponse<Boolean>> existsConsentedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsConsentedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature consented thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-unconsented")
    @Operation(summary = "Kiểm tra có e-signature unconsented", description = "Kiểm tra contract có e-signature unconsented không")
    public ResponseEntity<RestResponse<Boolean>> existsUnconsentedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsUnconsentedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature unconsented thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-compliance-verified")
    @Operation(summary = "Kiểm tra có e-signature compliance verified", description = "Kiểm tra contract có e-signature compliance verified không")
    public ResponseEntity<RestResponse<Boolean>> existsComplianceVerifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsComplianceVerifiedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature compliance verified thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/esignatures/exists-compliance-unverified")
    @Operation(summary = "Kiểm tra có e-signature compliance unverified", description = "Kiểm tra contract có e-signature compliance unverified không")
    public ResponseEntity<RestResponse<Boolean>> existsComplianceUnverifiedSignaturesByContractId(@PathVariable String contractId) {
        boolean exists = eSignatureService.existsComplianceUnverifiedSignaturesByContractId(contractId);
        
                RestResponse<Boolean> response = RestResponse.<Boolean>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Kiểm tra có e-signature compliance unverified thành công.")
            .data(exists)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}