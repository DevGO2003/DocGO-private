package com.devgo2003.docgo.file_service.controller;

import com.devgo2003.docgo.file_service.common.response.RestResponse;
import com.devgo2003.docgo.file_service.dto.ContractSummaryCreateRequest;
import com.devgo2003.docgo.file_service.dto.ContractSummaryResponseDto;
import com.devgo2003.docgo.file_service.service.IContractSummaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * Controller cho Contract Summary APIs
 * Cung cấp các API quản lý contract summary
 */
@RestController
@RequestMapping("/api/v1/file-management-service/contracts")
@Tag(name = "Contract Summary Management", description = "API quản lý tóm tắt hợp đồng")
@RequiredArgsConstructor
@Slf4j
public class ContractSummaryController {

    private final IContractSummaryService contractSummaryService;

    @GetMapping("/{contractId}/summary")
    @Operation(
        summary = "Lấy tóm tắt hợp đồng",
        description = """
        ## 📖 Mô tả
        Lấy thông tin tóm tắt hợp đồng theo contract ID với lazy loading.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng cần lấy tóm tắt

        ## 🔹 Đầu ra

        📝 data
        Loại: ContractSummaryResponseDto
        Mô tả: Thông tin tóm tắt hợp đồng

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
            @ApiResponse(responseCode = "200", description = "Contract summary retrieved successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContractSummaryResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Contract summary not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<ContractSummaryResponseDto>> getContractSummary(
            @Parameter(description = "ID của hợp đồng cần lấy tóm tắt", required = true)
            @PathVariable String contractId) {
        
        log.info("Getting contract summary for contractId: {}", contractId);
        
        Optional<ContractSummaryResponseDto> summary = contractSummaryService.getContractSummary(contractId);
        
        if (summary.isPresent()) {
            return ResponseEntity.ok(RestResponse.<ContractSummaryResponseDto>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy tóm tắt hợp đồng thành công")
                .data(summary.get())
                .build());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(RestResponse.<ContractSummaryResponseDto>builder()
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description("Không tìm thấy tóm tắt hợp đồng")
                    .data(null)
                    .build());
        }
    }

    @PostMapping("/{contractId}/summary")
    @Operation(
        summary = "Tạo tóm tắt hợp đồng",
        description = """
        ## 📖 Mô tả
        Tạo tóm tắt hợp đồng mới theo contract ID.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng cần tạo tóm tắt

        📄 request (bắt buộc, body)
        Loại: ContractSummaryCreateRequest
        Mô tả: Thông tin tóm tắt hợp đồng cần tạo

        ## 🔹 Đầu ra

        📝 data
        Loại: ContractSummaryResponseDto
        Mô tả: Thông tin tóm tắt hợp đồng đã tạo

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (201: Created, 400: Bad Request, 409: Conflict)

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
            @ApiResponse(responseCode = "201", description = "Contract summary created successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContractSummaryResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "409", description = "Contract summary already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<ContractSummaryResponseDto>> createContractSummary(
            @Parameter(description = "ID của hợp đồng cần tạo tóm tắt", required = true)
            @PathVariable String contractId,
            @Parameter(description = "Thông tin tóm tắt hợp đồng cần tạo", required = true)
            @Valid @RequestBody ContractSummaryCreateRequest request) {
        
        log.info("Creating contract summary for contractId: {}", contractId);
        
        request.setContractId(contractId);
        ContractSummaryResponseDto summary = contractSummaryService.createContractSummary(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(RestResponse.<ContractSummaryResponseDto>builder()
                .statusCode(201)
                .shortMessage("Created")
                .description("Đã tạo tóm tắt hợp đồng thành công")
                .data(summary)
                .build());
    }

    @PutMapping("/{contractId}/summary")
    @Operation(
        summary = "Cập nhật tóm tắt hợp đồng",
        description = """
        ## 📖 Mô tả
        Cập nhật thông tin tóm tắt hợp đồng theo contract ID.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng cần cập nhật tóm tắt

        📄 request (bắt buộc, body)
        Loại: ContractSummaryCreateRequest
        Mô tả: Thông tin tóm tắt hợp đồng cần cập nhật

        ## 🔹 Đầu ra

        📝 data
        Loại: ContractSummaryResponseDto
        Mô tả: Thông tin tóm tắt hợp đồng đã cập nhật

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 400: Bad Request, 404: Not Found)

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
            @ApiResponse(responseCode = "200", description = "Contract summary updated successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContractSummaryResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "404", description = "Contract summary not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<ContractSummaryResponseDto>> updateContractSummary(
            @Parameter(description = "ID của hợp đồng cần cập nhật tóm tắt", required = true)
            @PathVariable String contractId,
            @Parameter(description = "Thông tin tóm tắt hợp đồng cần cập nhật", required = true)
            @Valid @RequestBody ContractSummaryCreateRequest request) {
        
        log.info("Updating contract summary for contractId: {}", contractId);
        
        ContractSummaryResponseDto summary = contractSummaryService.updateContractSummary(contractId, request);
        
        return ResponseEntity.ok(RestResponse.<ContractSummaryResponseDto>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã cập nhật tóm tắt hợp đồng thành công")
            .data(summary)
            .build());
    }

    @PostMapping("/{contractId}/summary/regenerate")
    @Operation(
        summary = "Tái tạo tóm tắt hợp đồng bằng AI",
        description = """
        ## 📖 Mô tả
        Tái tạo tóm tắt hợp đồng bằng AI thông qua automation-service.

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng cần tái tạo tóm tắt

        ## 🔹 Đầu ra

        📝 data
        Loại: ContractSummaryResponseDto
        Mô tả: Thông tin tóm tắt hợp đồng đã tái tạo

        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)

        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 500: Internal Server Error)

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
            @ApiResponse(responseCode = "200", description = "Contract summary regenerated successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContractSummaryResponseDto.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<ContractSummaryResponseDto>> regenerateContractSummary(
            @Parameter(description = "ID của hợp đồng cần tái tạo tóm tắt", required = true)
            @PathVariable String contractId) {
        
        log.info("Regenerating contract summary for contractId: {}", contractId);
        
        ContractSummaryResponseDto summary = contractSummaryService.regenerateContractSummary(contractId);
        
        return ResponseEntity.ok(RestResponse.<ContractSummaryResponseDto>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã tái tạo tóm tắt hợp đồng thành công")
            .data(summary)
            .build());
    }

    @DeleteMapping("/{contractId}/summary")
    @Operation(
        summary = "Xóa tóm tắt hợp đồng",
        description = """
        ## 📖 Mô tả
        Xóa tóm tắt hợp đồng theo contract ID (soft delete).

        ## 🔹 Đầu vào

        📄 contractId (bắt buộc, path)
        Loại: string
        Mô tả: ID của hợp đồng cần xóa tóm tắt

        ## 🔹 Đầu ra

        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về

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
            @ApiResponse(responseCode = "200", description = "Contract summary deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Contract summary not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<Void>> deleteContractSummary(
            @Parameter(description = "ID của hợp đồng cần xóa tóm tắt", required = true)
            @PathVariable String contractId) {
        
        log.info("Deleting contract summary for contractId: {}", contractId);
        
        contractSummaryService.deleteContractSummary(contractId);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã xóa tóm tắt hợp đồng thành công")
            .data(null)
            .build());
    }

    @GetMapping("/summaries/by-status/{status}")
    @Operation(
        summary = "Lấy danh sách tóm tắt hợp đồng theo trạng thái",
        description = """
        ## 📖 Mô tả
        Lấy danh sách tóm tắt hợp đồng theo trạng thái.

        ## 🔹 Đầu vào

        📄 status (bắt buộc, path)
        Loại: string
        Mô tả: Trạng thái hợp đồng cần lọc

        ## 🔹 Đầu ra

        📝 data
        Loại: List<ContractSummaryResponseDto>
        Mô tả: Danh sách tóm tắt hợp đồng

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
            @ApiResponse(responseCode = "200", description = "Contract summaries retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No contract summaries found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    public ResponseEntity<RestResponse<List<ContractSummaryResponseDto>>> getContractSummariesByStatus(
            @Parameter(description = "Trạng thái hợp đồng cần lọc", required = true)
            @PathVariable String status) {
        
        log.info("Getting contract summaries by status: {}", status);
        
        List<ContractSummaryResponseDto> summaries = contractSummaryService.getContractSummariesByStatus(status);
        
        if (summaries.isEmpty()) {
            return ResponseEntity.ok(RestResponse.<List<ContractSummaryResponseDto>>builder()
                .statusCode(204)
                .shortMessage("No Content")
                .description("Không có tóm tắt hợp đồng nào với trạng thái này")
                .data(null)
                .build());
        }
        
        return ResponseEntity.ok(RestResponse.<List<ContractSummaryResponseDto>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách tóm tắt hợp đồng thành công")
            .data(summaries)
            .build());
    }
}
