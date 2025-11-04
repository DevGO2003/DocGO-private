/**
 * Approval System Types
 */

export enum ApprovalLevel {
  LEGAL = 'LEGAL',
  FINANCE = 'FINANCE',
  EXECUTIVE = 'EXECUTIVE'
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  LEGAL_REVIEW = 'LEGAL_REVIEW',
  LEGAL_APPROVED = 'LEGAL_APPROVED',
  FINANCE_REVIEW = 'FINANCE_REVIEW',
  FINANCE_APPROVED = 'FINANCE_APPROVED',
  EXECUTIVE_REVIEW = 'EXECUTIVE_REVIEW',
  EXECUTIVE_APPROVED = 'EXECUTIVE_APPROVED',
  FULLY_APPROVED = 'FULLY_APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum ApprovalAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ApprovalRecord {
  id: string;
  level: ApprovalLevel;
  action: ApprovalAction;
  approvedBy: string;
  approverName: string;
  approverEmail: string;
  approverRole: string;
  approverPermissions: string[];
  actionAt: string;
  comment?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContractApprovalWorkflow {
  id: string;
  contractId: string;
  contractTitle: string;
  contractValue: number;
  organizationId: string;
  repositoryId: string;
  requiredLevels: ApprovalLevel[];
  currentLevelIndex: number;
  status: WorkflowStatus;
  approvals: ApprovalRecord[];
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  submittedAt: string;
  completedAt?: string;
  lastActionAt: string;
  metadata?: Record<string, any>;
}

export interface StartApprovalRequest {
  comment?: string;
}

export interface ApprovalActionRequest {
  comment?: string;
}

export interface ApprovalApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Helper functions

export function getApprovalLevelLabel(level: ApprovalLevel): string {
  switch (level) {
    case ApprovalLevel.LEGAL:
      return 'Phê duyệt Pháp lý';
    case ApprovalLevel.FINANCE:
      return 'Phê duyệt Tài chính';
    case ApprovalLevel.EXECUTIVE:
      return 'Phê duyệt Điều hành';
    default:
      return level;
  }
}

export function getWorkflowStatusLabel(status: WorkflowStatus): string {
  switch (status) {
    case WorkflowStatus.DRAFT:
      return 'Nháp';
    case WorkflowStatus.PENDING_APPROVAL:
      return 'Chờ phê duyệt';
    case WorkflowStatus.LEGAL_REVIEW:
      return 'Đang chờ Pháp lý duyệt';
    case WorkflowStatus.LEGAL_APPROVED:
      return 'Pháp lý đã duyệt';
    case WorkflowStatus.FINANCE_REVIEW:
      return 'Đang chờ Tài chính duyệt';
    case WorkflowStatus.FINANCE_APPROVED:
      return 'Tài chính đã duyệt';
    case WorkflowStatus.EXECUTIVE_REVIEW:
      return 'Đang chờ Điều hành duyệt';
    case WorkflowStatus.EXECUTIVE_APPROVED:
      return 'Điều hành đã duyệt';
    case WorkflowStatus.FULLY_APPROVED:
      return 'Đã phê duyệt hoàn toàn';
    case WorkflowStatus.REJECTED:
      return 'Bị từ chối';
    case WorkflowStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
}

export function getWorkflowStatusColor(status: WorkflowStatus): string {
  switch (status) {
    case WorkflowStatus.FULLY_APPROVED:
      return 'green';
    case WorkflowStatus.REJECTED:
      return 'red';
    case WorkflowStatus.CANCELLED:
      return 'gray';
    case WorkflowStatus.DRAFT:
      return 'gray';
    default:
      return 'blue'; // Pending states
  }
}

export function isWorkflowCompleted(workflow: ContractApprovalWorkflow): boolean {
  return (
    workflow.status === WorkflowStatus.FULLY_APPROVED ||
    workflow.status === WorkflowStatus.REJECTED ||
    workflow.status === WorkflowStatus.CANCELLED
  );
}

export function getCurrentLevel(workflow: ContractApprovalWorkflow): ApprovalLevel | null {
  if (workflow.currentLevelIndex >= workflow.requiredLevels.length) {
    return null;
  }
  return workflow.requiredLevels[workflow.currentLevelIndex];
}

export function getCompletedLevels(workflow: ContractApprovalWorkflow): ApprovalLevel[] {
  return workflow.approvals
    .filter(record => record.action === ApprovalAction.APPROVED)
    .map(record => record.level);
}

export function getRemainingLevels(workflow: ContractApprovalWorkflow): ApprovalLevel[] {
  const completed = getCompletedLevels(workflow);
  return workflow.requiredLevels.filter(level => !completed.includes(level));
}

export function canUserApprove(
  workflow: ContractApprovalWorkflow,
  userRole: string,
  userPermissions: string[]
): boolean {
  const currentLevel = getCurrentLevel(workflow);
  if (!currentLevel) return false;

  // OWNER can approve everything
  if (userRole === 'OWNER') return true;

  // MANAGER needs corresponding permission
  if (userRole === 'MANAGER') {
    const requiredPermission = `approve:${currentLevel.toLowerCase()}`;
    return userPermissions.includes(requiredPermission);
  }

  return false;
}
