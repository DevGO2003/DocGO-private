# Organization Feature - Usage Examples

## 📚 Import Components & Hooks

```tsx
// Import từ organization feature
import {
  // Components
  OrganizationSelector,
  PermissionGuard,
  
  // Hooks
  usePermission,
  useIsOwner,
  useIsManager,
  useCanApprove,
  useCanManageMembers,
  useCanManageSettings,
  
  // Types
  MemberRole,
  ManagerPermission,
  Organization,
} from '@features/organization';
```

---

## 1️⃣ OrganizationSelector Component

### **Basic Usage**
```tsx
import { OrganizationSelector } from '@features/organization';

function Header() {
  const [currentOrgId, setCurrentOrgId] = useState('org-123');

  return (
    <header>
      <OrganizationSelector
        currentOrganizationId={currentOrgId}
        onOrganizationChange={(orgId) => {
          setCurrentOrgId(orgId);
          // Auto navigate hoặc reload data
        }}
      />
    </header>
  );
}
```

### **In DashboardLayout**
```tsx
import { OrganizationSelector } from '@features/organization';

function DashboardLayout() {
  const { id: orgId } = useParams();

  return (
    <div className="layout">
      <header className="flex items-center gap-4">
        <Logo />
        <OrganizationSelector currentOrganizationId={orgId} />
        <UserMenu />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 2️⃣ PermissionGuard Component

### **Role-Based Access**
```tsx
import { PermissionGuard, MemberRole } from '@features/organization';

function SettingsPage({ organization }) {
  return (
    <div>
      {/* Chỉ Owner và Manager được vào */}
      <PermissionGuard
        requiredRole={MemberRole.MANAGER}
        currentRole={organization.userRole}
        currentPermissions={organization.userPermissions}
      >
        <AdvancedSettings />
      </PermissionGuard>

      {/* Chỉ Owner */}
      <PermissionGuard
        requiredRole={MemberRole.OWNER}
        currentRole={organization.userRole}
        currentPermissions={organization.userPermissions}
      >
        <DangerZone />
      </PermissionGuard>
    </div>
  );
}
```

### **Permission-Based Access**
```tsx
import { PermissionGuard } from '@features/organization';

function MembersPage({ organization }) {
  return (
    <div>
      {/* Chỉ có permission member:invite mới thấy button */}
      <PermissionGuard
        requiredPermission="member:invite"
        currentRole={organization.userRole}
        currentPermissions={organization.userPermissions}
      >
        <Button>Invite Members</Button>
      </PermissionGuard>
    </div>
  );
}
```

### **Custom Fallback**
```tsx
import { PermissionGuard } from '@features/organization';

function ApprovalSection({ organization }) {
  return (
    <PermissionGuard
      requiredPermission="approve:legal"
      currentRole={organization.userRole}
      currentPermissions={organization.userPermissions}
      fallback={
        <div className="text-center py-8">
          <p>You need approval permission to access this section.</p>
        </div>
      }
    >
      <ApprovalInterface />
    </PermissionGuard>
  );
}
```

---

## 3️⃣ Permission Hooks

### **usePermission - Generic Check**
```tsx
import { usePermission } from '@features/organization';

function ContractCard({ contract, organization }) {
  const { hasPermission } = usePermission({
    organization,
    requiredPermission: 'approve:finance',
  });

  return (
    <Card>
      <h3>{contract.title}</h3>
      {hasPermission && (
        <Button onClick={handleApprove}>
          Approve
        </Button>
      )}
    </Card>
  );
}
```

### **useIsOwner - Quick Owner Check**
```tsx
import { useIsOwner } from '@features/organization';

function OrganizationSettings({ organization }) {
  const isOwner = useIsOwner(organization);

  return (
    <div>
      <h2>Settings</h2>
      {isOwner && (
        <Button variant="danger" onClick={handleDelete}>
          Delete Organization
        </Button>
      )}
    </div>
  );
}
```

### **useIsManager - Quick Manager Check**
```tsx
import { useIsManager } from '@features/organization';

function ApprovalBadge({ organization }) {
  const isManager = useIsManager(organization);

  if (!isManager) return null;

  return (
    <Badge>
      You have approval rights
    </Badge>
  );
}
```

### **useCanApprove - Check Approval Permission**
```tsx
import { useCanApprove } from '@features/organization';

function ContractActions({ contract, organization }) {
  const canApprove = useCanApprove(organization);

  return (
    <div className="flex gap-2">
      <Button onClick={handleView}>View</Button>
      {canApprove && (
        <>
          <Button variant="success" onClick={handleApprove}>
            Approve
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
        </>
      )}
    </div>
  );
}
```

### **useCanManageMembers - Member Management**
```tsx
import { useCanManageMembers } from '@features/organization';

function MembersHeader({ organization }) {
  const canManageMembers = useCanManageMembers(organization);

  return (
    <div className="flex items-center justify-between">
      <h2>Team Members</h2>
      {canManageMembers && (
        <Button onClick={handleInvite}>
          Invite Members
        </Button>
      )}
    </div>
  );
}
```

### **useCanManageSettings - Settings Access**
```tsx
import { useCanManageSettings } from '@features/organization';

function Sidebar({ organization }) {
  const canManageSettings = useCanManageSettings(organization);

  return (
    <nav>
      <Link to="dashboard">Dashboard</Link>
      <Link to="contracts">Contracts</Link>
      <Link to="members">Members</Link>
      {canManageSettings && (
        <Link to="settings">Settings</Link>
      )}
    </nav>
  );
}
```

---

## 4️⃣ Complex Examples

### **Approval Workflow UI**
```tsx
import { useCanApprove, PermissionGuard } from '@features/organization';

function ApprovalWorkflow({ contract, organization }) {
  const canApprove = useCanApprove(organization);
  const { hasPermission: canApproveLegal } = usePermission({
    organization,
    requiredPermission: 'approve:legal',
  });
  const { hasPermission: canApproveFinance } = usePermission({
    organization,
    requiredPermission: 'approve:finance',
  });

  return (
    <div className="space-y-4">
      {/* Step 1: Legal Approval */}
      <PermissionGuard
        requiredPermission="approve:legal"
        currentRole={organization.userRole}
        currentPermissions={organization.userPermissions}
      >
        <ApprovalStep
          title="Legal Approval"
          status={contract.legalApprovalStatus}
          canApprove={canApproveLegal}
          onApprove={handleLegalApprove}
          onReject={handleLegalReject}
        />
      </PermissionGuard>

      {/* Step 2: Finance Approval */}
      <PermissionGuard
        requiredPermission="approve:finance"
        currentRole={organization.userRole}
        currentPermissions={organization.userPermissions}
      >
        <ApprovalStep
          title="Finance Approval"
          status={contract.financeApprovalStatus}
          canApprove={canApproveFinance}
          onApprove={handleFinanceApprove}
          onReject={handleFinanceReject}
        />
      </PermissionGuard>
    </div>
  );
}
```

### **Dynamic Menu Based on Permissions**
```tsx
import { usePermission, MemberRole } from '@features/organization';

function WorkspaceTabs({ organization }) {
  const { userRole, userPermissions } = usePermission({ organization });
  const canApprove = userPermissions.some(p => 
    p.includes('approve:')
  );

  const tabs = [
    { id: 'contracts', label: 'Contracts', show: true },
    { 
      id: 'approvals', 
      label: 'Pending Approvals', 
      show: canApprove,
      badge: pendingCount 
    },
    { id: 'reports', label: 'Reports', show: true },
    { 
      id: 'members', 
      label: 'Members', 
      show: userRole !== MemberRole.MEMBER 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      show: userRole === MemberRole.OWNER 
    },
  ];

  return (
    <div className="flex gap-2">
      {tabs.filter(tab => tab.show).map(tab => (
        <Tab key={tab.id} {...tab} />
      ))}
    </div>
  );
}
```

### **Contract Upload with Permission Check**
```tsx
import { usePermission, MemberRole } from '@features/organization';

function ContractUploadButton({ organization }) {
  const { hasPermission, userRole } = usePermission({ organization });

  // Tất cả roles đều có thể upload
  const canUpload = userRole !== undefined;

  if (!canUpload) return null;

  return (
    <Button
      variant="primary"
      onClick={handleUpload}
      className="flex items-center gap-2"
    >
      <Upload className="w-4 h-4" />
      Upload Contract
    </Button>
  );
}
```

---

## 5️⃣ Complete Page Example

```tsx
import { useParams } from 'react-router-dom';
import {
  OrganizationSelector,
  PermissionGuard,
  useCanManageMembers,
  useIsOwner,
  MemberRole,
} from '@features/organization';
import { useOrganization } from '@features/organization';

function OrganizationWorkspace() {
  const { id } = useParams();
  const { data: organization, isLoading } = useOrganization(id);
  
  const canManageMembers = useCanManageMembers(organization);
  const isOwner = useIsOwner(organization);

  if (isLoading) return <LoadingSpinner />;
  if (!organization) return <NotFound />;

  return (
    <div className="workspace">
      {/* Header với Organization Selector */}
      <header className="flex items-center justify-between p-4">
        <OrganizationSelector currentOrganizationId={id} />
        <UserMenu />
      </header>

      {/* Main Content */}
      <main className="p-6">
        <h1>{organization.name}</h1>

        {/* Stats - Tất cả đều thấy */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Contracts" value={45} />
          <StatCard title="Pending" value={8} />
          <StatCard title="Approved" value={32} />
          <StatCard title="Rejected" value={5} />
        </div>

        {/* Contracts Section - Tất cả đều thấy */}
        <section className="mb-6">
          <h2>Contracts</h2>
          <ContractsList organizationId={id} />
        </section>

        {/* Members Section - Có permission mới thấy invite button */}
        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2>Members</h2>
            {canManageMembers && (
              <Button onClick={handleInvite}>Invite</Button>
            )}
          </div>
          <MembersList organizationId={id} />
        </section>

        {/* Settings Section - Chỉ Owner */}
        <PermissionGuard
          requiredRole={MemberRole.OWNER}
          currentRole={organization.userRole}
          currentPermissions={organization.userPermissions}
        >
          <section>
            <h2>Organization Settings</h2>
            <SettingsForm organization={organization} />
          </section>
        </PermissionGuard>
      </main>
    </div>
  );
}
```

---

## 🎯 Best Practices

### **1. Always check organization exists**
```tsx
const { data: organization } = useOrganization(id);

if (!organization) {
  return <NotFound />;
}
```

### **2. Use hooks for logic, PermissionGuard for UI**
```tsx
// ✅ Good - Hook for conditional logic
const canApprove = useCanApprove(organization);
if (canApprove) {
  showApprovalNotification();
}

// ✅ Good - PermissionGuard for conditional rendering
<PermissionGuard requiredPermission="approve:legal">
  <ApprovalButton />
</PermissionGuard>
```

### **3. Owner always has full access**
```tsx
// Owner check tự động trong hooks
const { hasPermission } = usePermission({
  organization,
  requiredPermission: 'org:settings',
});
// hasPermission = true nếu user là Owner, không cần check permission
```

### **4. Combine multiple permission checks**
```tsx
const canManageOrg = useMemo(() => {
  return useIsOwner(organization) || 
         useCanManageSettings(organization);
}, [organization]);
```

---

## 📱 Responsive Usage

```tsx
import { useMediaQuery } from '@shared/hooks';

function OrganizationSelector({ currentOrganizationId }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={isMobile ? 'w-full' : 'min-w-[220px]'}>
      <OrganizationSelector
        currentOrganizationId={currentOrganizationId}
      />
    </div>
  );
}
```

---

## 🚀 Quick Start Checklist

- [ ] Import components từ `@features/organization`
- [ ] Fetch organization data với `useOrganization(id)`
- [ ] Sử dụng `OrganizationSelector` trong header
- [ ] Wrap protected features với `PermissionGuard`
- [ ] Sử dụng hooks để check permissions trong logic
- [ ] Test với các roles khác nhau (Owner/Manager/Member)

---

Happy coding! 🎉
