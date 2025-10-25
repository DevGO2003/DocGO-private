# PHÂN TÍCH BACKEND ORGANIZATION - GAPS & RECOMMENDATIONS

## TỔNG QUAN KIỂM TRA

Đã kiểm tra backend User Management Service để đánh giá khả năng hỗ trợ thiết kế frontend Organization đã đề xuất.

---

## ✅ CÓ SẴN TRONG BACKEND

### 1. Organization Management APIs
- ✅ `GET /api/v1/user-management-service/organizations` - Lấy danh sách tổ chức
- ✅ `GET /api/v1/user-management-service/organizations/{id}` - Chi tiết tổ chức
- ✅ `POST /api/v1/user-management-service/organizations` - Tạo tổ chức mới
- ✅ `PUT /api/v1/user-management-service/organizations/{id}` - Cập nhật tổ chức
- ✅ `DELETE /api/v1/user-management-service/organizations/{id}` - Xóa tổ chức (soft delete)

### 2. Member Management APIs
- ✅ `POST /api/v1/user-management-service/organizations/{id}/members` - Mời thành viên
- ✅ `GET /api/v1/user-management-service/organizations/{id}/members` - Danh sách thành viên
- ✅ `PUT /api/v1/user-management-service/organizations/{id}/members/{userId}` - Cập nhật thành viên
- ✅ `DELETE /api/v1/user-management-service/organizations/{id}/members/{userId}` - Xóa thành viên

### 3. Admin & Ownership APIs
- ✅ `POST /api/v1/user-management-service/organizations/{id}/admins` - Thêm admin
- ✅ `DELETE /api/v1/user-management-service/organizations/{id}/admins/{userId}` - Xóa admin
- ✅ `POST /api/v1/user-management-service/organizations/{id}/transfer-ownership` - Chuyển quyền sở hữu

### 4. Invitation APIs
- ✅ `GET /api/v1/user-management-service/organizations/invitations/pending` - Lấy lời mời chờ xử lý
- ✅ `GET /api/v1/user-management-service/organizations/users/available` - Danh sách user có thể mời

### 5. Workflow Support
- ✅ `WorkflowEntity` với conditional steps based on `enabledCondition`
- ✅ `WorkflowService.createDefaultWorkflow()` - Tạo workflow mặc định
- ✅ `WorkflowService.getOrganizationWorkflow()` - Lấy workflow của org

### 6. Role & Permission System
- ✅ `OrganizationRole` entity với `permissionIds`
- ✅ `OrganizationPermission` entity với `resource` + `action`
- ✅ `OrganizationRoleService.initializeDefaultRoles()`
- ✅ `OrganizationPermissionService.initializeDefaultPermissions()`

### 7. Data Models
- ✅ `Organization` với `ownerUserId`, `adminUserIds`, `memberCount`
- ✅ `OrganizationMembership` với `roleIds`, `isAdmin`, `status`
- ✅ `Invitation` với `email`, `token`, `expiresAt`, `status`

---

## ❌ THIẾU HOẶC CẦN BỔ SUNG

### 1. 🔴 CRITICAL: Switch Organization API

**Vấn đề:**
- Frontend cần API để user chuyển đổi giữa các tổ chức
- Backend chưa có endpoint `/users/me/switch-organization`
- Không có field `lastActiveOrg` trong User entity

**Cần bổ sung:**

**Backend: UserController.java**
```java
@PostMapping("/api/v1/user-management-service/users/me/switch-organization")
public ResponseEntity<RestResponse<UserResponse>> switchOrganization(
    @RequestBody SwitchOrganizationRequest request) {
    
    String userId = getCurrentUserId(); // From security context
    
    // Validate user thuộc organization này
    organizationService.validateUserMembership(userId, request.getOrganizationId());
    
    // Update lastActiveOrganization
    userService.updateLastActiveOrganization(userId, request.getOrganizationId());
    
    // Return user info với active org mới
    UserResponse user = userService.getUserWithOrganizations(userId);
    
    return ResponseEntity.ok(RestResponse.<UserResponse>builder()
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã chuyển tổ chức thành công")
        .data(user)
        .build());
}
```

**User Entity cần thêm:**
```java
@Document(collection = "users")
public class User {
    // ... existing fields
    
    @Field("last_active_organization_id")
    private String lastActiveOrganizationId;  // ← THÊM FIELD NÀY
}
```

---

### 2. 🔴 CRITICAL: Get User's Organizations API

**Vấn đề:**
- Frontend cần API lấy tất cả tổ chức mà user thuộc về
- Kèm theo vai trò và quyền hạn của user trong từng tổ chức

**Cần bổ sung:**

**Backend: UserController.java**
```java
@GetMapping("/api/v1/user-management-service/users/me/organizations")
public ResponseEntity<RestResponse<List<UserOrganizationResponse>>> getMyOrganizations() {
    
    String userId = getCurrentUserId();
    
    List<UserOrganizationResponse> organizations = 
        organizationService.getOrganizationsByUserId(userId);
    
    return ResponseEntity.ok(RestResponse.<List<UserOrganizationResponse>>builder()
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã lấy danh sách tổ chức thành công")
        .data(organizations)
        .build());
}
```

**DTO mới:**
```java
@Data
@Builder
public class UserOrganizationResponse {
    private String organizationId;
    private String organizationName;
    private String organizationCode;
    private String myRole;  // "owner", "manager", "member"
    private List<String> myPermissions;
    private Boolean isActive;  // Tổ chức đang active
    private Integer memberCount;
    private LocalDateTime joinedAt;
}
```

---

### 3. 🟡 IMPORTANT: Simplified Role System

**Vấn đề:**
- Backend có `OrganizationRole` và `OrganizationPermission` riêng biệt
- Design mới chỉ cần 3 roles: owner, manager, member
- Permissions gán trực tiếp cho member, không qua role entity

**Đề xuất:**
- Giữ nguyên entities hiện tại (để tương thích)
- Nhưng simplify logic trong service layer
- `OrganizationMembership` đã có `roleIds` và có thể thêm `permissions` array

**Cần điều chỉnh:**

**OrganizationMembership.java - Thêm field:**
```java
@Document(collection = "organization_memberships")
public class OrganizationMembership {
    // ... existing fields
    
    @Field("role_ids")
    private Set<String> roleIds;  // Keep for compatibility
    
    @Field("simple_role")
    private String simpleRole;  // ← THÊM: "owner" | "manager" | "member"
    
    @Field("permissions")
    private List<String> permissions;  // ← THÊM: ["approve:legal", "approve:finance"]
}
```

**OrganizationMemberInviteRequest.java - Điều chỉnh:**
```java
@Data
public class OrganizationMemberInviteRequest {
    private String email;
    private String role;  // ← ĐỔI: "owner" | "manager" | "member"
    private List<String> permissions;  // ← THÊM: Chỉ cho manager
    
    // DEPRECATED: roleIds
}
```

---

### 4. 🟡 IMPORTANT: Workflow Configuration API

**Vấn đề:**
- Có `WorkflowService` và `WorkflowEntity` nhưng thiếu APIs để frontend cấu hình

**Cần bổ sung:**

**Backend: OrganizationController.java**
```java
@GetMapping("/api/v1/user-management-service/organizations/{id}/workflow")
public ResponseEntity<RestResponse<WorkflowEntity>> getWorkflow(
    @PathVariable String id) {
    
    WorkflowEntity workflow = organizationService.getOrganizationWorkflow(id);
    
    return ResponseEntity.ok(RestResponse.<WorkflowEntity>builder()
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã lấy cấu hình workflow thành công")
        .data(workflow)
        .build());
}

@PutMapping("/api/v1/user-management-service/organizations/{id}/workflow")
public ResponseEntity<RestResponse<WorkflowEntity>> updateWorkflow(
    @PathVariable String id,
    @Valid @RequestBody WorkflowUpdateRequest request) {
    
    // Chỉ Owner mới được update workflow
    validateOwnerPermission(id, getCurrentUserId());
    
    WorkflowEntity workflow = workflowService.updateWorkflow(id, request);
    
    return ResponseEntity.ok(RestResponse.<WorkflowEntity>builder()
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã cập nhật workflow thành công")
        .data(workflow)
        .build());
}
```

---

### 5. 🟢 NICE TO HAVE: Accept Invitation API

**Vấn đề:**
- Có API lấy pending invitations
- Nhưng thiếu API để accept/reject invitation

**Cần bổ sung:**

```java
@PostMapping("/api/v1/user-management-service/invitations/{token}/accept")
public ResponseEntity<RestResponse<OrganizationMembershipResponse>> acceptInvitation(
    @PathVariable String token) {
    
    String userId = getCurrentUserId();
    
    OrganizationMembershipResponse membership = 
        organizationService.acceptInvitation(token, userId);
    
    return ResponseEntity.ok(RestResponse.<OrganizationMembershipResponse>builder()
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã chấp nhận lời mời thành công")
        .data(membership)
        .build());
}

@PostMapping("/api/v1/user-management-service/invitations/{token}/reject")
public ResponseEntity<RestResponse<Void>> rejectInvitation(
    @PathVariable String token) {
    
    organizationService.rejectInvitation(token);
    
    return ResponseEntity.ok(RestResponse.<Void>builder()
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã từ chối lời mời")
        .data(null)
        .build());
}
```

---

### 6. 🟢 NICE TO HAVE: Search Organizations

**Frontend có thể cần tìm kiếm tổ chức:**

```java
@GetMapping("/api/v1/user-management-service/organizations/search")
public ResponseEntity<RestResponse<Page<OrganizationResponse>>> searchOrganizations(
    @RequestParam(required = false) String name,
    @RequestParam(required = false) String code,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    
    Page<OrganizationResponse> organizations = 
        organizationService.searchOrganizations(name, code, null, page, size, "createdAt", "DESC");
    
    return ResponseEntity.ok(RestResponse.<Page<OrganizationResponse>>builder()
        .statusCode(200)
        .shortMessage("Success")
        .data(organizations)
        .build());
}
```

---

## 🔧 CẦN ĐIỀU CHỈNH TRONG BACKEND

### 1. OrganizationService.initializeDefaultData()

**Hiện tại:**
```java
private void initializeDefaultData(String orgId) {
    permissionService.initializeDefaultPermissions(orgId);
    roleService.initializeDefaultRoles(orgId);
    workflowService.createDefaultWorkflow(orgId);
}
```

**Cần điều chỉnh Workflow mặc định:**
```java
public WorkflowEntity createDefaultWorkflow(String orgId) {
    return WorkflowEntity.builder()
        .organizationId(orgId)
        .name("Default Approval Workflow")
        .isDefault(true)
        .isActive(true)
        .steps(Arrays.asList(
            // Step 1: Basic approval (< 100M)
            WorkflowStep.builder()
                .order(1)
                .name("Phê duyệt cơ bản")
                .type("any")
                .enabledCondition(EnabledCondition.builder()
                    .type("value_threshold")
                    .field("value")
                    .operator("<")
                    .value(100_000_000)
                    .build())
                .approvers(Approvers.builder()
                    .roles(List.of("manager"))
                    .minApprovals(1)
                    .build())
                .timeoutHours(24)
                .build(),
                
            // Step 2: Legal approval (100M - 1B)
            WorkflowStep.builder()
                .order(2)
                .name("Phê duyệt pháp lý")
                .type("sequential")
                .enabledCondition(EnabledCondition.builder()
                    .type("value_threshold")
                    .field("value")
                    .operator(">=")
                    .value(100_000_000)
                    .build())
                .approvers(Approvers.builder()
                    .specificPermissions(List.of("approve:legal"))
                    .minApprovals(1)
                    .build())
                .timeoutHours(48)
                .build(),
                
            // Step 3: Finance approval (100M - 1B)
            WorkflowStep.builder()
                .order(3)
                .name("Phê duyệt tài chính")
                .type("sequential")
                .enabledCondition(EnabledCondition.builder()
                    .type("value_threshold")
                    .field("value")
                    .operator(">=")
                    .value(100_000_000)
                    .build())
                .approvers(Approvers.builder()
                    .specificPermissions(List.of("approve:finance"))
                    .minApprovals(1)
                    .build())
                .timeoutHours(48)
                .build(),
                
            // Step 4: Executive approval (>= 1B)
            WorkflowStep.builder()
                .order(4)
                .name("Phê duyệt cấp điều hành")
                .type("sequential")
                .enabledCondition(EnabledCondition.builder()
                    .type("value_threshold")
                    .field("value")
                    .operator(">=")
                    .value(1_000_000_000)
                    .build())
                .approvers(Approvers.builder()
                    .specificPermissions(List.of("approve:executive"))
                    .minApprovals(1)
                    .build())
                .timeoutHours(72)
                .build()
        ))
        .settings(WorkflowSettings.builder()
            .allowSkip(false)
            .requireComment(true)
            .notifyOnEachStep(true)
            .autoEscalate(true)
            .build())
        .createdBy("system")
        .build();
}
```

**Cần thêm field trong Approvers:**
```java
public static class Approvers {
    @Field("roles")
    private List<String> roles;
    
    @Field("specific_users")
    private List<String> specificUsers;
    
    @Field("specific_permissions")  // ← THÊM FIELD NÀY
    private List<String> specificPermissions;  // ["approve:legal", "approve:finance"]
    
    @Field("min_approvals")
    private Integer minApprovals;
}
```

---

### 2. Default Permissions cần chuẩn hóa

**Hiện tại permissions nên bao gồm:**
```java
public void initializeDefaultPermissions(String orgId) {
    List<OrganizationPermission> permissions = Arrays.asList(
        // Contract permissions
        createPermission(orgId, "contract:create", "Tạo hợp đồng", "contract", "create"),
        createPermission(orgId, "contract:view:own", "Xem HĐ của mình", "contract", "view:own"),
        createPermission(orgId, "contract:view:all", "Xem tất cả HĐ", "contract", "view:all"),
        createPermission(orgId, "contract:edit:own", "Sửa HĐ của mình", "contract", "edit:own"),
        createPermission(orgId, "contract:edit:all", "Sửa tất cả HĐ", "contract", "edit:all"),
        createPermission(orgId, "contract:delete", "Xóa hợp đồng", "contract", "delete"),
        createPermission(orgId, "contract:approve", "Phê duyệt chung", "contract", "approve"),
        createPermission(orgId, "contract:approve:legal", "Phê duyệt pháp lý", "contract", "approve:legal"),
        createPermission(orgId, "contract:approve:finance", "Phê duyệt tài chính", "contract", "approve:finance"),
        createPermission(orgId, "contract:approve:executive", "Phê duyệt cấp cao", "contract", "approve:executive"),
        createPermission(orgId, "contract:sign", "Ký điện tử", "contract", "sign"),
        
        // Member permissions
        createPermission(orgId, "member:invite", "Mời thành viên", "member", "invite"),
        createPermission(orgId, "member:edit", "Sửa thành viên", "member", "edit"),
        createPermission(orgId, "member:remove", "Xóa thành viên", "member", "remove"),
        
        // Organization permissions
        createPermission(orgId, "org:settings", "Quản lý settings", "organization", "settings"),
        createPermission(orgId, "org:billing", "Quản lý thanh toán", "organization", "billing"),
        createPermission(orgId, "org:workflow", "Cấu hình workflow", "organization", "workflow")
    );
    
    permissionRepository.saveAll(permissions);
}
```

---

## 📋 CHECKLIST TRIỂN KHAI

### Phase 1: Critical APIs (Cần làm ngay)
- [ ] `POST /users/me/switch-organization` - Switch tổ chức
- [ ] `GET /users/me/organizations` - Lấy danh sách tổ chức của user
- [ ] Thêm field `lastActiveOrganizationId` vào User entity
- [ ] Thêm field `simpleRole` và `permissions` vào OrganizationMembership
- [ ] Điều chỉnh `OrganizationMemberInviteRequest` để support role + permissions

### Phase 2: Workflow APIs
- [ ] `GET /organizations/{id}/workflow` - Lấy workflow config
- [ ] `PUT /organizations/{id}/workflow` - Update workflow config
- [ ] Điều chỉnh `createDefaultWorkflow()` theo design mới
- [ ] Thêm `specificPermissions` vào `Approvers`

### Phase 3: Invitation Flow
- [ ] `POST /invitations/{token}/accept` - Accept invitation
- [ ] `POST /invitations/{token}/reject` - Reject invitation
- [ ] Email service để gửi invitation emails

### Phase 4: Nice to Have
- [ ] `GET /organizations/search` - Tìm kiếm tổ chức
- [ ] Audit logs cho organization activities
- [ ] Notification system cho approvals

---

## KẾT LUẬN

### ✅ Backend CÓ THỂ support design mới với một số bổ sung:

**Điểm mạnh:**
- Đã có đầy đủ entities và relationships
- Workflow system đã linh hoạt với conditional steps
- Role & Permission system đã có sẵn

**Cần bổ sung:**
- 2-3 APIs critical cho multi-org switching
- Điều chỉnh invitation flow
- Simplify role system từ nhiều roles → 3 roles + permissions

**Thời gian ước tính:**
- Phase 1 (Critical): 2-3 ngày
- Phase 2 (Workflow): 1-2 ngày
- Phase 3 (Invitation): 1 ngày
- Total: **4-6 ngày** để backend ready cho frontend mới

### 🎯 Recommendation:
Backend hiện tại đã tốt và có thể hỗ trợ design mới. Chỉ cần bổ sung APIs trong Phase 1 là có thể bắt đầu develop frontend ngay.
