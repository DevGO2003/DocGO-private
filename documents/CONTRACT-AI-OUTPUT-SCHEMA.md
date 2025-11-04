# 📋 AI Contract Output Schema - For Frontend Display

## 🔄 Flow Overview

```
User uploads PDF/DOCX 
    ↓ (0-2s)
FILE_UPLOAD_COMPLETED event
    ↓
AI extracts text (OCR)
    ↓ (1-10s)
FILE_CONTENT_EXTRACTED event
    ↓
AI analyzes contract (if isContract=true)
    ↓ (10-30s)
CONTRACT_SUMMARY_GENERATED event
    ↓
Repository saves to FileEntity.contract section
    ↓
FE fetches contract data via API
```

---

## 📊 Contract Data Structure

### FileEntity Structure (MongoDB)

```json
{
  "id": "01JBK...",
  "repositoryId": "repo-123",
  "overview": {
    "title": "Hợp đồng phần mềm ABC.pdf",
    "status": "PROCESSED",
    "documentType": "CONTRACT",
    "isContract": true,
    "ownerUserId": "user-123"
  },
  "content": {
    "plaintext": "Full extracted text...",
    "classification": {
      "isContract": true,
      "confidence": 0.95,
      "documentType": "CONTRACT"
    }
  },
  "contract": {
    // ⭐ THIS IS WHAT YOU DISPLAY ON FE ⭐
  }
}
```

---

## 🎨 Contract Section Schema (fileEntity.contract)

### TypeScript Interfaces

```typescript
// ==================== MAIN CONTRACT INTERFACE ====================
interface ContractMetadata {
  // Basic Info
  effectiveDate: string | null;          // ISO8601: "2024-02-01T00:00:00"
  expiryDate: string | null;             // ISO8601: "2026-02-01T00:00:00"
  totalValue: number | null;             // 100000000 (no commas)
  currency: "VND" | "USD" | "EUR" | "JPY" | null;
  summary: string | null;                // 50-100 words summary
  project: string | null;                // "Dự án DocGO Platform"
  department: string | null;             // "IT Department"
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  confidentiality: "CONFIDENTIAL" | "INTERNAL" | "PUBLIC" | "RESTRICTED" | null;
  contractType: "CONTRACT" | "PURCHASE_ORDER" | "INVOICE" | "AGREEMENT" | "OTHER" | null;
  confidence: number | null;             // AI confidence score (0-1)
  
  // Sections
  parties: ContractParty[];
  payment: PaymentInfo;
  clauses: ClausesInfo;
  reminders: Reminder[];
  risk: RiskAssessment;
  compliance: ComplianceInfo;
  keyTerms: KeyTerm[];
}

// ==================== PARTIES ====================
interface ContractParty {
  id: string | null;                     // "party-001"
  name: string | null;                   // "CÔNG TY TNHH ABC"
  type: "CLIENT" | "VENDOR" | "PARTNER" | "GUARANTOR" | null;
  role: string | null;                   // "Bên A - Khách hàng"
  contact: {
    email: string | null;
    phone: string | null;                // "+84-28-1234-5678"
    address: string | null;
  };
  representative: {
    name: string | null;
    position: string | null;
    email: string | null;
  };
  taxCode: string | null;                // "0123456789"
}

// ==================== PAYMENT ====================
interface PaymentInfo {
  totalValue: number | null;
  currency: "VND" | "USD" | "EUR" | "JPY" | null;
  method: "BANK_TRANSFER" | "CREDIT_CARD" | "WIRE" | "CHECK" | "CASH" | "DIGITAL_WALLET" | null;
  schedule: PaymentScheduleItem[];
}

interface PaymentScheduleItem {
  milestone: string | null;              // "Ký hợp đồng"
  percentage: number | null;             // 30
  amount: number | null;                 // 30000000
  dueDate: string | null;                // ISO8601
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | null;
}

// ==================== CLAUSES ====================
interface ClausesInfo {
  key: KeyClause[];                      // ⚠️ High risk/impact clauses
  favorable: FavorableClause[];          // ✅ Beneficial clauses
  unfavorable: UnfavorableClause[];      // ❌ Disadvantageous clauses
  all: AllClause[];                      // 📋 ALL clauses (complete list)
  
  // Additional clause types
  intellectualProperty: string | null;   // IP rights description
  confidentiality: string | null;        // Confidentiality terms
  warranty: string | null;               // Warranty conditions
  termination: string | null;            // Termination conditions
}

interface KeyClause {
  name: string | null;                   // "Điều 5: Phạm vi công việc"
  description: string | null;            // Detailed description
  content: string | null;                // EXACT quote from contract
  importance: "HIGH" | "MEDIUM" | "LOW" | null;
  risk: "HIGH" | "MEDIUM" | "LOW" | null;
  advice: string | null;                 // Expert recommendation
  pageNumber: number | null;
}

interface FavorableClause {
  name: string | null;                   // "Điều 3: Quyền lợi của bên A"
  description: string | null;            // WHY this is beneficial
  content: string | null;                // EXACT quote
  importance: "HIGH" | "MEDIUM" | "LOW" | null;
  advice: string | null;                 // How to leverage this benefit
  pageNumber: number | null;
  // NO risk field (it's favorable!)
}

interface UnfavorableClause {
  name: string | null;                   // "Điều 8: Bồi thường"
  description: string | null;            // Description of disadvantage
  content: string | null;                // EXACT quote
  impact: string | null;                 // Specific impact
  affectedParties: string[];             // ["party-001", "party-002"]
  pageNumber: number | null;
}

interface AllClause {
  name: string | null;                   // "Điều 1: Định nghĩa"
  description: string | null;            // 50-100 words
  content: string | null;                // EXACT quote (REQUIRED)
  importance: "HIGH" | "MEDIUM" | "LOW" | null;
  risk: "HIGH" | "MEDIUM" | "LOW" | null; // Can be null for favorable clauses
  advice: string | null;
  pageNumber: number | null;
}

// ==================== KEY TERMS ====================
interface KeyTerm {
  term: string | null;                   // "software"
  definition: string | null;             // Detailed explanation
  category: "TECHNICAL" | "LEGAL" | "FINANCIAL" | "OPERATIONAL" | null;
  frequency: number | null;              // 5 (occurrences in contract)
  context: string | null;                // Usage context
}

// ==================== REMINDERS ====================
interface Reminder {
  id: string | null;                     // "reminder-001"
  type: "DEADLINE" | "MILESTONE" | "REVIEW" | "PAYMENT" | "PAYMENT_DUE" | null;
  title: string | null;                  // "Payment Phase 1"
  description: string | null;
  content: string | null;
  dueDate: string | null;                // ISO8601: "2025-11-30T00:00:00"
  status: "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED" | null;
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
}

// ==================== RISK ASSESSMENT ====================
interface RiskAssessment {
  level: "LOW" | "MEDIUM" | "HIGH" | null;
  factors: RiskFactor[];
  assessment: string | null;             // Overall assessment
  recommendations: string | null;        // Risk mitigation recommendations
}

interface RiskFactor {
  category: "FINANCIAL" | "LEGAL" | "OPERATIONAL" | "TECHNICAL" | "SCHEDULE" | null;
  description: string | null;            // Risk description
  severity: "HIGH" | "MEDIUM" | "LOW" | null;
  probability: "HIGH" | "MEDIUM" | "LOW" | null;
  impact: string | null;                 // Specific impact
  mitigation: string | null;             // Mitigation strategy
}

// ==================== COMPLIANCE ====================
interface ComplianceInfo {
  status: "COMPLIANT" | "NON_COMPLIANT" | "PENDING_REVIEW" | "IN_AUDIT" | null;
  regulations: Regulation[];
  certifications: Certification[];
  auditRequirements: string | null;
  reportingRequirements: string | null;
}

interface Regulation {
  name: string | null;
  description: string | null;
  status: "APPLICABLE" | "NOT_APPLICABLE" | "PENDING" | null;
  requirements: string | null;
}

interface Certification {
  name: string | null;
  description: string | null;
  required: boolean | null;
  expiryDate: string | null;             // ISO8601
}
```

---

## 🎨 FE Display Recommendations

### 1. **Contract Overview Card**
```tsx
<ContractOverview>
  <Title>{contract.summary}</Title>
  <DateRange>
    {contract.effectiveDate} → {contract.expiryDate}
  </DateRange>
  <Value>
    {formatCurrency(contract.totalValue, contract.currency)}
  </Value>
  <Badges>
    <Badge color={getPriorityColor(contract.priority)}>
      {contract.priority}
    </Badge>
    <Badge color={getConfidentialityColor(contract.confidentiality)}>
      {contract.confidentiality}
    </Badge>
  </Badges>
</ContractOverview>
```

### 2. **Parties Section**
```tsx
<PartiesGrid>
  {contract.parties.map(party => (
    <PartyCard key={party.id}>
      <PartyName>{party.name}</PartyName>
      <PartyRole>{party.role}</PartyRole>
      <ContactInfo>
        📧 {party.contact.email}
        📞 {party.contact.phone}
        📍 {party.contact.address}
      </ContactInfo>
      <Representative>
        👤 {party.representative.name}
        💼 {party.representative.position}
      </Representative>
    </PartyCard>
  ))}
</PartiesGrid>
```

### 3. **Payment Timeline**
```tsx
<PaymentTimeline>
  <TotalValue>
    Total: {formatCurrency(contract.payment.totalValue, contract.payment.currency)}
  </TotalValue>
  <Method>{contract.payment.method}</Method>
  
  <Timeline>
    {contract.payment.schedule.map((item, idx) => (
      <TimelineItem key={idx} status={item.status}>
        <Milestone>{item.milestone}</Milestone>
        <Amount>{item.percentage}% - {formatCurrency(item.amount)}</Amount>
        <DueDate>{formatDate(item.dueDate)}</DueDate>
        <Status>{item.status}</Status>
      </TimelineItem>
    ))}
  </Timeline>
</PaymentTimeline>
```

### 4. **Clauses Tabs**
```tsx
<ClausesTabs>
  <Tab label="All Clauses" count={contract.clauses.all.length}>
    <ClauseList>
      {contract.clauses.all.map(clause => (
        <ClauseCard importance={clause.importance} risk={clause.risk}>
          <ClauseName>{clause.name}</ClauseName>
          <ClauseDescription>{clause.description}</ClauseDescription>
          <ClauseContent>{clause.content}</ClauseContent>
          {clause.advice && <Advice>💡 {clause.advice}</Advice>}
          <PageRef>Page {clause.pageNumber}</PageRef>
        </ClauseCard>
      ))}
    </ClauseList>
  </Tab>
  
  <Tab label="⚠️ Key Clauses" count={contract.clauses.key.length}>
    <HighlightedClauses clauses={contract.clauses.key} type="key" />
  </Tab>
  
  <Tab label="✅ Favorable" count={contract.clauses.favorable.length}>
    <HighlightedClauses clauses={contract.clauses.favorable} type="favorable" />
  </Tab>
  
  <Tab label="❌ Unfavorable" count={contract.clauses.unfavorable.length}>
    <HighlightedClauses clauses={contract.clauses.unfavorable} type="unfavorable" />
  </Tab>
</ClausesTabs>
```

### 5. **Risk Assessment**
```tsx
<RiskAssessment>
  <RiskLevel level={contract.risk.level}>
    {contract.risk.level} RISK
  </RiskLevel>
  
  <RiskFactors>
    {contract.risk.factors.map((factor, idx) => (
      <RiskCard key={idx} severity={factor.severity}>
        <Category>{factor.category}</Category>
        <Description>{factor.description}</Description>
        <Metrics>
          Severity: {factor.severity} | Probability: {factor.probability}
        </Metrics>
        <Impact>{factor.impact}</Impact>
        <Mitigation>🛡️ {factor.mitigation}</Mitigation>
      </RiskCard>
    ))}
  </RiskFactors>
  
  {contract.risk.recommendations && (
    <Recommendations>{contract.risk.recommendations}</Recommendations>
  )}
</RiskAssessment>
```

### 6. **Reminders Timeline**
```tsx
<RemindersTimeline>
  {contract.reminders
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map(reminder => (
      <ReminderCard 
        key={reminder.id} 
        priority={reminder.priority}
        status={reminder.status}
      >
        <ReminderTitle>{reminder.title}</ReminderTitle>
        <ReminderType>{reminder.type}</ReminderType>
        <DueDate>{formatDate(reminder.dueDate)}</DueDate>
        <Description>{reminder.description}</Description>
        <Status>{reminder.status}</Status>
      </ReminderCard>
    ))}
</RemindersTimeline>
```

### 7. **Key Terms Glossary**
```tsx
<KeyTermsGlossary>
  {contract.keyTerms.map((term, idx) => (
    <TermCard key={idx} category={term.category}>
      <Term>{term.term}</Term>
      <Definition>{term.definition}</Definition>
      <Category>{term.category}</Category>
      <Frequency>Appears {term.frequency} times</Frequency>
      {term.context && <Context>{term.context}</Context>}
    </TermCard>
  ))}
</KeyTermsGlossary>
```

### 8. **Compliance Dashboard**
```tsx
<ComplianceDashboard>
  <Status status={contract.compliance.status}>
    {contract.compliance.status}
  </Status>
  
  <Regulations>
    {contract.compliance.regulations.map((reg, idx) => (
      <RegulationCard key={idx} status={reg.status}>
        <Name>{reg.name}</Name>
        <Description>{reg.description}</Description>
        <Requirements>{reg.requirements}</Requirements>
      </RegulationCard>
    ))}
  </Regulations>
  
  <Certifications>
    {contract.compliance.certifications.map((cert, idx) => (
      <CertCard key={idx} required={cert.required}>
        <Name>{cert.name}</Name>
        <ExpiryDate>{formatDate(cert.expiryDate)}</ExpiryDate>
        {cert.required && <RequiredBadge>Required</RequiredBadge>}
      </CertCard>
    ))}
  </Certifications>
</ComplianceDashboard>
```

---

## 📡 API Response Example

### GET /api/files/:fileId

```json
{
  "id": "01JBK5X8...",
  "repositoryId": "repo-123",
  "overview": {
    "title": "Hợp đồng phần mềm ABC.pdf",
    "status": "PROCESSED",
    "documentType": "CONTRACT",
    "isContract": true
  },
  "contract": {
    "effectiveDate": "2024-02-01T00:00:00",
    "expiryDate": "2026-02-01T00:00:00",
    "totalValue": 100000000,
    "currency": "VND",
    "summary": "Hợp đồng phát triển phần mềm quản lý tài liệu...",
    "priority": "HIGH",
    "confidentiality": "CONFIDENTIAL",
    
    "parties": [
      {
        "id": "party-001",
        "name": "CÔNG TY TNHH ABC",
        "type": "CLIENT",
        "role": "Bên A - Khách hàng",
        "contact": {
          "email": "contact@abc.com",
          "phone": "+84-28-1234-5678",
          "address": "123 Nguyễn Huệ, Q1, TP.HCM"
        },
        "representative": {
          "name": "Nguyễn Văn A",
          "position": "Giám đốc",
          "email": "director@abc.com"
        },
        "taxCode": "0123456789"
      }
    ],
    
    "payment": {
      "totalValue": 100000000,
      "currency": "VND",
      "method": "BANK_TRANSFER",
      "schedule": [
        {
          "milestone": "Ký hợp đồng",
          "percentage": 30,
          "amount": 30000000,
          "dueDate": "2024-02-15T00:00:00",
          "status": "PAID"
        }
      ]
    },
    
    "clauses": {
      "all": [
        {
          "name": "Điều 1: Định nghĩa",
          "description": "Giải thích các thuật ngữ sử dụng trong hợp đồng",
          "content": "Trong hợp đồng này, các thuật ngữ sau được hiểu như sau...",
          "importance": "MEDIUM",
          "risk": null,
          "advice": "Cần đọc kỹ các định nghĩa để tránh hiểu nhầm",
          "pageNumber": 1
        }
      ],
      "key": [
        {
          "name": "Điều 7: Chấm dứt hợp đồng",
          "description": "Quy định điều kiện chấm dứt hợp đồng",
          "content": "Hợp đồng có thể chấm dứt khi...",
          "importance": "HIGH",
          "risk": "HIGH",
          "advice": "Cần chú ý các điều kiện chấm dứt để tránh vi phạm",
          "pageNumber": 5
        }
      ],
      "favorable": [],
      "unfavorable": []
    },
    
    "reminders": [
      {
        "id": "reminder-001",
        "type": "PAYMENT_DUE",
        "title": "Payment Phase 2",
        "description": "Thanh toán đợt 2 sau khi hoàn thành 50%",
        "dueDate": "2024-06-30T00:00:00",
        "status": "PENDING",
        "priority": "HIGH"
      }
    ],
    
    "risk": {
      "level": "MEDIUM",
      "factors": [
        {
          "category": "FINANCIAL",
          "description": "Rủi ro về thanh toán chậm trễ",
          "severity": "MEDIUM",
          "probability": "LOW",
          "impact": "Ảnh hưởng đến dòng tiền",
          "mitigation": "Thiết lập hệ thống nhắc nhở tự động"
        }
      ],
      "assessment": "Rủi ro tổng thể ở mức trung bình",
      "recommendations": "Nên theo dõi chặt chẽ lịch thanh toán"
    },
    
    "compliance": {
      "status": "COMPLIANT",
      "regulations": [],
      "certifications": []
    },
    
    "keyTerms": [
      {
        "term": "software",
        "definition": "Phần mềm được phát triển theo yêu cầu",
        "category": "TECHNICAL",
        "frequency": 15,
        "context": "Sử dụng trong phạm vi công việc"
      }
    ]
  }
}
```

---

## 🎯 Important Notes

1. **All fields can be null** - AI might not find information
2. **Dates are ISO8601 format** - Parse with `new Date(dateString)`
3. **Numbers have no commas** - Format on FE: `100000000` → `"100,000,000"`
4. **Enum values** - Use for dropdown/filters
5. **Content field** - EXACT quotes from contract (for reference)
6. **clauses.all** - Contains ALL clauses (complete list)
7. **Risk levels** - Use for color coding (HIGH=red, MEDIUM=yellow, LOW=green)

---

## 🚀 Quick Start Code

```typescript
// Fetch contract data
const fetchContractData = async (fileId: string): Promise<ContractMetadata> => {
  const response = await fetch(`/api/files/${fileId}`);
  const data = await response.json();
  return data.contract; // Extract contract section
};

// Format currency
const formatCurrency = (value: number | null, currency: string | null): string => {
  if (!value) return "N/A";
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND'
  }).format(value);
};

// Format date
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// Get risk color
const getRiskColor = (level: string | null): string => {
  switch (level) {
    case 'HIGH': return 'red';
    case 'MEDIUM': return 'yellow';
    case 'LOW': return 'green';
    default: return 'gray';
  }
};
```

---

## ✅ Implementation Checklist

- [ ] Create TypeScript interfaces
- [ ] Implement API fetching
- [ ] Build Contract Overview Card
- [ ] Build Parties Section
- [ ] Build Payment Timeline
- [ ] Build Clauses Tabs (All/Key/Favorable/Unfavorable)
- [ ] Build Risk Assessment Dashboard
- [ ] Build Reminders Timeline
- [ ] Build Key Terms Glossary
- [ ] Build Compliance Dashboard
- [ ] Add currency formatting
- [ ] Add date formatting
- [ ] Add risk level color coding
- [ ] Handle null/missing fields gracefully
- [ ] Add loading states
- [ ] Add error handling

---

**🎉 Done! Bây giờ bạn có đầy đủ schema để build FE hiển thị hợp đồng!**
