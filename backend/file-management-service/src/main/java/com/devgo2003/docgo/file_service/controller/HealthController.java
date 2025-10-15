package com.devgo2003.docgo.file_service.controller;

import com.devgo2003.docgo.file_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/file-management-service")
@Tag(name = "🏥 APIs Kiểm tra Hệ thống", description = "APIs kiểm tra và cấu hình hệ thống - Health check, cấu hình S3, kiểm tra kết nối")
public class HealthController {

    @GetMapping("/health")
    @Operation(
        summary = "Health check",
        description = """
        ## 📖 Mô tả
        API kiểm tra sức khỏe của File Management Service - health check endpoint.
        Trả về thông tin chi tiết về trạng thái service, phiên bản, và các thông số kỹ thuật.
        
        ## 🔹 Đầu vào
        
        Không có tham số đầu vào.
        
        ## 🔹 Đầu ra
        
        📄 **data** (object)
        - **Mô tả**: Thông tin chi tiết về trạng thái service
        - **Bao gồm**:
          - `status`: Trạng thái service ("UP")
          - `service`: Tên service ("File Management Service")
          - `version`: Phiên bản service ("1.0.0")
          - `timestamp`: Thời gian kiểm tra
        
        📊 **apiVersion** (string)
        - **Mô tả**: Phiên bản API hiện tại
        - **Giá trị**: "v1"
        
        🔢 **statusCode** (integer)
        - **Mô tả**: Mã trạng thái HTTP (200: OK)
        - **Giá trị**: 200 (thành công)
        
        📋 **shortMessage** (string)
        - **Mô tả**: Thông báo ngắn gọn về kết quả
        - **Giá trị**: "Success"
        
        📖 **description** (string)
        - **Mô tả**: Mô tả chi tiết về kết quả kiểm tra
        - **Ví dụ**: "Service đang hoạt động bình thường"
        """
    )
    public ResponseEntity<RestResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("service", "Document Management Service");
        healthData.put("version", "1.0.0");
        healthData.put("timestamp", LocalDateTime.now().toString());
        
        RestResponse<Map<String, Object>> response = RestResponse.<Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Service đang hoạt động bình thường")
            .data(healthData)
            .build();
            
        return ResponseEntity.ok(response);
    }
}