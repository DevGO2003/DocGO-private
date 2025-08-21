package com.devgo2003.docgo.contractmanagement.controller;

import com.devgo2003.docgo.contractmanagement.common.response.PaginatedResponse;
import com.devgo2003.docgo.contractmanagement.common.response.RequestInfo;
import com.devgo2003.docgo.contractmanagement.common.response.ResultInfo;
import com.devgo2003.docgo.contractmanagement.common.response.SortInfo;
import com.devgo2003.docgo.contractmanagement.common.response.RestResponse;
import com.devgo2003.docgo.contractmanagement.entity.Contract;
import com.devgo2003.docgo.contractmanagement.entity.ContractAttachment;
import com.devgo2003.docgo.contractmanagement.entity.ContractEvent;
import com.devgo2003.docgo.contractmanagement.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import com.devgo2003.docgo.contractmanagement.common.exception.NoContentException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/v1/contract-management-service/contracts")
@Tag(name = "API Quản lý Hợp đồng", description = "Các API để tạo, đọc, cập nhật và xóa hợp đồng")
public class ContractController {

    private final ContractService contractService;
    private final HttpServletRequest request;

    @Autowired
    public ContractController(ContractService contractService, HttpServletRequest request) {
        this.contractService = contractService;
        this.request = request;
    }

    @Operation(
        summary = "Tạo hợp đồng mới", 
        description = """
        🔹 Đầu vào
        
        📄 contract (bắt buộc, body)
        Loại: Contract
        Mô tả: Thông tin hợp đồng cần tạo (contractNumber, title, status, partiesJson, startDate, endDate, systemId).
        
        🔹 Đầu ra
        
        📝 data
        Loại: Contract
        Mô tả: Thông tin hợp đồng đã được tạo thành công.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (201: Created).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """,
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                schema = @Schema(implementation = Contract.class),
                examples = @ExampleObject(
                    value = "{\n  \"contractNumber\": \"string\",\n  \"title\": \"string\",\n  \"status\": \"DRAFT\",\n  \"partiesJson\": \"string\",\n  \"startDate\": \"2025-08-17\",\n  \"endDate\": \"2025-08-17\",\n  \"systemId\": \"string\"\n}"
                )
            )
        )
    )
    @PostMapping
    public ResponseEntity<RestResponse<Contract>> createContract(@Valid @RequestBody Contract contract) {
        if (contract.getId() != null) {
            throw new com.devgo2003.docgo.contractmanagement.common.exception.InvalidInputException("Không được gửi id khi tạo hợp đồng mới.");
        }
        Contract created = contractService.createContract(contract);
        RestResponse<Contract> response = RestResponse.<Contract>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.CREATED.value())
                .shortMessage("Success")
                .description("Hợp đồng đã được tạo thành công.")
                .data(created)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Lấy danh sách hợp đồng với phân trang và sắp xếp", 
        description = """
        🔹 Đầu vào
        
        📄 pageNumber (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (bắt đầu từ 0). Mặc định là 0.
        
        📄 pageSize (tùy chọn, query)
        Loại: integer
        Mô tả: Số lượng hợp đồng trên mỗi trang. Mặc định là 10.
        
        📄 sortBy (tùy chọn, query)
        Loại: List<String>
        Mô tả: Danh sách các trường để sắp xếp.
        
        📄 sortDirection (tùy chọn, query)
        Loại: List<String>
        Mô tả: Hướng sắp xếp cho từng trường (ASC, DESC).
        
        📄 searchTerm (tùy chọn, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm trong hợp đồng.
        
        📄 includeDeleted (tùy chọn, query)
        Loại: boolean
        Mô tả: Có bao gồm hợp đồng đã xóa hay không. Mặc định là false.
        
        🔹 Đầu ra
        
        📝 data
        Loại: PaginatedResponse<Contract>
        Mô tả: Danh sách hợp đồng với thông tin phân trang.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 204: No Content).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping
    public ResponseEntity<RestResponse<PaginatedResponse<Contract>>> getAllContracts(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) List<String> sortBy,
            @RequestParam(required = false) List<String> sortDirection,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {

        Page<Contract> contractsPage = contractService.getAllContracts(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        if (contractsPage.getContent().isEmpty()) {
            throw new NoContentException("Không có hợp đồng nào.");
        }

        RequestInfo requestInfo = RequestInfo.builder()
                .page(pageNumber)
                .size(pageSize)
                .searchTerm(searchTerm)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        List<SortInfo> sortInfoList = new ArrayList<>();
        if (contractsPage.getSort().isSorted()) {
            contractsPage.getSort().forEach(order -> {
                sortInfoList.add(new SortInfo(order.getProperty(), order.getDirection().name()));
            });
        }

        ResultInfo resultInfo = ResultInfo.builder()
                .page(contractsPage.getNumber())
                .size(contractsPage.getSize())
                .totalElements(contractsPage.getTotalElements())
                .totalPages(contractsPage.getTotalPages())
                .first(contractsPage.isFirst())
                .last(contractsPage.isLast())
                .numberOfElements(contractsPage.getNumberOfElements())
                .empty(contractsPage.isEmpty())
                .sort(sortInfoList)
                .build();

        PaginatedResponse<Contract> paginatedResponse = new PaginatedResponse<>(requestInfo, resultInfo, contractsPage.getContent());

        RestResponse<PaginatedResponse<Contract>> response = RestResponse.<PaginatedResponse<Contract>>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Danh sách hợp đồng đã được lấy thành công.")
                .data(paginatedResponse)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Lấy hợp đồng theo ID", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của hợp đồng cần lấy thông tin.
        
        🔹 Đầu ra
        
        📝 data
        Loại: Contract
        Mô tả: Thông tin chi tiết của hợp đồng.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK, 404: Not Found).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping("/{id}")
    public ResponseEntity<RestResponse<Contract>> getContract(@PathVariable Long id) {
        Optional<Contract> contract = contractService.getContract(id);
        if (contract.isPresent()) {
            RestResponse<Contract> response = RestResponse.<Contract>builder()
                    .apiVersion("v1")
                    .statusCode(HttpStatus.OK.value())
                    .shortMessage("Success")
                    .description("Thông tin hợp đồng đã được lấy thành công.")
                    .data(contract.get())
                    .timestamp(ZonedDateTime.now())
                    .requestId(UUID.randomUUID().toString())
                    .path(request.getRequestURI())
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            RestResponse<Contract> response = RestResponse.<Contract>builder()
                    .apiVersion("v1")
                    .statusCode(HttpStatus.NOT_FOUND.value())
                    .shortMessage("Not Found")
                    .description("Không tìm thấy hợp đồng với ID đã cung cấp.")
                    .data(null)
                    .timestamp(ZonedDateTime.now())
                    .requestId(UUID.randomUUID().toString())
                    .path(request.getRequestURI())
                    .build();
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Operation(
        summary = "Cập nhật hợp đồng", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của hợp đồng cần cập nhật.
        
        📄 contract (bắt buộc, body)
        Loại: Contract
        Mô tả: Thông tin mới cần cập nhật cho hợp đồng.
        
        🔹 Đầu ra
        
        📝 data
        Loại: Contract
        Mô tả: Thông tin hợp đồng đã được cập nhật.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PutMapping("/{id}")
    public ResponseEntity<RestResponse<Contract>> updateContract(@PathVariable Long id, @Valid @RequestBody Contract contract) {
        Contract updatedContract = contractService.updateContract(id, contract);
        RestResponse<Contract> response = RestResponse.<Contract>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Hợp đồng đã được cập nhật thành công.")
                .data(updatedContract)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Xóa mềm hợp đồng", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của hợp đồng cần xóa mềm.
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<RestResponse<Void>> softDeleteContract(@PathVariable Long id) {
        contractService.softDeleteContract(id);
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Hợp đồng đã được xóa mềm thành công.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Khôi phục hợp đồng", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của hợp đồng cần khôi phục.
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @PutMapping("/{id}/restore")
    public ResponseEntity<RestResponse<Void>> restoreContract(@PathVariable Long id) {
        contractService.restoreContract(id);
        RestResponse<Void> response = RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Hợp đồng đã được khôi phục thành công.")
                .data(null)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Lấy lịch sử sự kiện của hợp đồng", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của hợp đồng cần lấy lịch sử sự kiện.
        
        🔹 Đầu ra
        
        📝 data
        Loại: List<ContractEvent>
        Mô tả: Danh sách các sự kiện của hợp đồng.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping("/{id}/events")
    public ResponseEntity<RestResponse<List<ContractEvent>>> getContractEvents(@PathVariable Long id) {
        List<ContractEvent> events = contractService.getContractEvents(id);
        RestResponse<List<ContractEvent>> response = RestResponse.<List<ContractEvent>>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("Lịch sử sự kiện hợp đồng đã được lấy thành công.")
                .data(events)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(
        summary = "Lấy file đính kèm của hợp đồng", 
        description = """
        🔹 Đầu vào
        
        🆔 id (bắt buộc, path)
        Loại: Long
        Mô tả: ID của hợp đồng cần lấy file đính kèm.
        
        🔹 Đầu ra
        
        📝 data
        Loại: List<ContractAttachment>
        Mô tả: Danh sách các file đính kèm của hợp đồng.
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1).
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK).
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả.
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý.
        
        🕒 timestamp
        Loại: ZonedDateTime
        Mô tả: Thời gian xử lý yêu cầu.
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu.
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi.
        """
    )
    @GetMapping("/{id}/attachments")
    public ResponseEntity<RestResponse<List<ContractAttachment>>> getAttachments(@PathVariable Long id) {
        List<ContractAttachment> attachments = contractService.getAttachments(id);
        RestResponse<List<ContractAttachment>> response = RestResponse.<List<ContractAttachment>>builder()
                .apiVersion("v1")
                .statusCode(HttpStatus.OK.value())
                .shortMessage("Success")
                .description("File đính kèm hợp đồng đã được lấy thành công.")
                .data(attachments)
                .timestamp(ZonedDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
