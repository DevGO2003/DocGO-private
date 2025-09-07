from typing import Dict, Optional
from copy import deepcopy
from datetime import datetime

from schemas.workflow import (
    CreateWorkflowRequest, Workflow, WorkflowStep,
    CreateApprovalRequest, Approval, ApprovalStep,
)


class ApprovalService:
    def __init__(self) -> None:
        self.workflows: Dict[str, Workflow] = {}
        self.approvals: Dict[str, Approval] = {}

    # Workflows
    def create_workflow(self, req: CreateWorkflowRequest) -> Workflow:
        workflow = Workflow(
            name=req.name,
            description=req.description,
            steps=req.steps,
            createdBy=req.createdBy,
        )
        self.workflows[workflow.id] = workflow
        return workflow

    def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        return self.workflows.get(workflow_id)

    # Approvals
    def create_approval(self, req: CreateApprovalRequest) -> Approval:
        workflow = self.get_workflow(req.workflowId)
        if not workflow:
            raise ValueError("Workflow không tồn tại")
        steps = [ApprovalStep(stepId=s.stepId) for s in workflow.steps]
        approval = Approval(
            contractId=req.contractId,
            workflowId=req.workflowId,
            steps=steps,
        )
        self.approvals[approval.id] = approval
        return approval

    def get_approval(self, approval_id: str) -> Optional[Approval]:
        return self.approvals.get(approval_id)

    def approve(self, approval_id: str, actor_id: str, reason: Optional[str]) -> Optional[Approval]:
        approval = self.get_approval(approval_id)
        if not approval:
            return None
        if approval.status in ("APPROVED", "REJECTED"):
            return approval
        idx = approval.currentStep
        approval.steps[idx].status = "APPROVED"
        approval.steps[idx].actorId = actor_id
        approval.steps[idx].reason = reason
        approval.steps[idx].decisionAt = datetime.utcnow()
        if idx + 1 < len(approval.steps):
            approval.currentStep = idx + 1
        else:
            approval.status = "APPROVED"
        return approval

    def reject(self, approval_id: str, actor_id: str, reason: Optional[str]) -> Optional[Approval]:
        approval = self.get_approval(approval_id)
        if not approval:
            return None
        if approval.status in ("APPROVED", "REJECTED"):
            return approval
        idx = approval.currentStep
        approval.steps[idx].status = "REJECTED"
        approval.steps[idx].actorId = actor_id
        approval.steps[idx].reason = reason
        approval.steps[idx].decisionAt = datetime.utcnow()
        approval.status = "REJECTED"
        return approval


