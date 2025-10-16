package com.devgo2003.docgo.backend.user_service.controller;

import com.devgo2003.docgo.backend.user_service.dto.*;
import com.devgo2003.docgo.backend.user_service.entity.Invitation;
import com.devgo2003.docgo.backend.user_service.entity.User;
import com.devgo2003.docgo.backend.user_service.service.OrganizationService;
import com.devgo2003.docgo.backend.user_service.common.response.RestResponse;
import com.devgo2003.docgo.backend.user_service.common.exception.OrganizationNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-management-service/v1/organizations")
@Tag(name = "Organization Management", description = "API quản lý tổ chức")
@RequiredArgsConstructor
@Slf4j
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    @Operation(
        summary = "Organization Management - Lấy danh sách tổ chức",
        description = """
        🔹 Đầu vào
        
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
        Loại: Page<OrganizationResponse>
        Mô tả: Danh sách tổ chức với phân trang
        
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
    public ResponseEntity<RestResponse<Page<OrganizationResponse>>> getAllOrganizations(
        @Parameter(description = "Số trang (mặc định: 0)") 
        @RequestParam(defaultValue = "0") int page,
        
        @Parameter(description = "Kích thước trang (mặc định: 10)") 
        @RequestParam(defaultValue = "10") int size,
        
        @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
        @RequestParam(defaultValue = "createdAt") String sortBy,
        
        @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
        @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("[OrganizationController] Getting all organizations - page: {}, size: {}", page, size);
        
        Page<OrganizationResponse> organizations = organizationService.getAllOrganizations(page, size, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<Page<OrganizationResponse>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách tổ chức thành công")
            .data(organizations)
            .build());
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Organization Management - Lấy chi tiết tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức cần lấy
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationResponse
        Mô tả: Thông tin chi tiết tổ chức
        
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
    public ResponseEntity<RestResponse<OrganizationResponse>> getOrganization(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id) {
        
        log.info("[OrganizationController] Getting organization with id: {}", id);
        
        OrganizationResponse organization = organizationService.getOrganizationById(id).orElseThrow(() -> 
            new OrganizationNotFoundException("Không tìm thấy tổ chức với ID: " + id));
        
        return ResponseEntity.ok(RestResponse.<OrganizationResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy thông tin tổ chức thành công")
            .data(organization)
            .build());
    }

    @PostMapping
    @Operation(
        summary = "Organization Management - Tạo tổ chức mới",
        description = """
        🔹 Đầu vào
        
        📄 name (bắt buộc, body)
        Loại: string
        Mô tả: Tên tổ chức
        
        📄 description (tùy chọn, body)
        Loại: string
        Mô tả: Mô tả tổ chức
        
        📄 ownerUserId (bắt buộc, body)
        Loại: string
        Mô tả: ID của người dùng sở hữu tổ chức
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationResponse
        Mô tả: Thông tin tổ chức vừa tạo
        
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
    public ResponseEntity<RestResponse<OrganizationResponse>> createOrganization(
        @Valid @RequestBody OrganizationCreateRequest request) {
        
        log.info("[OrganizationController] Creating organization: {}", request.getName());
        
        OrganizationResponse organization = organizationService.createOrganization(request);
        
        return ResponseEntity.ok(RestResponse.<OrganizationResponse>builder()
            .statusCode(201)
            .shortMessage("Created")
            .description("Đã tạo tổ chức thành công")
            .data(organization)
            .build());
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Organization Management - Cập nhật tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức cần cập nhật
        
        📄 name (tùy chọn, body)
        Loại: string
        Mô tả: Tên tổ chức mới
        
        📄 description (tùy chọn, body)
        Loại: string
        Mô tả: Mô tả tổ chức mới
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationResponse
        Mô tả: Thông tin tổ chức sau khi cập nhật
        
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
    public ResponseEntity<RestResponse<OrganizationResponse>> updateOrganization(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Valid @RequestBody OrganizationUpdateRequest request) {
        
        log.info("[OrganizationController] Updating organization with id: {}", id);
        
        OrganizationResponse organization = organizationService.updateOrganization(id, request).orElseThrow(() -> 
            new OrganizationNotFoundException("Không tìm thấy tổ chức với ID: " + id));
        
        return ResponseEntity.ok(RestResponse.<OrganizationResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã cập nhật tổ chức thành công")
            .data(organization)
            .build());
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Organization Management - Xóa tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức cần xóa
        
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
    public ResponseEntity<RestResponse<Void>> deleteOrganization(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id) {
        
        log.info("[OrganizationController] Deleting organization with id: {}", id);
        
        organizationService.deleteOrganization(id);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã xóa tổ chức thành công")
            .data(null)
            .build());
    }

    @PostMapping("/{id}/members")
    @Operation(
        summary = "Organization Management - Mời thành viên vào tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 userId (bắt buộc, body)
        Loại: string
        Mô tả: ID của người dùng cần mời
        
        📄 roleId (tùy chọn, body)
        Loại: string
        Mô tả: ID của vai trò trong tổ chức
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationMembershipResponse
        Mô tả: Thông tin thành viên vừa được mời
        
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
    public ResponseEntity<RestResponse<OrganizationMembershipResponse>> inviteMember(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Valid @RequestBody OrganizationMemberInviteRequest request) {
        
        log.info("[OrganizationController] Inviting member to organization: {}", id);
        
        // Lấy owner user ID từ organization để có quyền mời thành viên
        OrganizationResponse organizationResponse = organizationService.getOrganizationById(id)
                .orElseThrow(() -> new OrganizationNotFoundException("Không tìm thấy tổ chức"));
        String currentUserId = organizationResponse.getOwnerUserId();
        
        OrganizationMembershipResponse membership = organizationService.inviteMember(id, request, currentUserId);
        
        return ResponseEntity.ok(RestResponse.<OrganizationMembershipResponse>builder()
            .statusCode(201)
            .shortMessage("Created")
            .description("Đã mời thành viên vào tổ chức thành công")
            .data(membership)
            .build());
    }

    @GetMapping("/{id}/members")
    @Operation(
        summary = "Organization Management - Lấy danh sách thành viên tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 page (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)
        
        📄 size (tùy chọn, query)  
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 10)
        
        🔹 Đầu ra
        
        📝 data
        Loại: Page<OrganizationMembershipResponse>
        Mô tả: Danh sách thành viên tổ chức với phân trang
        
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
    public ResponseEntity<RestResponse<Page<OrganizationMembershipResponse>>> getMembers(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Parameter(description = "Số trang (mặc định: 0)") 
        @RequestParam(defaultValue = "0") int page,
        
        @Parameter(description = "Kích thước trang (mặc định: 10)") 
        @RequestParam(defaultValue = "10") int size,
        
        Pageable pageable) {
        
        log.info("[OrganizationController] Getting members of organization: {}", id);
        
        // TODO: Implement getMembers method in OrganizationService
        Page<OrganizationMembershipResponse> members = Page.empty();
        
        return ResponseEntity.ok(RestResponse.<Page<OrganizationMembershipResponse>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách thành viên tổ chức thành công")
            .data(members)
            .build());
    }

    @PutMapping("/{id}/members/{userId}")
    @Operation(
        summary = "Organization Management - Cập nhật thông tin thành viên",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 userId (bắt buộc, path)
        Loại: string
        Mô tả: ID của người dùng cần cập nhật
        
        📄 roleId (tùy chọn, body)
        Loại: string
        Mô tả: ID của vai trò mới
        
        📄 isAdmin (tùy chọn, body)
        Loại: boolean
        Mô tả: Có phải admin không
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationMembershipResponse
        Mô tả: Thông tin thành viên sau khi cập nhật
        
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
    public ResponseEntity<RestResponse<OrganizationMembershipResponse>> updateMember(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Parameter(description = "ID của người dùng") 
        @PathVariable String userId,
        
        @Valid @RequestBody OrganizationMemberUpdateRequest request) {
        
        log.info("[OrganizationController] Updating member {} in organization: {}", userId, id);
        
        organizationService.updateMember(id, userId, request, "system");
        // TODO: Implement proper current user context
        OrganizationMembershipResponse membership = OrganizationMembershipResponse.builder()
            .organizationId(id)
            .userId(userId)
            .build();
        
        return ResponseEntity.ok(RestResponse.<OrganizationMembershipResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã cập nhật thông tin thành viên thành công")
            .data(membership)
            .build());
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(
        summary = "Organization Management - Xóa thành viên khỏi tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 userId (bắt buộc, path)
        Loại: string
        Mô tả: ID của người dùng cần xóa
        
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
    public ResponseEntity<RestResponse<Void>> removeMember(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Parameter(description = "ID của người dùng") 
        @PathVariable String userId) {
        
        log.info("[OrganizationController] Removing member {} from organization: {}", userId, id);
        
        // Lấy owner user ID từ organization để có quyền xóa thành viên
        OrganizationResponse organizationResponse = organizationService.getOrganizationById(id)
                .orElseThrow(() -> new OrganizationNotFoundException("Không tìm thấy tổ chức"));
        String currentUserId = organizationResponse.getOwnerUserId();
        
        organizationService.removeMember(id, userId, currentUserId);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã xóa thành viên khỏi tổ chức thành công")
            .data(null)
            .build());
    }

    @PostMapping("/{id}/admins")
    @Operation(
        summary = "Organization Management - Thêm admin cho tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 userId (bắt buộc, body)
        Loại: string
        Mô tả: ID của người dùng cần thêm làm admin
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationResponse
        Mô tả: Thông tin tổ chức sau khi thêm admin
        
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
    public ResponseEntity<RestResponse<OrganizationResponse>> addAdmin(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Valid @RequestBody OrganizationAdminAssignRequest request) {
        
        log.info("[OrganizationController] Adding admin to organization: {}", id);
        
        organizationService.addAdmin(id, request.getUserId(), "system");
        // TODO: Implement proper current user context
        OrganizationResponse organization = organizationService.getOrganizationById(id).orElseThrow(() -> 
            new OrganizationNotFoundException("Không tìm thấy tổ chức với ID: " + id));
        
        return ResponseEntity.ok(RestResponse.<OrganizationResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã thêm admin cho tổ chức thành công")
            .data(organization)
            .build());
    }

    @DeleteMapping("/{id}/admins/{userId}")
    @Operation(
        summary = "Organization Management - Xóa admin khỏi tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 userId (bắt buộc, path)
        Loại: string
        Mô tả: ID của người dùng cần xóa khỏi admin
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationResponse
        Mô tả: Thông tin tổ chức sau khi xóa admin
        
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
    public ResponseEntity<RestResponse<OrganizationResponse>> removeAdmin(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Parameter(description = "ID của người dùng") 
        @PathVariable String userId) {
        
        log.info("[OrganizationController] Removing admin from organization: {}", id);
        
        organizationService.removeAdmin(id, userId, "system");
        // TODO: Implement proper current user context
        OrganizationResponse organization = organizationService.getOrganizationById(id).orElseThrow(() -> 
            new OrganizationNotFoundException("Không tìm thấy tổ chức với ID: " + id));
        
        return ResponseEntity.ok(RestResponse.<OrganizationResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã xóa admin khỏi tổ chức thành công")
            .data(organization)
            .build());
    }

    @PostMapping("/{id}/transfer-ownership")
    @Operation(
        summary = "Organization Management - Chuyển quyền sở hữu tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 id (bắt buộc, path)
        Loại: string
        Mô tả: ID của tổ chức
        
        📄 newOwnerId (bắt buộc, body)
        Loại: string
        Mô tả: ID của người dùng mới sẽ sở hữu tổ chức
        
        🔹 Đầu ra
        
        📝 data
        Loại: OrganizationResponse
        Mô tả: Thông tin tổ chức sau khi chuyển quyền sở hữu
        
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
    public ResponseEntity<RestResponse<OrganizationResponse>> transferOwnership(
        @Parameter(description = "ID của tổ chức") 
        @PathVariable String id,
        
        @Valid @RequestBody OrganizationTransferOwnershipRequest request) {
        
        log.info("[OrganizationController] Transferring ownership of organization: {}", id);
        
        organizationService.transferOwnership(id, request.getNewOwnerId(), "system");
        // TODO: Implement proper current user context
        OrganizationResponse organization = organizationService.getOrganizationById(id).orElseThrow(() -> 
            new OrganizationNotFoundException("Không tìm thấy tổ chức với ID: " + id));
        
        return ResponseEntity.ok(RestResponse.<OrganizationResponse>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã chuyển quyền sở hữu tổ chức thành công")
            .data(organization)
            .build());
    }

    @GetMapping("/invitations/pending")
    @Operation(
        summary = "Lấy danh sách lời mời chờ xử lý",
        description = """
        🔹 Đầu vào
        
        📄 email (query, bắt buộc)
        Loại: string
        Mô tả: Email của user để lấy danh sách lời mời
        
        🔹 Đầu ra
        
        📝 data
        Loại: List<Invitation>
        Mô tả: Danh sách lời mời chờ xử lý
        
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
    public ResponseEntity<RestResponse<List<Invitation>>> getPendingInvitations(
        @Parameter(description = "Email của user") 
        @RequestParam String email) {
        
        log.info("[OrganizationController] Getting pending invitations for email: {}", email);
        
        List<Invitation> invitations = organizationService.getPendingInvitations(email);
        
        return ResponseEntity.ok(RestResponse.<List<Invitation>>builder()
            .statusCode(200)
            .shortMessage("Success")
            .description("Đã lấy danh sách lời mời chờ xử lý thành công")
            .data(invitations)
            .build());
    }

    @GetMapping("/users/available")
    @Operation(
        summary = "Lấy danh sách user có thể mời vào tổ chức",
        description = """
        🔹 Đầu vào
        
        📄 page (tùy chọn, query)
        Loại: integer
        Mô tả: Số trang (mặc định: 0)
        
        📄 size (tùy chọn, query)  
        Loại: integer
        Mô tả: Kích thước trang (mặc định: 20)
        
        📄 searchTerm (tùy chọn, query)
        Loại: string
        Mô tả: Từ khóa tìm kiếm user theo tên hoặc email
        
        🔹 Đầu ra
        
        📝 data
        Loại: Page<User>
        Mô tả: Danh sách user có thể mời với phân trang
        
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
    public ResponseEntity<RestResponse<Page<User>>> getAvailableUsers(
            @Parameter(description = "Số trang (mặc định: 0)") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Kích thước trang (mặc định: 20)") 
            @RequestParam(defaultValue = "20") int size,
            
            @Parameter(description = "Từ khóa tìm kiếm") 
            @RequestParam(required = false) String searchTerm) {

        log.info("[OrganizationController] Getting available users - page: {}, size: {}, searchTerm: {}", page, size, searchTerm);

        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = organizationService.getAvailableUsers(pageable, searchTerm);

        return ResponseEntity.ok(RestResponse.<Page<User>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách user có thể mời thành công")
                .data(users)
                .build());
    }
}

