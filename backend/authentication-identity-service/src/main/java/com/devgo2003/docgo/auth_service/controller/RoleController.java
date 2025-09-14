package com.devgo2003.docgo.auth_service.controller;

import com.devgo2003.docgo.auth_service.entity.RoleMongo;
import com.devgo2003.docgo.auth_service.service.RoleService;
import com.devgo2003.docgo.auth_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/v1/authentication-identity-service/roles")
@RequiredArgsConstructor
@Tag(name = "Role Management", description = "API quản lý vai trò")
public class RoleController {
    
    private final RoleService roleService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách vai trò", description = "Lấy danh sách vai trò với phân trang và sắp xếp")
    public ResponseEntity<RestResponse<Page<RoleMongo>>> getAllRoles(
            @Parameter(description = "Số trang (mặc định: 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang (mặc định: 10)") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("Getting all roles - page: {}, size: {}, sortBy: {}, sortDirection: {}", page, size, sortBy, sortDirection);
        
        Page<RoleMongo> roles = roleService.getAllRoles(page, size, sortBy, sortDirection);
        
        return ResponseEntity.ok(RestResponse.<Page<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách vai trò thành công")
                .data(roles)
                .build());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin vai trò", description = "Lấy thông tin chi tiết vai trò theo ID")
    public ResponseEntity<RestResponse<RoleMongo>> getRoleById(
            @Parameter(description = "ID vai trò") @PathVariable String id) {
        
        log.info("Getting role by id: {}", id);
        
        return roleService.getRoleById(id)
                .map(role -> ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Đã lấy thông tin vai trò thành công")
                        .data(role)
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    @Operation(summary = "Lấy vai trò theo tên", description = "Lấy thông tin vai trò theo tên")
    public ResponseEntity<RestResponse<RoleMongo>> getRoleByName(
            @Parameter(description = "Tên vai trò") @PathVariable String name) {
        
        log.info("Getting role by name: {}", name);
        
        return roleService.getRoleByName(name)
                .map(role -> ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Đã lấy thông tin vai trò thành công")
                        .data(role)
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách vai trò hoạt động", description = "Lấy danh sách vai trò đang hoạt động")
    public ResponseEntity<RestResponse<List<RoleMongo>>> getActiveRoles() {
        
        log.info("Getting active roles");
        
        List<RoleMongo> roles = roleService.getActiveRoles();
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách vai trò hoạt động thành công")
                .data(roles)
                .build());
    }
    
    @GetMapping("/system")
    @Operation(summary = "Lấy danh sách vai trò hệ thống", description = "Lấy danh sách vai trò hệ thống")
    public ResponseEntity<RestResponse<List<RoleMongo>>> getSystemRoles() {
        
        log.info("Getting system roles");
        
        List<RoleMongo> roles = roleService.getSystemRoles();
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách vai trò hệ thống thành công")
                .data(roles)
                .build());
    }
    
    @GetMapping("/parent/{parentRoleId}")
    @Operation(summary = "Lấy vai trò con", description = "Lấy danh sách vai trò con của vai trò cha")
    public ResponseEntity<RestResponse<List<RoleMongo>>> getRolesByParent(
            @Parameter(description = "ID vai trò cha") @PathVariable String parentRoleId) {
        
        log.info("Getting roles by parent: {}", parentRoleId);
        
        List<RoleMongo> roles = roleService.getRolesByParent(parentRoleId);
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách vai trò con thành công")
                .data(roles)
                .build());
    }
    
    @GetMapping("/level/{level}")
    @Operation(summary = "Lấy vai trò theo cấp độ", description = "Lấy danh sách vai trò theo cấp độ")
    public ResponseEntity<RestResponse<List<RoleMongo>>> getRolesByLevel(
            @Parameter(description = "Cấp độ vai trò") @PathVariable Integer level) {
        
        log.info("Getting roles by level: {}", level);
        
        List<RoleMongo> roles = roleService.getRolesByLevel(level);
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách vai trò theo cấp độ thành công")
                .data(roles)
                .build());
    }
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm vai trò", description = "Tìm kiếm vai trò theo từ khóa")
    public ResponseEntity<RestResponse<List<RoleMongo>>> searchRoles(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam String q) {
        
        log.info("Searching roles with query: {}", q);
        
        List<RoleMongo> roles = roleService.searchRoles(q);
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã tìm kiếm vai trò thành công")
                .data(roles)
                .build());
    }
    
    @GetMapping("/permission/{permissionId}")
    @Operation(summary = "Lấy vai trò theo quyền", description = "Lấy danh sách vai trò có quyền cụ thể")
    public ResponseEntity<RestResponse<List<RoleMongo>>> getRolesByPermission(
            @Parameter(description = "ID quyền") @PathVariable String permissionId) {
        
        log.info("Getting roles by permission: {}", permissionId);
        
        List<RoleMongo> roles = roleService.getRolesByPermission(permissionId);
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách vai trò theo quyền thành công")
                .data(roles)
                .build());
    }
    
    @PostMapping
    @Operation(summary = "Tạo vai trò mới", description = "Tạo vai trò mới trong hệ thống")
    public ResponseEntity<RestResponse<RoleMongo>> createRole(
            @Parameter(description = "Thông tin vai trò") @Valid @RequestBody RoleMongo role) {
        
        log.info("Creating new role: {}", role.getName());
        
        RoleMongo createdRole = roleService.createRole(role);
        
        return ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                .statusCode(201)
                .shortMessage("Created")
                .description("Đã tạo vai trò thành công")
                .data(createdRole)
                .build());
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật vai trò", description = "Cập nhật thông tin vai trò")
    public ResponseEntity<RestResponse<RoleMongo>> updateRole(
            @Parameter(description = "ID vai trò") @PathVariable String id,
            @Parameter(description = "Thông tin cập nhật") @Valid @RequestBody RoleMongo roleDetails) {
        
        log.info("Updating role: {}", id);
        
        RoleMongo updatedRole = roleService.updateRole(id, roleDetails);
        
        return ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật vai trò thành công")
                .data(updatedRole)
                .build());
    }
    
    @PutMapping("/{id}/permissions")
    @Operation(summary = "Gán quyền cho vai trò", description = "Gán quyền cho vai trò")
    public ResponseEntity<RestResponse<RoleMongo>> assignPermissions(
            @Parameter(description = "ID vai trò") @PathVariable String id,
            @Parameter(description = "Danh sách ID quyền") @RequestBody Set<String> permissionIds) {
        
        log.info("Assigning permissions to role: {}", id);
        
        RoleMongo updatedRole = roleService.assignPermissions(id, permissionIds);
        
        return ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã gán quyền cho vai trò thành công")
                .data(updatedRole)
                .build());
    }
    
    @PutMapping("/{id}/permissions/add")
    @Operation(summary = "Thêm quyền cho vai trò", description = "Thêm quyền cho vai trò")
    public ResponseEntity<RestResponse<RoleMongo>> addPermission(
            @Parameter(description = "ID vai trò") @PathVariable String id,
            @Parameter(description = "ID quyền") @RequestParam String permissionId) {
        
        log.info("Adding permission to role: {}", id);
        
        RoleMongo updatedRole = roleService.addPermission(id, permissionId);
        
        return ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã thêm quyền cho vai trò thành công")
                .data(updatedRole)
                .build());
    }
    
    @PutMapping("/{id}/permissions/remove")
    @Operation(summary = "Xóa quyền khỏi vai trò", description = "Xóa quyền khỏi vai trò")
    public ResponseEntity<RestResponse<RoleMongo>> removePermission(
            @Parameter(description = "ID vai trò") @PathVariable String id,
            @Parameter(description = "ID quyền") @RequestParam String permissionId) {
        
        log.info("Removing permission from role: {}", id);
        
        RoleMongo updatedRole = roleService.removePermission(id, permissionId);
        
        return ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã xóa quyền khỏi vai trò thành công")
                .data(updatedRole)
                .build());
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái vai trò", description = "Cập nhật trạng thái vai trò")
    public ResponseEntity<RestResponse<RoleMongo>> updateRoleStatus(
            @Parameter(description = "ID vai trò") @PathVariable String id,
            @Parameter(description = "Trạng thái mới") @RequestParam Boolean isActive) {
        
        log.info("Updating role status: {} to {}", id, isActive);
        
        RoleMongo updatedRole = roleService.updateRoleStatus(id, isActive);
        
        return ResponseEntity.ok(RestResponse.<RoleMongo>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật trạng thái vai trò thành công")
                .data(updatedRole)
                .build());
    }
    
    @GetMapping("/{id}/hierarchy")
    @Operation(summary = "Lấy cây phân cấp vai trò", description = "Lấy cây phân cấp vai trò")
    public ResponseEntity<RestResponse<List<RoleMongo>>> getRoleHierarchy(
            @Parameter(description = "ID vai trò") @PathVariable String id) {
        
        log.info("Getting role hierarchy for: {}", id);
        
        List<RoleMongo> hierarchy = roleService.getRoleHierarchy(id);
        
        return ResponseEntity.ok(RestResponse.<List<RoleMongo>>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy cây phân cấp vai trò thành công")
                .data(hierarchy)
                .build());
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa vai trò", description = "Xóa vai trò khỏi hệ thống")
    public ResponseEntity<RestResponse<Void>> deleteRole(
            @Parameter(description = "ID vai trò") @PathVariable String id) {
        
        log.info("Deleting role: {}", id);
        
        roleService.deleteRole(id);
        
        return ResponseEntity.ok(RestResponse.<Void>builder()
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã xóa vai trò thành công")
                .data(null)
                .build());
    }
}
