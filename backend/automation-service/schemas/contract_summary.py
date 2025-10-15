from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class Party(BaseModel):
    role: str = Field(...)
    name: str = Field(...)
    representative: str = Field(...)
    taxCode: str = Field(...)
    contact: str = Field(...)
    address: str = Field(...)
    businessLicense: str = Field(...)

class PaymentDetails(BaseModel):
    totalValue: Union[int, float] = Field(...)")
    schedule: str = Field(...)
    currency: str = Field(...)
    paymentMethod: str = Field(...)

class KeyClause(BaseModel):
    name: str = Field(...)
    description: str = Field(...)
    source: str = Field(...)")

class FavorableClause(BaseModel):
    clauseName: str = Field(...)
    description: str = Field(...)
    benefitTo: str = Field(...)

class UnfavorableClause(BaseModel):
    clauseName: str = Field(...)
    description: str = Field(...)
    riskTo: str = Field(...)

class Reminder(BaseModel):
    type: str = Field(..., xem xét, hết hạn)")
    date: Optional[str] = Field(None)")
    content: str = Field(...)

class RiskAssessment(BaseModel):
    riskLevel: str = Field(..., MEDIUM, HIGH)")
    riskFactors: List[str] = Field(...)
    mitigationMeasures: List[str] = Field(...)
    # riskDetails removed to simplify riskAssessment structure

class ComplianceStatus(BaseModel):
    status: str = Field(..., NON_COMPLIANT, REVIEW_REQUIRED)")
    issues: List[str] = Field(...)
    recommendations: List[str] = Field(...)

class ContractSummary(BaseModel):
    id: str = Field(...)
    contractNumber: str = Field(...)
    status: str = Field(...)
    contractType: str = Field(...)
    title: str = Field(...)
    tag: List[str] = Field(...)
    parties: List[Party] = Field(...)
    object: str = Field(...)
    effectiveDate: str = Field(...)")
    term: str = Field(...)
    paymentDetails: PaymentDetails = Field(...)
    keyClauses: List[KeyClause] = Field(...)
    favorableClauses: List[FavorableClause] = Field(...)
    unfavorableClauses: List[UnfavorableClause] = Field(...)
    reminders: List[Reminder] = Field(...)
    terminationConditions: str = Field(...)
    riskAssessment: RiskAssessment = Field(...)
    complianceStatus: ComplianceStatus = Field(...)

class ContractSummaryResponse(BaseModel):
    contract_summary: ContractSummary = Field(...)




