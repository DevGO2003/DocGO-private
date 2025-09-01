package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.script.ManualTestDataGenerator;
import com.devgo2003.docgo.contract_service.service.IContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller để quản lý dữ liệu test
 * Chỉ sử dụng trong môi trường development và test
 */
@RestController
@RequestMapping("/api/v1/contract-management-service/test")
@Tag(name = "Test Data Management", description = "Quản lý dữ liệu test cho Contract Service")
public class TestDataController {

    @Autowired
    private ManualTestDataGenerator testDataGenerator;

    @Autowired
    private IContractService contractService;

    @PostMapping("/generate-data")
    @Operation(summary = "Tạo dữ liệu test mới", description = "Tạo 5 hợp đồng test mẫu để test getAll")
    public ResponseEntity<Map<String, Object>> generateTestData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            testDataGenerator.generateTestData();
            response.put("success", true);
            response.put("message", "Đã tạo thành công 5 hợp đồng test");
            response.put("data", "Có thể gọi GET /api/v1/contract-management-service/contracts để xem kết quả");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tạo dữ liệu test: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/generate-data-if-empty")
    @Operation(summary = "Tạo dữ liệu test nếu chưa có", description = "Chỉ tạo dữ liệu test nếu database còn trống")
    public ResponseEntity<Map<String, Object>> generateTestDataIfEmpty() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            testDataGenerator.generateTestDataIfEmpty();
            response.put("success", true);
            response.put("message", "Đã kiểm tra và tạo dữ liệu test nếu cần");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/clear-data")
    @Operation(summary = "Xóa tất cả dữ liệu test", description = "Xóa tất cả hợp đồng trong database")
    public ResponseEntity<Map<String, Object>> clearTestData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            testDataGenerator.clearTestData();
            response.put("success", true);
            response.put("message", "Đã xóa tất cả dữ liệu test");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi xóa dữ liệu: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Xem thống kê dữ liệu", description = "Hiển thị thống kê về dữ liệu hiện tại")
    public ResponseEntity<Map<String, Object>> getDataStats() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            testDataGenerator.showDataStats();
            response.put("success", true);
            response.put("message", "Đã hiển thị thống kê dữ liệu trong console");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/test-getall")
    @Operation(summary = "Test getAll API", description = "Test trực tiếp API getAll để xem kết quả")
    public ResponseEntity<Map<String, Object>> testGetAll() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Gọi service để lấy tất cả hợp đồng với pagination
            var contractsPage = contractService.getAllContractsWithDetailFormat(0, 10, null, null, false);
            
            response.put("success", true);
            response.put("message", "Test getAll thành công");
            response.put("totalContracts", contractsPage.getTotalElements());
            response.put("totalPages", contractsPage.getTotalPages());
            response.put("currentPage", contractsPage.getNumber());
            response.put("pageSize", contractsPage.getSize());
            response.put("contracts", contractsPage.getContent());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi test getAll: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
