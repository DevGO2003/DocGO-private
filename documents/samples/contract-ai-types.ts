/**
 * TypeScript Type Definitions cho AI Contract Analysis Output
 * Sử dụng cho Frontend Development
 */

// ==================== ENUMS ====================

export type Currency = "VND" | "USD" | "EUR" | "JPY";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type Confidentiality = "CONFIDENTIAL" | "INTERNAL" | "PUBLIC" | "RESTRICTED";
export type ContractType = "CONTRACT" | "PURCHASE_ORDER" | "INVOICE" | "AGREEMENT" | "OTHER";
export type PartyType = "CLIENT" | "VENDOR" | "PARTNER" | "GUARANTOR";
export type PaymentMethod = "BANK_TRANSFER" | "CREDIT_CARD" | "WIRE" | "CHECK" | "CASH" | "DIGITAL_WALLET";
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type ReminderType = "DEADLINE" | "MILESTONE" | "REVIEW" | "PAYMENT" | "PAYMENT_DUE";
export type ReminderStatus = "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type RiskCategory = "FINANCIAL" | "LEGAL" | "OPERATIONAL" | "TECHNICAL" | "SCHEDULE";
export type ComplianceStatus = "COMPLIANT" | "NON_COMPLIANT" | "PENDING_REVIEW" | "IN_AUDIT";
export type RegulationStatus = "APPLICABLE" | "NOT_APPLICABLE" | "PENDING";
export type Importance = "HIGH" | "MEDIUM" | "LOW";

// ==================== INTERFACES ====================

export interface ContractBasicInfo {
  effectiveDate: string | null;
  expiryDate: string | null;
  totalValue: number | null;
  currency: Currency | null;
  summary: string | null;
  project: string | null;
  department: string | null;
  priority: Priority | null;
  confidentiality: Confidentiality | null;
  contractType: ContractType | null;
}

export interface Classification {
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
}

export interface Contact {
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface Representative {
  name: string | null;
  position: string | null;
  email: string | null;
}

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  role: string | null;
  contact: Contact;
  representative: Representative;
  taxCode: string | null;
}

export interface PaymentScheduleItem {
  milestone: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
}

export interface Payment {
  totalValue: number | null;
  currency: Currency | null;
  method: PaymentMethod | null;
  schedule: PaymentScheduleItem[];
}

export interface Clause {
  name: string;
  description: string;
  content: string;
  importance: Importance;
  risk?: RiskLevel;
  advice: string | null;
  pageNumber: number | null;
  impact?: string;
  affectedParties?: string[];
}

export interface Clauses {
  key: Clause[];
  favorable: Clause[];
  unfavorable: Clause[];
  all: Clause[];
  intellectualProperty?: string;
  confidentiality?: string;
  warranty?: string;
  termination?: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
  category: "TECHNICAL" | "LEGAL" | "FINANCIAL" | "OPERATIONAL";
  frequency: number;
  context: string | null;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string | null;
  content: string | null;
  dueDate: string;
  status: ReminderStatus;
  priority: Priority;
}

export interface RiskFactor {
  category: RiskCategory;
  description: string;
  severity: RiskLevel;
  probability: RiskLevel;
  impact: string;
  mitigation: string;
}

export interface Risk {
  level: RiskLevel;
  factors: RiskFactor[];
  assessment: string | null;
  recommendations: string | null;
}

export interface Regulation {
  name: string;
  description: string;
  status: RegulationStatus;
  requirements: string;
}

export interface Certification {
  name: string;
  description: string;
  required: boolean;
  expiryDate: string | null;
}

export interface Compliance {
  status: ComplianceStatus;
  regulations: Regulation[];
  certifications: Certification[];
  auditRequirements: string | null;
  reportingRequirements: string | null;
}

// ==================== MAIN CONTRACT OUTPUT ====================

export interface ContractAIOutput extends ContractBasicInfo {
  classification: Classification;
  parties: Party[];
  payment: Payment;
  clauses: Clauses;
  keyTerms?: KeyTerm[];
  reminders: Reminder[];
  risk: Risk;
  compliance: Compliance;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format currency theo locale
 */
export const formatCurrency = (value: number | null, currency: Currency | null = "VND"): string => {
  if (value === null) return "Chưa xác định";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
  }).format(value);
};

/**
 * Format date theo locale VN
 */
export const formatDate = (isoDate: string | null): string => {
  if (!isoDate) return "Chưa xác định";
  
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Tính thời gian còn lại
 */
export const getTimeRemaining = (dueDate: string): { days: number; label: string; isOverdue: boolean } => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      label: `Quá hạn ${Math.abs(diffDays)} ngày`,
      isOverdue: true,
    };
  }
  
  if (diffDays === 0) {
    return {
      days: 0,
      label: "Hôm nay",
      isOverdue: false,
    };
  }
  
  if (diffDays === 1) {
    return {
      days: 1,
      label: "Ngày mai",
      isOverdue: false,
    };
  }
  
  return {
    days: diffDays,
    label: `Còn ${diffDays} ngày`,
    isOverdue: false,
  };
};

/**
 * Get color theo risk level
 */
export const getRiskColor = (level: RiskLevel | undefined): string => {
  const colors: Record<RiskLevel, string> = {
    HIGH: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW: "#10B981",
  };
  return level ? colors[level] : "#6B7280";
};

/**
 * Get color theo payment status
 */
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    PAID: "#10B981",
    PENDING: "#F59E0B",
    OVERDUE: "#EF4444",
    CANCELLED: "#6B7280",
  };
  return colors[status];
};

/**
 * Get label theo priority
 */
export const getPriorityLabel = (priority: Priority | null): string => {
  const labels: Record<Priority, string> = {
    HIGH: "Cao",
    MEDIUM: "Trung bình",
    LOW: "Thấp",
  };
  return priority ? labels[priority] : "Chưa xác định";
};

/**
 * Get color theo priority
 */
export const getPriorityColor = (priority: Priority | null): string => {
  const colors: Record<Priority, string> = {
    HIGH: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW: "#10B981",
  };
  return priority ? colors[priority] : "#6B7280";
};

/**
 * Tính tổng đã thanh toán
 */
export const calculatePaidAmount = (payment: Payment): number => {
  return payment.schedule
    .filter(item => item.status === "PAID")
    .reduce((sum, item) => sum + item.amount, 0);
};

/**
 * Tính phần trăm đã thanh toán
 */
export const calculatePaidPercentage = (payment: Payment): number => {
  if (!payment.totalValue) return 0;
  const paid = calculatePaidAmount(payment);
  return Math.round((paid / payment.totalValue) * 100);
};

/**
 * Check xem có thanh toán nào sắp đến hạn không (trong 7 ngày)
 */
export const hasUpcomingPayment = (payment: Payment): boolean => {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return payment.schedule.some(item => {
    if (item.status !== "PENDING") return false;
    const dueDate = new Date(item.dueDate);
    return dueDate >= now && dueDate <= sevenDaysLater;
  });
};

/**
 * Get next payment
 */
export const getNextPayment = (payment: Payment): PaymentScheduleItem | null => {
  const now = new Date();
  const pending = payment.schedule
    .filter(item => item.status === "PENDING")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return pending.length > 0 ? pending[0] : null;
};

/**
 * Get overdue payments
 */
export const getOverduePayments = (payment: Payment): PaymentScheduleItem[] => {
  const now = new Date();
  return payment.schedule.filter(item => {
    if (item.status !== "PENDING") return false;
    return new Date(item.dueDate) < now;
  });
};

/**
 * Tính thời hạn hợp đồng (số tháng)
 */
export const calculateContractDuration = (contract: ContractBasicInfo): number | null => {
  if (!contract.effectiveDate || !contract.expiryDate) return null;
  
  const start = new Date(contract.effectiveDate);
  const end = new Date(contract.expiryDate);
  const diffTime = end.getTime() - start.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return diffMonths;
};

/**
 * Check hợp đồng có sắp hết hạn không (trong 30 ngày)
 */
export const isContractExpiringSoon = (contract: ContractBasicInfo): boolean => {
  if (!contract.expiryDate) return false;
  
  const now = new Date();
  const expiry = new Date(contract.expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 && diffDays <= 30;
};

/**
 * Get risk score (0-100)
 */
export const getRiskScore = (level: RiskLevel): number => {
  const scores: Record<RiskLevel, number> = {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 90,
  };
  return scores[level];
};

// ==================== MOCK DATA ====================

export const MOCK_CONTRACT: ContractAIOutput = {
  effectiveDate: "2024-01-15T00:00:00",
  expiryDate: "2026-01-15T00:00:00",
  totalValue: 1000000000,
  currency: "VND",
  summary: "Hợp đồng cung cấp dịch vụ phát triển hệ thống DocGO Platform",
  project: "Dự án DocGO Platform",
  department: "Phòng CNTT",
  priority: "HIGH",
  confidentiality: "CONFIDENTIAL",
  contractType: "CONTRACT",
  classification: {
    model: "gemini-1.5-flash",
    inputTokens: 3842,
    outputTokens: 1256,
  },
  parties: [
    {
      id: "party-001",
      name: "CÔNG TY TNHH DEVGO2003",
      type: "VENDOR",
      role: "Bên A - Nhà cung cấp",
      contact: {
        email: "contact@devgo2003.com",
        phone: "+84-28-3821-5678",
        address: "123 Lê Văn Việt, Q9, TP.HCM",
      },
      representative: {
        name: "Nguyễn Văn An",
        position: "Giám đốc",
        email: "an.nguyen@devgo2003.com",
      },
      taxCode: "0312345678",
    },
  ],
  payment: {
    totalValue: 1000000000,
    currency: "VND",
    method: "BANK_TRANSFER",
    schedule: [
      {
        milestone: "Ký hợp đồng",
        percentage: 20,
        amount: 200000000,
        dueDate: "2024-01-20T00:00:00",
        status: "PAID",
      },
    ],
  },
  clauses: {
    key: [],
    favorable: [],
    unfavorable: [],
    all: [],
  },
  reminders: [],
  risk: {
    level: "MEDIUM",
    factors: [],
    assessment: null,
    recommendations: null,
  },
  compliance: {
    status: "COMPLIANT",
    regulations: [],
    certifications: [],
    auditRequirements: null,
    reportingRequirements: null,
  },
};
