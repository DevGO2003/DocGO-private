package com.devgo2003.docgo.document_service.controller;

import com.devgo2003.docgo.document_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.document_service.common.response.RestResponse;
import com.devgo2003.docgo.document_service.entity.Version;
import com.devgo2003.docgo.document_service.service.VersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho Version Query APIs
 * Cung cấp các API query và search cho versions
 */
@RestController
@RequestMapping("/api/v1/document-management-service/v1/versions/query")
@Tag(name = "Version Query Management", description = "API tìm kiếm và truy vấn phiên bản")
@RequiredArgsConstructor
@Slf4j
public class VersionQueryController {

    private final VersionService versionService;

    @GetMapping("/search")
    @Operation(
        summary = "Tìm kiếm phiên bản",
        description = """
        ## 📖 Mô tả
        Tìm kiếm phiên bản theo từ khóa với phân trang và sắp xếp.

        ## 🔹 Đầu vào

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

        📄 searchTerm (bắt buộc, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm

        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Bao gồm phiên bản đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Version>
        Mô tả: Danh sách phiên bản tìm được

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

        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu

        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu

        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """,
        responses = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully"),
            @ApiResponse(responseCode = "204", description = "No versions found"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Version>>> searchVersions(
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection,
            
            @Parameter(description = "Từ khóa tìm kiếm", required = true) 
            @RequestParam String searchTerm,
            
            @Parameter(description = "Bao gồm phiên bản đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Searching versions with term: {}, page: {}, size: {}", searchTerm, pageNumber, pageSize);
        
        // TODO: Implement searchVersions in service
        Page<Version> versions = versionService.getAllVersions(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        if (versions.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Version>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không tìm thấy phiên bản nào")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Version> paginatedResponse = PaginatedResponse.<Version>builder()
            .content(versions.getContent())
            .pageNumber(versions.getNumber())
            .pageSize(versions.getSize())
            .totalElements(versions.getTotalElements())
            .totalPages(versions.getTotalPages())
            .first(versions.isFirst())
            .last(versions.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Version>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tìm kiếm phiên bản thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-contract/{contractId}")
    @Operation(
        summary = "Lấy phiên bản theo hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy danh sách phiên bản theo ID hợp đồng cụ thể.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng

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

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<Version>
        Mô tả: Danh sách phiên bản theo hợp đồng

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

        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu

        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu

        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """,
        responses = {
            @ApiResponse(responseCode = "200", description = "Versions retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No versions found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<Version>>> getVersionsByContract(
            @Parameter(description = "ID của hợp đồng", required = true)
            @PathVariable String contractId,
            
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int pageNumber,
            
            @Parameter(description = "Kích thước trang (mặc định: 10)") 
            @RequestParam(defaultValue = "10") int pageSize,
            
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting versions by contract: {}, page: {}, size: {}", contractId, pageNumber, pageSize);
        
        // TODO: Implement getVersionsByContract in service
        Page<Version> versions = versionService.getAllVersions(pageNumber, pageSize, sortBy, sortDirection, false);
        
        if (versions.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<Version>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có phiên bản nào cho hợp đồng này")
                .data(null)
                .build());
        }
        
        PaginatedResponse<Version> paginatedResponse = PaginatedResponse.<Version>builder()
            .content(versions.getContent())
            .pageNumber(versions.getNumber())
            .pageSize(versions.getSize())
            .totalElements(versions.getTotalElements())
            .totalPages(versions.getTotalPages())
            .first(versions.isFirst())
            .last(versions.isLast())
            .build();
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<Version>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách phiên bản theo hợp đồng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/compare/{versionId1}/{versionId2}")
    @Operation(
        summary = "So sánh hai phiên bản",
        description = """
        ## 📖 Mô tả
        So sánh nội dung giữa hai phiên bản cụ thể.

        ## 🔹 Đầu vào

        📄 versionId1 (bắt buộc, path)
        Loại: string
        Mô tả: ID của phiên bản đầu tiên

        📄 versionId2 (bắt buộc, path)
        Loại: string
        Mô tả: ID của phiên bản thứ hai

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Kết quả so sánh giữa hai phiên bản

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 404: Not Found)

        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả

        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý

        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu

        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu

        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """,
        responses = {
            @ApiResponse(responseCode = "200", description = "Version comparison completed successfully"),
            @ApiResponse(responseCode = "404", description = "One or both versions not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> compareVersions(
            @Parameter(description = "ID của phiên bản đầu tiên", required = true)
            @PathVariable String versionId1,
            
            @Parameter(description = "ID của phiên bản thứ hai", required = true)
            @PathVariable String versionId2) {
        
        log.info("Comparing versions: {} vs {}", versionId1, versionId2);
        
        // TODO: Implement compareVersions in service
        java.util.Map<String, Object> comparison = new java.util.HashMap<>();
        comparison.put("version1", versionId1);
        comparison.put("version2", versionId2);
        comparison.put("differences", new java.util.ArrayList<>());
        comparison.put("similarity", 100.0);
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã so sánh hai phiên bản thành công")
            .data(comparison)
            .build());
    }

    @GetMapping("/latest-by-contract/{contractId}")
    @Operation(
        summary = "Lấy phiên bản mới nhất theo hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy phiên bản mới nhất của một hợp đồng cụ thể.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng

        ## 🔹 Đầu ra

        📝 data
        Loại: Version
        Mô tả: Phiên bản mới nhất của hợp đồng

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 404: Not Found)

        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả

        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý

        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu

        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu

        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """,
        responses = {
            @ApiResponse(responseCode = "200", description = "Latest version retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "No versions found for contract"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<Version>> getLatestVersionByContract(
            @Parameter(description = "ID của hợp đồng", required = true)
            @PathVariable String contractId) {
        
        log.info("Getting latest version for contract: {}", contractId);
        
        // TODO: Implement getLatestVersionByContract in service
        Version latestVersion = null; // versionService.getLatestVersionByContract(contractId);
        
        if (latestVersion == null) {
            return ResponseEntity.ok(RestResponse.<Version>builder()
                .statusCode(404)
                .shortMessage("Not Found")
                .description("Không tìm thấy phiên bản nào cho hợp đồng này")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<Version>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy phiên bản mới nhất thành công")
            .data(latestVersion)
            .build());
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê phiên bản",
        description = """
        ## 📖 Mô tả
        Lấy thống kê tổng quan về phiên bản trong hệ thống.

        ## 🔹 Đầu vào

        Không có tham số đầu vào.

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Thống kê phiên bản

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK)

        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả

        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý

        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu

        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu

        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """,
        responses = {
            @ApiResponse(responseCode = "200", description = "Version statistics retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> getVersionStats() {
        log.info("Getting version statistics");
        
        // TODO: Implement getVersionStats in service
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalVersions", 0);
        stats.put("activeVersions", 0);
        stats.put("deletedVersions", 0);
        stats.put("versionsByContract", new java.util.HashMap<>());
        stats.put("averageVersionsPerContract", 0.0);
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thống kê phiên bản thành công")
            .data(stats)
            .build());
    }
}
