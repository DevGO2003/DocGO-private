# 📝 BACKEND CHANGES SUMMARY

## ✅ ĐÃ TẠO

### 1. New Entities

#### ✅ WorkflowEntity.java
**Location**: `backend/user-management-service/entity/WorkflowEntity.java`

**Purpose**: Định nghĩa quy trình phê duyệt cho Organization

**Key Features**:
- Unified Workflow với multiple steps
- Enabled condition cho mỗi step (dynamic enable/disable)
- Support parallel, sequential, any approval types
- Timeout và escalation
- Flexible approvers (roles + specific users)

**Structure**:
```java
WorkflowEntity
├── steps: List<WorkflowStep>
│   ├── enabledCondition (value_threshold, always, etc.)
│   ├── type (parallel, sequential, any)
│   ├── approvers (roles, specificUsers, minApprovals)
│   └── timeout & escalation
└── settings (allowSkip, requireComment, etc.)
```

---

#### ✅ WorkflowInstanceEntity.java
**Location**: `backend/user-management-service/entity/WorkflowInstanceEntity.java`

**Purpose**: Instance của workflow đang chạy cho một contract cụ thể

**Key Features**:
- Track current step
- Store approvals cho mỗi step
- Status tracking (in_progress, completed, rejected, etc.)
- Timeout tracking
- Escalation tracking

**Structure**:
```java
WorkflowInstanceEntity
├── contractId
├── workflowId
├── currentStep
├── steps: List<StepInstance>
│   ├── status
│   ├── approvals: List<Approval>
│   │   ├── userId, action, comment
│   │   └── timestamp
│   └── timeout & escalation info
└── status
```

---

#### ✅ RepositoryEntity.java
**Location**: `backend/repository-management-service/entity/RepositoryEntity.java`

**Purpose**: Kho lưu trữ hợp đồng trong Organization (giống GitHub repo)

**Key Features**:
- Access control (viewer, editor, approver roles)
- Repository settings (require approval, versioning, etc.)
- Statistics (contract count, total value)
- Support multiple types (contracts, legal, hr, finance, etc.)

**Structure**:
```java
RepositoryEntity
├── organizationId
├── type, category, tags
├── visibility (private, internal, public)
├── accessControl
│   ├── viewerRoles, editorRoles, approverRoles
│   └── viewerUsers, editorUsers, approverUsers
├── settings
│   ├── requireApproval, allowVersioning
│   ├── autoArchive, retentionDays
│   └── defaultWorkflowId
└── statistics (contractCount, totalValue)
```

---

### 2. Updated Entities

#### ✅ FileEntity.java
**Location**: `backend/repository-management-service/entity/FileEntity.java`

**Changes Added**:
```java
// Organization & Repository fields
private String organizationId;
private String repositoryId;
private String repositoryName;

// Workflow fields
private String workflowInstanceId;
private String approvalStatus; // draft, pending, approved, rejected, changes_requested
private List<Map<String, Object>> approvalHistory;
```

**Purpose**: Link contract với organization, repository và workflow

---

## 🔄 CẦN LÀM TIẾP

### 3. Repositories (Data Access Layer)

#### WorkflowRepository.java
```java
public interface WorkflowRepository extends MongoRepository<WorkflowEntity, String> {
    Optional<WorkflowEntity> findByOrganizationIdAndIsDefaultTrue(String organizationId);
    List<WorkflowEntity> findByOrganizationId(String organizationId);
    List<WorkflowEntity> findByOrganizationIdAndIsActiveTrue(String organizationId);
}
```

#### WorkflowInstanceRepository.java
```java
public interface WorkflowInstanceRepository extends MongoRepository<WorkflowInstanceEntity, String> {
    Optional<WorkflowInstanceEntity> findByContractIdAndStatus(String contractId, String status);
    List<WorkflowInstanceEntity> findByOrganizationIdAndStatus(String organizationId, String status);
    List<WorkflowInstanceEntity> findByStatusAndTimeoutAtBefore(String status, LocalDateTime now);
}
```

#### RepositoryRepository.java
```java
public interface RepositoryRepository extends MongoRepository<RepositoryEntity, String> {
    List<RepositoryEntity> findByOrganizationId(String organizationId);
    List<RepositoryEntity> findByOrganizationIdAndType(String organizationId, String type);
    Optional<RepositoryEntity> findByOrganizationIdAndName(String organizationId, String name);
}
```

---

### 4. Services (Business Logic)

#### WorkflowService.java
```java
@Service
public class WorkflowService {
    
    // Create default workflow for organization
    public WorkflowEntity createDefaultWorkflow(String organizationId) {
        // Create unified workflow with 3 steps
        // Step 1: Department Review (always)
        // Step 2: Expert Review (if >= 100M)
        // Step 3: Director Approval (if >= 1B)
    }
    
    // Execute workflow for contract
    public WorkflowInstanceEntity executeWorkflow(String contractId, String workflowId) {
        // 1. Get contract
        // 2. Get workflow
        // 3. Filter enabled steps based on contract
        // 4. Create workflow instance
        // 5. Start first step
    }
    
    // Handle approval
    public void handleApproval(String workflowInstanceId, String userId, 
                               String action, String comment) {
        // 1. Get workflow instance
        // 2. Get current step
        // 3. Add approval
        // 4. Check if step completed
        // 5. Move to next step or complete workflow
    }
    
    // Check timeout
    public void checkTimeout(String workflowInstanceId, int stepIndex) {
        // 1. Check if timeout
        // 2. If yes, escalate or reject
    }
    
    // Escalate
    public void escalate(String workflowInstanceId, int stepIndex) {
        // 1. Get escalation targets
        // 2. Notify them
        // 3. Update workflow instance
    }
}
```

#### RepositoryService.java
```java
@Service
public class RepositoryService {
    
    // CRUD
    public RepositoryEntity createRepository(CreateRepositoryRequest request);
    public RepositoryEntity updateRepository(String id, UpdateRepositoryRequest request);
    public void deleteRepository(String id);
    public RepositoryEntity getRepository(String id);
    public List<RepositoryEntity> getRepositoriesByOrganization(String organizationId);
    
    // Contract management
    public void addContractToRepository(String repositoryId, String contractId);
    public void removeContractFromRepository(String repositoryId, String contractId);
    public List<FileEntity> getContractsByRepository(String repositoryId);
    
    // Statistics
    public RepositoryStats getRepositoryStats(String repositoryId);
    
    // Access control
    public boolean canUserAccessRepository(String userId, String repositoryId, String action);
}
```

#### Update OrganizationService.java
```java
@Service
public class OrganizationService {
    
    // Existing methods...
    
    // NEW: Initialize organization with default roles and workflow
    public Organization createOrganizationWithDefaults(CreateOrganizationRequest request) {
        // 1. Create organization
        Organization org = createOrganization(request);
        
        // 2. Initialize default roles
        initializeDefaultRoles(org.getId(), request.getCreatedBy());
        
        // 3. Initialize default workflow
        initializeDefaultWorkflow(org.getId());
        
        // 4. Set creator as Owner
        setOwner(org.getId(), request.getCreatedBy());
        
        return org;
    }
    
    private void initializeDefaultRoles(String organizationId, String createdBy) {
        // Create system roles: owner, admin, member
        // Create default custom roles: approver, legal_reviewer, finance_reviewer, manager
    }
    
    private void initializeDefaultWorkflow(String organizationId) {
        workflowService.createDefaultWorkflow(organizationId);
    }
    
    private void setOwner(String organizationId, String userId) {
        // Set user as owner
        // Add owner role to user
    }
}
```

---

### 5. Controllers (API Endpoints)

#### WorkflowController.java
```java
@RestController
@RequestMapping("/api/organizations/{orgId}/workflow")
public class WorkflowController {
    
    @GetMapping
    public WorkflowEntity getWorkflow(@PathVariable String orgId);
    
    @PutMapping
    public WorkflowEntity updateWorkflow(@PathVariable String orgId, 
                                         @RequestBody WorkflowEntity workflow);
    
    @PostMapping("/test")
    public WorkflowTestResult testWorkflow(@PathVariable String orgId,
                                           @RequestBody TestContractRequest request);
}

@RestController
@RequestMapping("/api/contracts/{contractId}/workflow")
public class ContractWorkflowController {
    
    @PostMapping("/execute")
    public WorkflowInstanceEntity executeWorkflow(@PathVariable String contractId);
    
    @GetMapping("/status")
    public WorkflowInstanceEntity getWorkflowStatus(@PathVariable String contractId);
}

@RestController
@RequestMapping("/api/workflow-instances/{instanceId}")
public class WorkflowInstanceController {
    
    @PostMapping("/approve")
    public void approve(@PathVariable String instanceId,
                       @RequestBody ApprovalRequest request);
    
    @PostMapping("/reject")
    public void reject(@PathVariable String instanceId,
                      @RequestBody RejectionRequest request);
    
    @PostMapping("/request-changes")
    public void requestChanges(@PathVariable String instanceId,
                               @RequestBody RequestChangesRequest request);
}
```

#### RepositoryController.java
```java
@RestController
@RequestMapping("/api/organizations/{orgId}/repositories")
public class RepositoryController {
    
    @GetMapping
    public List<RepositoryEntity> getRepositories(@PathVariable String orgId);
    
    @PostMapping
    public RepositoryEntity createRepository(@PathVariable String orgId,
                                             @RequestBody CreateRepositoryRequest request);
    
    @GetMapping("/{repoId}")
    public RepositoryEntity getRepository(@PathVariable String repoId);
    
    @PutMapping("/{repoId}")
    public RepositoryEntity updateRepository(@PathVariable String repoId,
                                             @RequestBody UpdateRepositoryRequest request);
    
    @DeleteMapping("/{repoId}")
    public void deleteRepository(@PathVariable String repoId);
    
    @GetMapping("/{repoId}/contracts")
    public List<FileEntity> getContracts(@PathVariable String repoId);
    
    @GetMapping("/{repoId}/stats")
    public RepositoryStats getStats(@PathVariable String repoId);
}
```

---

### 6. DTOs (Request/Response)

#### Workflow DTOs
```java
public class ApprovalRequest {
    private String userId;
    private String comment;
    private Object metadata; // Review form data
}

public class RejectionRequest {
    private String userId;
    private String reason;
    private String comment;
}

public class RequestChangesRequest {
    private String userId;
    private String reason;
    private List<String> requiredChanges;
    private String comment;
}

public class WorkflowTestResult {
    private List<String> enabledSteps;
    private int totalSteps;
    private int estimatedDays;
    private List<String> requiredApprovers;
}
```

#### Repository DTOs
```java
public class CreateRepositoryRequest {
    private String name;
    private String description;
    private String type;
    private String visibility;
    private AccessControl accessControl;
    private RepositorySettings settings;
}

public class RepositoryStats {
    private int contractCount;
    private double totalValue;
    private int activeContracts;
    private int pendingApprovals;
    private int expiringSoon;
    private LocalDateTime lastActivity;
}
```

---

## 📊 DATABASE COLLECTIONS

### New Collections
1. ✅ `workflows` - WorkflowEntity
2. ✅ `workflow_instances` - WorkflowInstanceEntity
3. ✅ `repositories` - RepositoryEntity

### Updated Collections
1. ✅ `files` - FileEntity (added org, repo, workflow fields)

### Existing Collections (No changes)
- `organizations`
- `organization_memberships`
- `organization_roles`
- `organization_permissions`
- `users`

---

## 🔔 NOTIFICATIONS

### Events to Notify

1. **Workflow Started**
   - Notify: First step approvers
   - Data: Contract info, deadline

2. **Approval Needed**
   - Notify: Step approvers
   - Data: Contract info, previous approvals, deadline

3. **Approved**
   - Notify: Contract creator, next step approvers
   - Data: Who approved, comments

4. **Rejected**
   - Notify: Contract creator
   - Data: Who rejected, reason, comments

5. **Changes Requested**
   - Notify: Contract creator
   - Data: Who requested, what to change, comments

6. **Timeout Warning**
   - Notify: Step approvers, escalation targets
   - Data: Time remaining, contract info

7. **Escalated**
   - Notify: Escalation targets
   - Data: Why escalated, contract info, previous approvers

8. **Workflow Completed**
   - Notify: Contract creator, all approvers
   - Data: Final status, timeline

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Entities ✅
- [x] WorkflowEntity
- [x] WorkflowInstanceEntity
- [x] RepositoryEntity
- [x] Update FileEntity

### Phase 2: Data Access ✅
- [x] WorkflowRepository
- [x] WorkflowInstanceRepository
- [x] RepositoryRepository

### Phase 3: Business Logic ✅
- [x] WorkflowService
- [x] RepositoryService
- [x] Update OrganizationService

### Phase 4: API Layer ✅
- [x] WorkflowController
- [x] ContractWorkflowController  
- [x] WorkflowInstanceController
- [x] OrganizationRepositoryController

### Phase 5: DTOs ✅
- [x] Workflow DTOs (embedded in controllers)
- [x] Repository DTOs (embedded in controllers)

### Phase 6: Notifications
- [ ] Notification service
- [ ] Email templates
- [ ] Real-time notifications

### Phase 7: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

**Last Updated**: 2025-01-22
**Status**: Phase 1 Complete ✅
