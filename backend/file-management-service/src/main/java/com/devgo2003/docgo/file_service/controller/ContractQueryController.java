package com.devgo2003.docgo.file_service.controller;

import com.devgo2003.docgo.file_service.common.response.PaginatedResponse;
import com.devgo2003.docgo.file_service.util.PaginatedResponseUtil;
import com.devgo2003.docgo.file_service.common.response.RestResponse;
import com.devgo2003.docgo.file_service.dto.ContractDetailDto;
import com.devgo2003.docgo.file_service.dto.ContractDetailResponseDto;
import com.devgo2003.docgo.file_service.dto.ContractResponseDto;
import com.devgo2003.docgo.file_service.dto.ContractWithSummaryDto;
import com.devgo2003.docgo.file_service.entity.Contract;
import com.devgo2003.docgo.file_service.service.IContractQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho Contract Query APIs
 * Cung cấp các API query và search cho contracts
 */
@RestController
@RequestMapping("/api/v1/file-management-service/contracts/query")
@Tag(name = "Contract Query Management", description = "API tìm kiếm và truy vấn hợp đồng")
@RequiredArgsConstructor
@Slf4j
public class ContractQueryController {

    private final IContractQueryService contractQueryService;

    @GetMapping("/search")
    @Operation(
        summary = "Tìm kiếm hợp đồng",
        description = """
        ## 📖 Mô tả
        Tìm kiếm hợp đồng theo từ khóa với phân trang và sắp xếp.

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
        Mô tả: Bao gồm hợp đồng đã xóa (mặc định: false)

        ## 🔹 Đầu ra

        📝 data
        Loại: PaginatedResponse<ContractResponseDto>
        Mô tả: Danh sách hợp đồng tìm được

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
            @ApiResponse(responseCode = "204", description = "No contracts found"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<PaginatedResponse<ContractResponseDto>>> searchContracts(
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
            
            @Parameter(description = "Bao gồm hợp đồng đã xóa (mặc định: false)") 
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        
        log.info("Searching contracts with term: {}, page: {}, size: {}", searchTerm, pageNumber, pageSize);
        
        Page<ContractResponseDto> contracts = contractQueryService.getAllContractsWithNewFormat(
            pageNumber, pageSize, List.of(sortBy), List.of(sortDirection), searchTerm, includeDeleted);
        
        if (contracts.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<PaginatedResponse<ContractResponseDto>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không tìm thấy hợp đồng nào")
                .data(null)
                .build());
        }
        
        PaginatedResponse<ContractResponseDto> paginatedResponse = PaginatedResponseUtil.buildPaginatedResponse(
            contracts, pageNumber, pageSize, searchTerm, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<PaginatedResponse<ContractResponseDto>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tìm kiếm hợp đồng thành công")
            .data(paginatedResponse)
            .build());
    }

    @GetMapping("/by-status/{status}")
    @Operation(
        summary = "Lấy hợp đồng theo trạng thái",
        description = """
        ## 📖 Mô tả
        Lấy danh sách hợp đồng theo trạng thái cụ thể.

        ## 🔹 Đầu vào

        📄 status (bắt buộc, path)
        Loại: string
        Mô tả: Trạng thái hợp đồng cần lọc

        ## 🔹 Đầu ra

        📝 data
        Loại: List<ContractResponseDto>
        Mô tả: Danh sách hợp đồng theo trạng thái

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
            @ApiResponse(responseCode = "200", description = "Contracts retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No contracts found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<ContractResponseDto>>> getContractsByStatus(
            @Parameter(description = "Trạng thái hợp đồng cần lọc", required = true)
            @PathVariable String status) {
        
        log.info("Getting contracts by status: {}", status);
        
        List<Contract> contracts = contractQueryService.getContractsByStatus(status);
        
        if (contracts.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<ContractResponseDto>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có hợp đồng nào với trạng thái này")
                .data(null)
                .build());
        }
        
        List<ContractResponseDto> contractDtos = contracts.stream()
            .map(this::convertToContractResponseDto)
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(RestResponse.<List<ContractResponseDto>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách hợp đồng theo trạng thái thành công")
            .data(contractDtos)
            .build());
    }

    @GetMapping("/by-type/{type}")
    @Operation(
        summary = "Lấy hợp đồng theo loại",
        description = """
        ## 📖 Mô tả
        Lấy danh sách hợp đồng theo loại cụ thể.

        ## 🔹 Đầu vào

        📄 type (bắt buộc, path)
        Loại: string
        Mô tả: Loại hợp đồng cần lọc

        ## 🔹 Đầu ra

        📝 data
        Loại: List<ContractResponseDto>
        Mô tả: Danh sách hợp đồng theo loại

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
            @ApiResponse(responseCode = "200", description = "Contracts retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No contracts found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<ContractResponseDto>>> getContractsByType(
            @Parameter(description = "Loại hợp đồng cần lọc", required = true)
            @PathVariable String type) {
        
        log.info("Getting contracts by type: {}", type);
        
        // TODO: Implement getContractsByType in service
        List<ContractResponseDto> contracts = new java.util.ArrayList<>();
        
        if (contracts.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<ContractResponseDto>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có hợp đồng nào với loại này")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<List<ContractResponseDto>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách hợp đồng theo loại thành công")
            .data(contracts)
            .build());
    }

    @GetMapping("/expiring")
    @Operation(
        summary = "Lấy hợp đồng sắp hết hạn",
        description = """
        ## 📖 Mô tả
        Lấy danh sách hợp đồng sắp hết hạn (trong vòng 30 ngày).

        ## 🔹 Đầu vào

        📄 days (tùy chọn, query)
        Loại: integer
        Mô tả: Số ngày trước khi hết hạn (mặc định: 30)

        ## 🔹 Đầu ra

        📝 data
        Loại: List<ContractResponseDto>
        Mô tả: Danh sách hợp đồng sắp hết hạn

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
            @ApiResponse(responseCode = "200", description = "Expiring contracts retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No expiring contracts found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<ContractResponseDto>>> getExpiringContracts(
            @Parameter(description = "Số ngày trước khi hết hạn (mặc định: 30)") 
            @RequestParam(defaultValue = "30") int days) {
        
        log.info("Getting expiring contracts within {} days", days);
        
        // TODO: Implement getExpiringContracts in service
        List<ContractResponseDto> contracts = new java.util.ArrayList<>();
        
        if (contracts.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<ContractResponseDto>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có hợp đồng nào sắp hết hạn")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<List<ContractResponseDto>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách hợp đồng sắp hết hạn thành công")
            .data(contracts)
            .build());
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy thống kê tổng quan về hợp đồng trong hệ thống.

        ## 🔹 Đầu vào

        Không có tham số đầu vào.

        ## 🔹 Đầu ra

        📝 data
        Loại: Map<String, Object>
        Mô tả: Thống kê hợp đồng

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
            @ApiResponse(responseCode = "200", description = "Contract statistics retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<java.util.Map<String, Object>>> getContractStats() {
        log.info("Getting contract statistics");
        
        // TODO: Implement getContractStats in service
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalContracts", 0);
        stats.put("activeContracts", 0);
        stats.put("expiringContracts", 0);
        stats.put("byStatus", new java.util.HashMap<>());
        stats.put("byType", new java.util.HashMap<>());
        
        return ResponseEntity.ok(RestResponse.<java.util.Map<String, Object>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thống kê hợp đồng thành công")
            .data(stats)
            .build());
    }

    // Helper methods
    private ContractResponseDto convertToContractResponseDto(Contract contract) {
        return ContractResponseDto.builder()
            .id(contract.getId())
            .contractNumber(contract.getContractNumber())
            .title(contract.getTitle())
            .status(contract.getStatus() != null ? contract.getStatus().name() : null)
            .contractType(contract.getContractType() != null ? contract.getContractType().name() : null)
            .build();
    }
}
