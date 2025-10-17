package com.devgo2003.docgo.backend.user_service.controller;

import com.devgo2003.docgo.backend.user_service.dto.*;
import com.devgo2003.docgo.backend.user_service.service.OrganizationPermissionService;
import com.devgo2003.docgo.backend.user_service.service.OrganizationService;
import com.devgo2003.docgo.backend.user_service.common.response.RestResponse;
import com.devgo2003.docgo.backend.user_service.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user-management-service/organizations/{organizationId}/permissions")
@Tag(name = "Organization Management", description = "API quản lý tổ chức")
@RequiredArgsConstructor
@Slf4j
public class OrganizationPermissionController {

    private final OrganizationPermissionService organizationPermissionService;
    private final OrganizationService organizationService;

    @GetMapping
    @Operation(
        summary = "Organization Permission Management - Lấy danh sách quyền hạn trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 page (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)
        
        📄 size (tùy chọn, query)  
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 10)
        
        📄 sortBy (tùy chọn, query)
        Loại: string
        Mô tả: Trường sắp xếp (mặc định: createdAt)
        
        📄 sortDirection (tùy chọn, query)
        Loại: string
        Mô tả: Hướng sắp xếp: ASC hoặc DESC (mặc định: DESC)
        
        🔹 Đầu ra
        
        📝 data
        Loại: Page<OrganizationPermissionResponse>
        Mô tả: Danh sách quyền hạn trong tổ chức với phân trang
        
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
        """
    )
    public ResponseEntity<RestResponse<Page<OrganizationPermissionResponse>>> getAllPermissions(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "Số trang (mặc định: 0)") 
        @RequestParam(defaultValue = "0") int page,
        
        @Parameter(description = "Kích thước trang (mặc định: 10)") 
        @RequestParam(defaultValue = "10") int size,
        
        @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
        @RequestParam(defaultValue = "createdAt") String sortBy,
        
        @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
        @RequestParam(defaultValue = "DESC") String sortDirection,
        
        Pageable pageable) {
        
        log.info("[OrganizationPermissionController] Getting all permissions for organization: {}", organizationId);
        
        // TODO: Implement getAllPermissions method in OrganizationPermissionService
        Page<OrganizationPermissionResponse> permissions = Page.empty();
        
        return ResponseEntity.ok(RestResponse.<Page<OrganizationPermissionResponse>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách quyền hạn trong tổ chức thành công")
            .data(permissions)
            .build());
    }

    @GetMapping("/{permissionId}")
    @Operation(
        summary = "Organization Permission Management - Lấy chi tiết quyền hạn trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 permissionId (bắt buộc, path)
        Loại: string
        Mô tả: ID của quyền hạn cần lấy
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationPermissionResponse
        Mô tả: Thông tin chi tiết quyền hạn
        
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
        """
    )
    public ResponseEntity<RestResponse<OrganizationPermissionResponse>> getPermission(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "ID của quyền hạn") 
        @PathVariable String permissionId) {
        
        log.info("[OrganizationPermissionController] Getting permission {} in organization: {}", permissionId, organizationId);
        
        OrganizationPermissionResponse permission = organizationPermissionService.getPermissionById(organizationId, permissionId).orElseThrow(() -> 
            new RuntimeException("Không tìm thấy quyền hạn với ID: " + permissionId));
        
        return ResponseEntity.ok(RestResponse.<OrganizationPermissionResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thông tin quyền hạn thành công")
            .data(permission)
            .build());
    }

    @PostMapping
    @PreAuthorize("permitAll()") // Tạm thời cho phép anonymous access
    @Operation(
        summary = "Organization Permission Management - Tạo quyền hạn mới trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 name (bắt buộc, body)
        Loại: string
        Mô tả: Tên quyền hạn
        
        📄 displayName (tùy chọn, body)
        Loại: string
        Mô tả: Tên hiển thị của quyền hạn
        
        📄 description (tùy chọn, body)
        Loại: string
        Mô tả: Mô tả quyền hạn
        
        📄 resource (tùy chọn, body)
        Loại: string
        Mô tả: Tài nguyên áp dụng quyền hạn
        
        📄 action (tùy chọn, body)
        Loại: string
        Mô tả: Hành động được phép thực hiện
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationPermissionResponse
        Mô tả: Thông tin quyền hạn vừa tạo
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (201: Created)
        
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
        """
    )
    public ResponseEntity<RestResponse<OrganizationPermissionResponse>> createPermission(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Valid @RequestBody OrganizationPermissionCreateRequest request) {
        
        log.info("[OrganizationPermissionController] Creating permission in organization: {}", organizationId);
        
        // Lấy owner user ID từ organization để có quyền tạo permission
        OrganizationResponse organizationResponse = organizationService.getOrganizationById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        String currentUserId = organizationResponse.getOwnerUserId();
        
        OrganizationPermissionResponse permission = organizationPermissionService.createPermission(organizationId, request, currentUserId);
        
        return ResponseEntity.ok(RestResponse.<OrganizationPermissionResponse>builder()
            .statusCode(201)
            .shortMessage("Created")
            .description("Đã tạo quyền hạn trong tổ chức thành công")
            .data(permission)
            .build());
    }

    @PutMapping("/{permissionId}")
    @Operation(
        summary = "Organization Permission Management - Cập nhật quyền hạn trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 permissionId (bắt buộc, path)
        Loại: string
        Mô tả: ID của quyền hạn cần cập nhật
        
        📄 name (tùy chọn, body)
        Loại: string
        Mô tả: Tên quyền hạn mới
        
        📄 displayName (tùy chọn, body)
        Loại: string
        Mô tả: Tên hiển thị mới của quyền hạn
        
        📄 description (tùy chọn, body)
        Loại: string
        Mô tả: Mô tả mới của quyền hạn
        
        📄 resource (tùy chọn, body)
        Loại: string
        Mô tả: Tài nguyên mới áp dụng quyền hạn
        
        📄 action (tùy chọn, body)
        Loại: string
        Mô tả: Hành động mới được phép thực hiện
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationPermissionResponse
        Mô tả: Thông tin quyền hạn sau khi cập nhật
        
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
        """
    )
    public ResponseEntity<RestResponse<OrganizationPermissionResponse>> updatePermission(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "ID của quyền hạn") 
        @PathVariable String permissionId,
        
        @Valid @RequestBody OrganizationPermissionUpdateRequest request) {
        
        log.info("[OrganizationPermissionController] Updating permission {} in organization: {}", permissionId, organizationId);
        
        OrganizationPermissionResponse permission = organizationPermissionService.updatePermission(organizationId, permissionId, request, "system");
        
        return ResponseEntity.ok(RestResponse.<OrganizationPermissionResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã cập nhật quyền hạn thành công")
            .data(permission)
            .build());
    }

    @DeleteMapping("/{permissionId}")
    @Operation(
        summary = "Organization Permission Management - Xóa quyền hạn khỏi tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 permissionId (bắt buộc, path)
        Loại: string
        Mô tả: ID của quyền hạn cần xóa
        
        🔹 Đầu ra
        
        📝 data
        Loại: null
        Mô tả: Không có dữ liệu trả về khi xóa thành công
        
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
        """
    )
    public ResponseEntity<RestResponse<Void>> deletePermission(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "ID của quyền hạn") 
        @PathVariable String permissionId) {
        
        log.info("[OrganizationPermissionController] Deleting permission {} from organization: {}", permissionId, organizationId);
        
        organizationPermissionService.deletePermission(organizationId, permissionId, "system");
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã xóa quyền hạn khỏi tổ chức thành công")
            .data(null)
            .build());
    }
}

