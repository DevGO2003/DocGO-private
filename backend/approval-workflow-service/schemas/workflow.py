from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class WorkflowStep(BaseModel):
    stepId: str = Field(default_factory=lambda: uuid.uuid4().hex)
    order: int
    mode: str = Field(description="SEQUENTIAL|PARALLEL")
    approverRole: Optional[str] = None
    approverId: Optional[str] = None


class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: Optional[str] = None


class CreateWorkflowRequest(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]
    createdBy: Optional[str] = None


class ApprovalStep(BaseModel):
    stepId: str
    status: str = Field(default="PENDING")
    actorId: Optional[str] = None
    decisionAt: Optional[datetime] = None
    reason: Optional[str] = None


class Approval(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    contractId: str
    workflowId: str
    status: str = Field(default="PENDING")
    currentStep: int = 0
    steps: List[ApprovalStep] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class CreateApprovalRequest(BaseModel):
    contractId: str
    workflowId: str
    requesterId: Optional[str] = None
    note: Optional[str] = None


class ApproveRequest(BaseModel):
    actorId: str
    reason: Optional[str] = None


class RejectRequest(BaseModel):
    actorId: str
    reason: Optional[str] = None


