package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.service.ReportService;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contract-management-service/reports")
@Tag(name = "API Quản lý Báo cáo", description = "Các API để quản lý báo cáo trong hệ thống DocGO")
public class ReportController {

    private final ReportService reportService;
    private final HttpServletRequest request;

    public ReportController(ReportService reportService, HttpServletRequest request) {
        this.reportService = reportService;
        this.request = request;
    }

    @GetMapping
    @Operation(
        summary = "Lấy danh sách tất cả báo cáo", 
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
        Loại: List<Map<String, Object>>
        Mô tả: Danh sách báo cáo
        
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
    public ResponseEntity<RestResponse<Map<String, Object>>> getAllReports(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        Map<String, Object> reports = reportService.generateOverallReport();
        
        if (reports.isEmpty()) {
            RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có báo cáo nào.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Lấy danh sách báo cáo thành công.")
            .data(reports)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Báo cáo tổng hợp", description = "Tạo báo cáo tổng hợp cho tất cả contracts")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateOverallReport() {
        Map<String, Object> report = reportService.generateOverallReport();
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo tổng hợp thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/overview")
    @Operation(summary = "Báo cáo tổng quan contract", description = "Tạo báo cáo tổng quan cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateContractOverviewReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateContractOverviewReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo tổng quan contract thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/approval")
    @Operation(summary = "Báo cáo approval", description = "Tạo báo cáo approval cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateApprovalReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateApprovalReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo approval thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/version")
    @Operation(summary = "Báo cáo version", description = "Tạo báo cáo version cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateVersionReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateVersionReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo version thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/comment")
    @Operation(summary = "Báo cáo comment", description = "Tạo báo cáo comment cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateCommentReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateCommentReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo comment thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/esignature")
    @Operation(summary = "Báo cáo e-signature", description = "Tạo báo cáo e-signature cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateESignatureReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateESignatureReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo e-signature thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/reminder")
    @Operation(summary = "Báo cáo reminder", description = "Tạo báo cáo reminder cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateReminderReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateReminderReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo reminder thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/contracts/{contractId}/reports/audit-log")
    @Operation(summary = "Báo cáo audit log", description = "Tạo báo cáo audit log cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateAuditLogReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateAuditLogReport(contractId);
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Tạo báo cáo audit log thành công.")
            .data(report)
            .timestamp(ZonedDateTime.now())
            .requestId(UUID.randomUUID().toString())
            .path(request.getRequestURI())
            .build();
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
