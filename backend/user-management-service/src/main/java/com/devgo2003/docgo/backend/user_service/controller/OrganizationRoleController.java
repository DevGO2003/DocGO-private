package com.devgo2003.docgo.backend.user_service.controller;

import com.devgo2003.docgo.backend.user_service.dto.*;
import com.devgo2003.docgo.backend.user_service.service.OrganizationRoleService;
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
@RequestMapping("/api/v1/user-management-service/organizations/{organizationId}/roles")
@Tag(name = "Organization Management", description = "API quản lý tổ chức")
@RequiredArgsConstructor
@Slf4j
public class OrganizationRoleController {

    private final OrganizationRoleService organizationRoleService;
    private final OrganizationService organizationService;

    @GetMapping
    @Operation(
        summary = "Organization Role Management - Lấy danh sách vai trò trong tổ chức",
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
        Loại: Page<OrganizationRoleResponse>
        Mô tả: Danh sách vai trò trong tổ chức với phân trang
        
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
    public ResponseEntity<RestResponse<Page<OrganizationRoleResponse>>> getAllRoles(
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
        
        log.info("[OrganizationRoleController] Getting all roles for organization: {}", organizationId);
        
        // TODO: Implement getAllRoles method in OrganizationRoleService
        Page<OrganizationRoleResponse> roles = Page.empty();
        
        return ResponseEntity.ok(RestResponse.<Page<OrganizationRoleResponse>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách vai trò trong tổ chức thành công")
            .data(roles)
            .build());
    }

    @GetMapping("/{roleId}")
    @Operation(
        summary = "Organization Role Management - Lấy chi tiết vai trò trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 roleId (bắt buộc, path)
        Loại: string
        Mô tả: ID của vai trò cần lấy
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationRoleResponse
        Mô tả: Thông tin chi tiết vai trò
        
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
    public ResponseEntity<RestResponse<OrganizationRoleResponse>> getRole(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "ID của vai trò") 
        @PathVariable String roleId) {
        
        log.info("[OrganizationRoleController] Getting role {} in organization: {}", roleId, organizationId);
        
        OrganizationRoleResponse role = organizationRoleService.getRoleById(organizationId, roleId).orElseThrow(() -> 
            new RuntimeException("Không tìm thấy vai trò với ID: " + roleId));
        
        return ResponseEntity.ok(RestResponse.<OrganizationRoleResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thông tin vai trò thành công")
            .data(role)
            .build());
    }

    @PostMapping
    @PreAuthorize("permitAll()") // Tạm thời cho phép anonymous access
    @Operation(
        summary = "Organization Role Management - Tạo vai trò mới trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 name (bắt buộc, body)
        Loại: string
        Mô tả: Tên vai trò
        
        📄 displayName (tùy chọn, body)
        Loại: string
        Mô tả: Tên hiển thị của vai trò
        
        📄 description (tùy chọn, body)
        Loại: string
        Mô tả: Mô tả vai trò
        
        📄 permissionIds (tùy chọn, body)
        Loại: List<string>
        Mô tả: Danh sách ID quyền hạn của vai trò
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationRoleResponse
        Mô tả: Thông tin vai trò vừa tạo
        
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
    public ResponseEntity<RestResponse<OrganizationRoleResponse>> createRole(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Valid @RequestBody OrganizationRoleCreateRequest request) {
        
        log.info("[OrganizationRoleController] Creating role in organization: {}", organizationId);
        
        // Lấy owner user ID từ organization để có quyền tạo role
        OrganizationResponse organizationResponse = organizationService.getOrganizationById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        String currentUserId = organizationResponse.getOwnerUserId();
        
        OrganizationRoleResponse role = organizationRoleService.createRole(organizationId, request, currentUserId);
        
        return ResponseEntity.ok(RestResponse.<OrganizationRoleResponse>builder()
            .statusCode(201)
            .shortMessage("Created")
            .description("Đã tạo vai trò trong tổ chức thành công")
            .data(role)
            .build());
    }

    @PutMapping("/{roleId}")
    @Operation(
        summary = "Organization Role Management - Cập nhật vai trò trong tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 roleId (bắt buộc, path)
        Loại: string
        Mô tả: ID của vai trò cần cập nhật
        
        📄 name (tùy chọn, body)
        Loại: string
        Mô tả: Tên vai trò mới
        
        📄 displayName (tùy chọn, body)
        Loại: string
        Mô tả: Tên hiển thị mới của vai trò
        
        📄 description (tùy chọn, body)
        Loại: string
        Mô tả: Mô tả mới của vai trò
        
        📄 permissionIds (tùy chọn, body)
        Loại: List<string>
        Mô tả: Danh sách ID quyền hạn mới của vai trò
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationRoleResponse
        Mô tả: Thông tin vai trò sau khi cập nhật
        
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
    public ResponseEntity<RestResponse<OrganizationRoleResponse>> updateRole(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "ID của vai trò") 
        @PathVariable String roleId,
        
        @Valid @RequestBody OrganizationRoleUpdateRequest request) {
        
        log.info("[OrganizationRoleController] Updating role {} in organization: {}", roleId, organizationId);
        
        OrganizationRoleResponse role = organizationRoleService.updateRole(organizationId, roleId, request, "system");
        
        return ResponseEntity.ok(RestResponse.<OrganizationRoleResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã cập nhật vai trò thành công")
            .data(role)
            .build());
    }

    @DeleteMapping("/{roleId}")
    @Operation(
        summary = "Organization Role Management - Xóa vai trò khỏi tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 organizationId (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 roleId (bắt buộc, path)
        Loại: string
        Mô tả: ID của vai trò cần xóa
        
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
    public ResponseEntity<RestResponse<Void>> deleteRole(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String organizationId,
        
        @Parameter(description = "ID của vai trò") 
        @PathVariable String roleId) {
        
        log.info("[OrganizationRoleController] Deleting role {} from organization: {}", roleId, organizationId);
        
        organizationRoleService.deleteRole(organizationId, roleId, "system");
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã xóa vai trò khỏi tổ chức thành công")
            .data(null)
            .build());
    }
}

