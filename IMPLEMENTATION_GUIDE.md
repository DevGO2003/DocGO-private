# 🚀 ORGANIZATION SYSTEM - IMPLEMENTATION GUIDE

> **Hướng dẫn đầy đủ để implement Organization System với Roles, Permissions và Unified Workflow**

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Roles & Permissions](#2-roles--permissions)
3. [Unified Workflow](#3-unified-workflow)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [API Endpoints](#6-api-endpoints)

---

## 1. SYSTEM OVERVIEW

### Architecture
```
Organization
├── Members → Roles → Permissions
├── Repositories → Contracts → Workflow
├── Chat System
└── Analytics
```

### Key Features
- ✅ 3 System Roles + Custom Roles
- ✅ Granular Permissions
- ✅ 1 Unified Workflow (auto-adjust steps)
- ✅ Repository Management
- ✅ Real-time Notifications

---

## 2. ROLES & PERMISSIONS

### 2.1 System Roles

#### OWNER
```json
{
  "name": "owner",
  "level": 0,
  "permissions": ["*"],
  "isSystem": true
}
```

#### ADMIN
```json
{
  "name": "admin",
  "level": 1,
  "permissions": ["org:*", "contract:*", "member:*", "role:*"],
  "isSystem": true
}
```

#### MEMBER
```json
{
  "name": "member",
  "level": 99,
  "permissions": ["contract:view:own", "contract:create"],
  "isSystem": true,
  "isDefault": true
}
```

### 2.2 Custom Roles

- **APPROVER**: Phê duyệt hợp đồng
- **LEGAL_REVIEWER**: Đánh giá pháp lý
- **FINANCE_REVIEWER**: Đánh giá tài chính
- **MANAGER**: Quản lý phòng ban
- **CONTRACT_CREATOR**: Tạo hợp đồng
- **VIEWER**: Chỉ xem

### 2.3 Permissions List

See `WORKFLOW_EXAMPLES.md` for full permission list.

---

## 3. UNIFIED WORKFLOW

### 3.1 Workflow Structure

```typescript
{
  steps: [
    {
      order: 1,
      name: "Department Review",
      enabled: true,  // Always
      approvers: { roles: ["manager"], minApprovals: 1 }
    },
    {
      order: 2,
      name: "Expert Review",
      enabled: (contract) => contract.value >= 100_000_000,
      approvers: { roles: ["legal_reviewer", "finance_reviewer"], minApprovals: 2 }
    },
    {
      order: 3,
      name: "Director Approval",
      enabled: (contract) => contract.value >= 1_000_000_000,
      approvers: { roles: ["admin"], minApprovals: 1 }
    }
  ]
}
```

### 3.2 How It Works

**Contract 50M:**
- Step 1 ✅ → Done (1 day)

**Contract 500M:**
- Step 1 ✅ → Step 2 ✅ → Done (3 days)

**Contract 2B:**
- Step 1 ✅ → Step 2 ✅ → Step 3 ✅ → Done (7 days)

---

## 4. BACKEND IMPLEMENTATION

### 4.1 New Entities

#### WorkflowEntity.java
```java
@Document(collection = "workflows")
public class WorkflowEntity {
    private String id;
    private String organizationId;
    private List<WorkflowStep> steps;
    private WorkflowSettings settings;
}
```

#### WorkflowInstanceEntity.java
```java
@Document(collection = "workflow_instances")
public class WorkflowInstanceEntity {
    private String id;
    private String contractId;
    private String workflowId;
    private Integer currentStep;
    private List<StepInstance> steps;
    private String status;
}
```

#### RepositoryEntity.java
```java
@Document(collection = "repositories")
public class RepositoryEntity {
    private String id;
    private String name;
    private String organizationId;
    private String type;
    private AccessControl accessControl;
}
```

### 4.2 Update FileEntity

```java
// Add to FileEntity.java
@Field("organization_id")
private String organizationId;

@Field("repository_id")
private String repositoryId;

@Field("workflow_instance_id")
private String workflowInstanceId;

@Field("approval_status")
private String approvalStatus; // draft, pending, approved, rejected
```

### 4.3 New Services

#### WorkflowService.java
```java
@Service
public class WorkflowService {
    WorkflowEntity createDefaultWorkflow(String organizationId);
    WorkflowInstanceEntity executeWorkflow(String contractId);
    void handleApproval(String instanceId, String userId, String action);
    void checkTimeout(String instanceId, int stepIndex);
}
```

#### RepositoryService.java
```java
@Service
public class RepositoryService {
    RepositoryEntity createRepository(CreateRepositoryRequest request);
    List<RepositoryEntity> getRepositoriesByOrganization(String orgId);
    void addContractToRepository(String repoId, String contractId);
}
```

---

## 5. FRONTEND IMPLEMENTATION

### 5.1 Routes

```
/organization/[id]
├── /                      → Dashboard
├── /repositories          → Repositories list
├── /contracts             → Contracts list
├── /members               → Members management
├── /roles                 → Roles management
├── /workflow              → Workflow config
└── /settings              → Settings
```

### 5.2 Key Components

- `OrganizationDashboard`
- `RepositoryList`
- `ContractWorkflowStatus`
- `RoleManagement`
- `WorkflowConfiguration`

---

## 6. API ENDPOINTS

### Organizations
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/{id}
PUT    /api/organizations/{id}
DELETE /api/organizations/{id}
```

### Repositories
```
GET    /api/organizations/{orgId}/repositories
POST   /api/organizations/{orgId}/repositories
GET    /api/repositories/{id}
PUT    /api/repositories/{id}
DELETE /api/repositories/{id}
```

### Workflows
```
GET    /api/organizations/{orgId}/workflow
PUT    /api/organizations/{orgId}/workflow
POST   /api/contracts/{contractId}/workflow/execute
POST   /api/workflow-instances/{id}/approve
POST   /api/workflow-instances/{id}/reject
```

### Roles
```
GET    /api/organizations/{orgId}/roles
POST   /api/organizations/{orgId}/roles
PUT    /api/roles/{id}
DELETE /api/roles/{id}
```

---

## 📚 REFERENCES

- **WORKFLOW_EXAMPLES.md**: Chi tiết ví dụ workflow
- **Backend entities**: `/backend/user-management-service/entity/`
- **Frontend types**: `/frontend/web-app/src/types/organization-extended.ts`

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend
- [ ] Create WorkflowEntity, WorkflowInstanceEntity, RepositoryEntity
- [ ] Update FileEntity with org/repo fields
- [ ] Implement WorkflowService
- [ ] Implement RepositoryService
- [ ] Update OrganizationService
- [ ] Create API endpoints
- [ ] Add default roles initialization
- [ ] Add default workflow initialization

### Frontend
- [ ] Create organization routes
- [ ] Implement OrganizationDashboard
- [ ] Implement RepositoryManagement
- [ ] Implement RoleManagement
- [ ] Implement WorkflowConfiguration
- [ ] Implement ContractWorkflowStatus
- [ ] Add permission checks
- [ ] Add real-time notifications

### Testing
- [ ] Test workflow execution
- [ ] Test role permissions
- [ ] Test repository access control
- [ ] Test approval flow
- [ ] Test escalation
- [ ] Test timeout handling

---

**Last Updated**: 2025-01-22
**Version**: 1.0.0
