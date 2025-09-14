package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.service.ReportService;
import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.common.util.ResponseBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contract-management-service")
@Tag(name = "Report Management", description = "API báo cáo và phân tích cho hợp đồng")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/reports/analytics")
    @Operation(summary = "Báo cáo tổng hợp", description = "Tạo báo cáo tổng hợp cho tất cả contracts")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateOverallReport() {
        Map<String, Object> report = reportService.generateOverallReport();
        
        return ResponseBuilder.success(report, "Tạo báo cáo tổng hợp thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/overview")
    @Operation(summary = "Báo cáo tổng quan contract", description = "Tạo báo cáo tổng quan cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateContractOverviewReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateContractOverviewReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo tổng quan contract thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/approval")
    @Operation(summary = "Báo cáo approval", description = "Tạo báo cáo approval cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateApprovalReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateApprovalReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo approval thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/version")
    @Operation(summary = "Báo cáo version", description = "Tạo báo cáo version cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateVersionReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateVersionReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo version thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/comment")
    @Operation(summary = "Báo cáo comment", description = "Tạo báo cáo comment cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateCommentReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateCommentReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo comment thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/esignature")
    @Operation(summary = "Báo cáo e-signature", description = "Tạo báo cáo e-signature cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateESignatureReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateESignatureReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo e-signature thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/reminder")
    @Operation(summary = "Báo cáo reminder", description = "Tạo báo cáo reminder cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateReminderReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateReminderReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo reminder thành công");
    }

    @GetMapping("/contracts/{contractId}/reports/audit-log")
    @Operation(summary = "Báo cáo audit log", description = "Tạo báo cáo audit log cho contract")
    public ResponseEntity<RestResponse<Map<String, Object>>> generateAuditLogReport(@PathVariable String contractId) {
        Map<String, Object> report = reportService.generateAuditLogReport(contractId);
        
        return ResponseBuilder.success(report, "Tạo báo cáo audit log thành công");
    }
}
