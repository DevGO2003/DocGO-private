<!-- df49ee25-3178-4cfb-9f26-5ed2a9a7539f 288702cc-2eba-415f-bbf1-3af536230b24 -->
# Merge Organization Features từ GitHub (vibe-coding branch)

## Phạm vi Merge

### Backend (User Management Service)

- **3 Controllers mới** (GitHub có, local THIẾU):

1. `OrganizationController.java` (34KB)
2. `OrganizationPermissionController.java` (15KB) 
3. `OrganizationRoleController.java` (14KB)

### Frontend (Web App)

- **7 Components mới** trong `src/components/organization/`:

1. `ChatManagement.tsx` (45KB)
2. `MembersManagement.tsx` (43KB)
3. `OrganizationFormModal.tsx` (7KB)
4. `OrganizationList.tsx` (14KB)
5. `OrganizationSelector.tsx` (5KB)
6. `PermissionsManagement.tsx` (21KB)
7. `RolesManagement.tsx` (29KB)

- **Types mới**: `src/types/organization.ts` (1.8KB)
- **Settings page update**: `src/app/settings/page.tsx` (7KB)

## Chiến lược Merge

1. **Đọc file từ GitHub** (sử dụng download_url)
2. **Tạo file mới trong local** theo đúng cấu trúc
3. **Tuân thủ Cursor rules**:

- API Standards (URL, Response format, OpenAPI docs)
- Package structure: `com.devgo2003.docgo.backend.user_service`
- RestResponse wrapper cho mọi API response
- Pagination standards (pageNumber, pageSize, sortBy, sortDirection)

## Implementation Steps

### 0) Chuẩn bị nhánh và đồng bộ nguồn (đọc/ghi song song an toàn)

- Làm việc trên nhánh local hiện tại; chỉ đọc GitHub branch `vibe-coding` để lấy nội dung file gốc.
- Mọi file mới được thêm theo đúng đường dẫn hiện tại, không reset repo local.

### 0.1) Quy tắc đồng bộ và fallback

- Ưu tiên nội dung file từ `vibe-coding` (mới hơn) nhưng vẫn tuân thủ API Standards dự án hiện tại.
- Nếu compile báo thiếu DTO/exception/service, bổ sung đúng file tương ứng từ `vibe-coding` (không tự chế).
- Frontend: nếu thiếu API client, thêm `lib/apis/organization-api.ts` từ `vibe-coding` (hoặc bật mock sẵn trong components).
- Giữ nguyên cấu trúc RestResponse và URL base `/api/v1/user-management-service/...`.

### A) Backend - User Management Service

#### Step 1: Create OrganizationController.java

- **Path**: `backend/user-management-service/src/main/java/com/devgo2003/docgo/backend/user_service/controller/OrganizationController.java`
- **Source**: GitHub vibe-coding branch
- **Content**: 34KB controller với Organization CRUD APIs
- **Validation checklist**:
- [ ] Package: `package com.devgo2003.docgo.backend.user_service.controller;`
- [ ] Base path: `@RequestMapping("/api/v1/user-management-service/organizations")`
- [ ] OpenAPI tag: `@Tag(name = "🏢 APIs Quản lý Tổ chức")`
- [ ] All methods return `ResponseEntity<RestResponse<T>>`
- [ ] Pagination params: pageNumber, pageSize, sortBy, sortDirection
- [ ] Inject `OrganizationService` (already exists in local)

#### Step 2: Create OrganizationPermissionController.java

- **Path**: `backend/user-management-service/src/main/java/com/devgo2003/docgo/backend/user_service/controller/OrganizationPermissionController.java`
- **Source**: GitHub vibe-coding branch  
- **Content**: 15KB controller for Organization Permissions
- **Validation checklist**:
- [ ] Package: `package com.devgo2003.docgo.backend.user_service.controller;`
- [ ] Base path: `@RequestMapping("/api/v1/user-management-service/organization-permissions")`
- [ ] OpenAPI tag: `@Tag(name = "🔐 APIs Quản lý Quyền Tổ chức")`
- [ ] RestResponse wrapper
- [ ] Inject required services

#### Step 3: Create OrganizationRoleController.java

- **Path**: `backend/user-management-service/src/main/java/com/devgo2003/docgo/backend/user_service/controller/OrganizationRoleController.java`
- **Source**: GitHub vibe-coding branch
- **Content**: 14KB controller for Organization Roles
- **Validation checklist**:
- [ ] Package: `package com.devgo2003.docgo.backend.user_service.controller;`
- [ ] Base path: `@RequestMapping("/api/v1/user-management-service/organization-roles")`
- [ ] OpenAPI tag: `@Tag(name = "👥 APIs Quản lý Vai trò Tổ chức")`
- [ ] RestResponse wrapper
- [ ] Inject required services

#### Step 4: Update SecurityConfig.java (if needed)

- **Path**: `backend/user-management-service/src/main/java/com/devgo2003/docgo/backend/user_service/security/SecurityConfig.java`
- **Action**: Permit organization endpoints if authentication required
- **Add**: `.requestMatchers("/api/v1/user-management-service/organizations/**").authenticated()`

### B) Frontend - Web App

#### Step 5: Create Organization Types

- **Path**: `frontend/web-app/src/types/organization.ts`
- **Source**: GitHub vibe-coding branch (1.8KB)
- **Content**: TypeScript interfaces for Organization, OrganizationMember, OrganizationRole, etc.

#### Step 6: Create Organization Components Folder

- **Path**: `frontend/web-app/src/components/organization/`
- **Action**: Create folder (if not exists)

#### Step 7: Create Organization Components (7 files)

**7.1) ChatManagement.tsx**

- **Size**: 45KB
- **Purpose**: Organization chat/communication management
- **Validation**: Check imports, API endpoints, types

**7.2) MembersManagement.tsx**

- **Size**: 43KB  
- **Purpose**: Manage organization members
- **Validation**: API calls to `/organizations/{id}/members`

**7.3) OrganizationFormModal.tsx**

- **Size**: 7KB
- **Purpose**: Create/Edit organization modal form
- **Validation**: API calls to POST/PUT `/organizations`

**7.4) OrganizationList.tsx**

- **Size**: 14KB
- **Purpose**: List all organizations with pagination
- **Validation**: API calls to GET `/organizations`

**7.5) OrganizationSelector.tsx**

- **Size**: 5KB
- **Purpose**: Dropdown selector for switching organizations
- **Validation**: State management, API integration

**7.6) PermissionsManagement.tsx**

- **Size**: 21KB
- **Purpose**: Manage organization permissions
- **Validation**: API calls to `/organization-permissions`

**7.7) RolesManagement.tsx**

- **Size**: 29KB
- **Purpose**: Manage organization roles
- **Validation**: API calls to `/organization-roles`

#### Step 8: Update Settings Page

- **Path**: `frontend/web-app/src/app/settings/page.tsx`
- **Source**: GitHub vibe-coding branch (7KB)
- **Action**: Replace or merge with existing settings page
- **Validation**: Check if current settings page exists, backup if needed

### C) Dependency Check

#### Step 9: Check Backend Dependencies

- **File**: `backend/user-management-service/pom.xml`
- **Check**: Ensure all dependencies are satisfied
- Spring Boot Web
- Spring Data MongoDB
- SpringDoc OpenAPI
- Lombok
- Validation

#### Step 10: Check Frontend Dependencies

- **File**: `frontend/web-app/package.json`
- **Check**: Ensure UI libraries are installed
- React Hook Form
- Zod (validation)
- Tailwind CSS
- Lucide icons

### D) Testing & Validation

#### Step 11: Compile Backend

- **Command**: `cd backend/user-management-service && mvn clean compile`
- **Expected**: No compilation errors
- **Fix**: If errors, check imports, package names, missing services

#### Step 12: Start Backend Service

- **Command**: `mvn spring-boot:run`
- **Test**: Access `http://localhost:8001/docs#/`
- **Verify**: See 3 new tags in Swagger UI:
- 🏢 APIs Quản lý Tổ chức
- 🔐 APIs Quản lý Quyền Tổ chức
- 👥 APIs Quản lý Vai trò Tổ chức

#### Step 13: Compile Frontend

- **Command**: `cd frontend/web-app && npm run build`
- **Expected**: No TypeScript errors
- **Fix**: If errors, check type imports, component props

#### Step 14: Test Organization APIs

- **Endpoint 1**: `GET /api/v1/user-management-service/organizations`
- **Endpoint 2**: `POST /api/v1/user-management-service/organizations`
- **Endpoint 3**: `GET /api/v1/user-management-service/organizations/{id}`
- **Expected**: RestResponse format with proper data

#### Step 15: Test Frontend Components

- **Access**: `http://localhost:3000/settings`
- **Verify**: Organization management tab visible
- **Test**: Create, edit, delete organization
- **Test**: Manage members, roles, permissions

## Rollback Strategy

If merge causes issues:

1. **Backend**: Remove 3 controller files
2. **Frontend**: Remove `src/components/organization/` folder and `src/types/organization.ts`
3. **Revert**: Settings page to original version
4. **Commit**: All changes in separate branch for easy rollback

## Notes

- All files will be read from GitHub using MCP Github tool
- Files will be created with exact content from GitHub
- Cursor rules will be applied during validation phase
- No modification to existing Entity/Service/Repository classes (already compatible)
- Focus on adding missing Controller + Frontend components only

### To-dos

- [ ] Read OrganizationController.java from GitHub and create in local
- [ ] Read OrganizationPermissionController.java from GitHub and create in local
- [ ] Read OrganizationRoleController.java from GitHub and create in local
- [ ] Create organization.ts types file in frontend
- [ ] Create 7 organization components in frontend (ChatManagement, MembersManagement, OrganizationFormModal, OrganizationList, OrganizationSelector, PermissionsManagement, RolesManagement)
- [ ] Update settings page to include organization management
- [ ] Compile backend to check for errors
- [ ] Compile frontend to check for TypeScript errors
- [ ] Test organization API endpoints via Swagger UI
- [ ] Test organization UI components in browser