# 🤖 Hướng dẫn Schema Output của AI - Cho Frontend Developer

## 📋 Tổng quan

Khi upload một hợp đồng giá trị **1 tỷ VNĐ**, AI sẽ phân tích và trả về JSON theo schema chuẩn. Đây là tài liệu hướng dẫn cho Frontend Developer để hiểu rõ cấu trúc dữ liệu và render UI.

---

## 🎯 Luồng dữ liệu

```
Client upload file
    ↓
Automation Service xử lý (OCR + AI)
    ↓
Kafka Events (3 events)
    ↓
Repository Service lưu MongoDB
    ↓
Frontend query API để lấy document
```

---

## 📦 Schema đầy đủ của AI Output

### 1. **Thông tin cơ bản hợp đồng**

```typescript
interface ContractBasicInfo {
  effectiveDate: string | null;        // ISO8601: "2024-01-15T00:00:00"
  expiryDate: string | null;           // ISO8601: "2026-01-15T00:00:00"
  totalValue: number | null;           // 1000000000 (1 tỷ, không có dấu phẩy)
  currency: "VND" | "USD" | "EUR" | "JPY" | null;
  summary: string | null;              // Tóm tắt 50-100 từ
  project: string | null;              // "Dự án DocGO Platform"
  department: string | null;           // "Phòng CNTT"
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
  confidentiality: "CONFIDENTIAL" | "INTERNAL" | "PUBLIC" | "RESTRICTED" | null;
  contractType: "CONTRACT" | "PURCHASE_ORDER" | "INVOICE" | "AGREEMENT" | "OTHER" | null;
}
```

**Ví dụ render UI:**
```tsx
<Card>
  <h2>Thông tin hợp đồng</h2>
  <InfoRow label="Giá trị" value={formatCurrency(contract.totalValue, contract.currency)} />
  <InfoRow label="Hiệu lực" value={formatDate(contract.effectiveDate)} />
  <InfoRow label="Hết hạn" value={formatDate(contract.expiryDate)} />
  <Badge color={getPriorityColor(contract.priority)}>{contract.priority}</Badge>
</Card>
```

---

### 2. **Các bên tham gia (Parties)**

```typescript
interface Party {
  id: string;                          // "party-001"
  name: string;                        // "CÔNG TY TNHH DEVGO2003"
  type: "CLIENT" | "VENDOR" | "PARTNER" | "GUARANTOR";
  role: string | null;                 // "Bên A - Nhà cung cấp"
  contact: {
    email: string | null;              // "contact@devgo2003.com"
    phone: string | null;              // "+84-28-3821-5678"
    address: string | null;            // "123 Lê Văn Việt..."
  };
  representative: {
    name: string | null;               // "Nguyễn Văn An"
    position: string | null;           // "Giám đốc"
    email: string | null;              // "an.nguyen@devgo2003.com"
  };
  taxCode: string | null;              // "0312345678"
}

parties: Party[];                      // Mảng các bên (thường 2-3 bên)
```

**Ví dụ render UI:**
```tsx
<div className="parties-section">
  {contract.parties.map(party => (
    <PartyCard key={party.id}>
      <h3>{party.name}</h3>
      <Badge>{party.type}</Badge>
      <p>{party.role}</p>
      <ContactInfo>
        <IconMail /> {party.contact.email}
        <IconPhone /> {party.contact.phone}
      </ContactInfo>
      <RepresentativeInfo>
        <strong>{party.representative.name}</strong> - {party.representative.position}
      </RepresentativeInfo>
    </PartyCard>
  ))}
</div>
```

---

### 3. **Thanh toán (Payment)**

```typescript
interface PaymentScheduleItem {
  milestone: string;                   // "Ký hợp đồng và khởi động dự án"
  percentage: number;                  // 20
  amount: number;                      // 200000000 (200 triệu)
  dueDate: string;                     // ISO8601
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
}

interface Payment {
  totalValue: number | null;
  currency: string | null;
  method: "BANK_TRANSFER" | "CREDIT_CARD" | "WIRE" | "CHECK" | "CASH" | "DIGITAL_WALLET" | null;
  schedule: PaymentScheduleItem[];
}
```

**Ví dụ render UI (Timeline thanh toán):**
```tsx
<Timeline>
  {contract.payment.schedule.map((item, index) => (
    <TimelineItem key={index} status={item.status}>
      <div className="milestone-info">
        <h4>{item.milestone}</h4>
        <div className="amount">
          {formatCurrency(item.amount)} ({item.percentage}%)
        </div>
        <div className="due-date">
          Hạn: {formatDate(item.dueDate)}
        </div>
        <StatusBadge status={item.status} />
      </div>
    </TimelineItem>
  ))}
</Timeline>
```

---

### 4. **Điều khoản (Clauses)** - QUAN TRỌNG NHẤT

```typescript
interface Clause {
  name: string;                        // "Điều 8: Trách nhiệm pháp lý"
  description: string;                 // Mô tả chi tiết
  content: string;                     // Trích dẫn CHÍNH XÁC từ hợp đồng
  importance: "HIGH" | "MEDIUM" | "LOW";
  risk?: "HIGH" | "MEDIUM" | "LOW";    // Chỉ có trong key/unfavorable
  advice: string | null;               // Lời khuyên từ AI
  pageNumber: number | null;           // Số trang tìm thấy
  impact?: string;                     // Chỉ có trong unfavorable
  affectedParties?: string[];          // Chỉ có trong unfavorable
}

interface Clauses {
  key: Clause[];                       // Điều khoản QUAN TRỌNG (rủi ro cao)
  favorable: Clause[];                 // Điều khoản THUẬN LỢI (quyền lợi)
  unfavorable: Clause[];               // Điều khoản BẤT LỢI (hạn chế, rủi ro)
  all: Clause[];                       // TẤT CẢ điều khoản
  intellectualProperty?: string;
  confidentiality?: string;
  warranty?: string;
  termination?: string;
}
```

**Ví dụ render UI (Tabs cho từng loại điều khoản):**
```tsx
<Tabs>
  <Tab label={`⚠️ Quan trọng (${clauses.key.length})`}>
    {clauses.key.map(clause => (
      <ClauseCard key={clause.name} riskLevel={clause.risk}>
        <ClauseHeader>
          <h4>{clause.name}</h4>
          <RiskBadge level={clause.risk} />
          <ImportanceBadge level={clause.importance} />
        </ClauseHeader>
        <ClauseContent>
          <p className="description">{clause.description}</p>
          <Collapsible title="Nội dung đầy đủ">
            <p className="content">{clause.content}</p>
          </Collapsible>
        </ClauseContent>
        {clause.advice && (
          <AdviceBox>
            <Icon name="lightbulb" />
            <p>{clause.advice}</p>
          </AdviceBox>
        )}
        <PageReference>Trang {clause.pageNumber}</PageReference>
      </ClauseCard>
    ))}
  </Tab>
  
  <Tab label={`✅ Thuận lợi (${clauses.favorable.length})`}>
    {/* Tương tự, nhưng theme xanh lá */}
  </Tab>
  
  <Tab label={`❌ Bất lợi (${clauses.unfavorable.length})`}>
    {/* Tương tự, nhưng theme đỏ */}
  </Tab>
  
  <Tab label={`📋 Tất cả (${clauses.all.length})`}>
    {/* List view đơn giản */}
  </Tab>
</Tabs>
```

---

### 5. **Nhắc nhở (Reminders)**

```typescript
interface Reminder {
  id: string;                          // "reminder-001"
  type: "DEADLINE" | "MILESTONE" | "REVIEW" | "PAYMENT" | "PAYMENT_DUE";
  title: string;                       // "Thanh toán đợt 1"
  description: string | null;
  content: string | null;
  dueDate: string;                     // ISO8601
  status: "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED";
  priority: "HIGH" | "MEDIUM" | "LOW";
}

reminders: Reminder[];
```

**Ví dụ render UI (Calendar view):**
```tsx
<Calendar>
  {reminders.map(reminder => (
    <CalendarEvent
      key={reminder.id}
      date={reminder.dueDate}
      status={reminder.status}
      priority={reminder.priority}
    >
      <EventTitle>{reminder.title}</EventTitle>
      <EventType>{getTypeLabel(reminder.type)}</EventType>
    </CalendarEvent>
  ))}
</Calendar>

{/* Hoặc List view */}
<ReminderList>
  {reminders
    .filter(r => r.status === 'PENDING')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map(reminder => (
      <ReminderItem key={reminder.id} urgent={isUrgent(reminder.dueDate)}>
        <IconCalendar />
        <div>
          <h5>{reminder.title}</h5>
          <TimeRemaining dueDate={reminder.dueDate} />
        </div>
        <PriorityBadge priority={reminder.priority} />
      </ReminderItem>
    ))}
</ReminderList>
```

---

### 6. **Rủi ro (Risk)**

```typescript
interface RiskFactor {
  category: "FINANCIAL" | "LEGAL" | "OPERATIONAL" | "TECHNICAL" | "SCHEDULE";
  description: string;                 // Tóm tắt rủi ro
  severity: "HIGH" | "MEDIUM" | "LOW";
  probability: "HIGH" | "MEDIUM" | "LOW";
  impact: string;                      // Ảnh hưởng cụ thể
  mitigation: string;                  // Biện pháp giảm thiểu
}

interface Risk {
  level: "LOW" | "MEDIUM" | "HIGH";
  factors: RiskFactor[];
  assessment: string | null;
  recommendations: string | null;
}
```

**Ví dụ render UI (Risk Matrix):**
```tsx
<RiskDashboard>
  <RiskLevelIndicator level={risk.level}>
    <h3>Mức độ rủi ro: {getRiskLabel(risk.level)}</h3>
    <RiskMeter value={getRiskScore(risk.level)} />
  </RiskLevelIndicator>
  
  <RiskFactorsGrid>
    {risk.factors.map((factor, index) => (
      <RiskFactorCard key={index} category={factor.category}>
        <CategoryIcon category={factor.category} />
        <h4>{getCategoryLabel(factor.category)}</h4>
        <p className="description">{factor.description}</p>
        
        <RiskMetrics>
          <Metric label="Mức độ" value={factor.severity} />
          <Metric label="Xác suất" value={factor.probability} />
        </RiskMetrics>
        
        <ImpactSection>
          <strong>Ảnh hưởng:</strong>
          <p>{factor.impact}</p>
        </ImpactSection>
        
        <MitigationSection>
          <strong>Giải pháp:</strong>
          <p>{factor.mitigation}</p>
        </MitigationSection>
      </RiskFactorCard>
    ))}
  </RiskFactorsGrid>
</RiskDashboard>
```

---

### 7. **Tuân thủ (Compliance)**

```typescript
interface Regulation {
  name: string;
  description: string;
  status: "APPLICABLE" | "NOT_APPLICABLE" | "PENDING";
  requirements: string;
}

interface Certification {
  name: string;
  description: string;
  required: boolean;
  expiryDate: string | null;
}

interface Compliance {
  status: "COMPLIANT" | "NON_COMPLIANT" | "PENDING_REVIEW" | "IN_AUDIT";
  regulations: Regulation[];
  certifications: Certification[];
  auditRequirements: string | null;
  reportingRequirements: string | null;
}
```

---

## 🎨 Gợi ý thiết kế UI

### **1. Dashboard tổng quan**
```tsx
<ContractDashboard>
  <ContractHeader
    name={contract.summary}
    value={contract.totalValue}
    status={contract.status}
  />
  
  <StatsGrid>
    <StatCard label="Giá trị hợp đồng" value={formatMoney(contract.totalValue)} />
    <StatCard label="Thời hạn" value={calculateDuration(contract)} />
    <StatCard label="Đã thanh toán" value={calculatePaid(contract.payment)} />
    <StatCard label="Rủi ro" value={contract.risk.level} color={getRiskColor()} />
  </StatsGrid>
  
  <QuickActions>
    <Button icon="file">Xem hợp đồng gốc</Button>
    <Button icon="calendar">Lịch nhắc nhở</Button>
    <Button icon="alert">Cảnh báo rủi ro</Button>
  </QuickActions>
</ContractDashboard>
```

### **2. Timeline thanh toán (Visual)**
```tsx
<PaymentTimeline>
  {payments.map((payment, index) => (
    <TimelineNode
      key={index}
      status={payment.status}
      isNext={isNextPayment(payment)}
    >
      <NodeCircle status={payment.status} />
      <NodeContent>
        <Amount>{formatMoney(payment.amount)}</Amount>
        <Milestone>{payment.milestone}</Milestone>
        <DueDate>
          {payment.status === 'PENDING' && 
            <CountdownTimer dueDate={payment.dueDate} />
          }
        </DueDate>
      </NodeContent>
    </TimelineNode>
  ))}
</PaymentTimeline>
```

### **3. Clause Explorer (Quan trọng nhất)**
```tsx
<ClauseExplorer>
  <ClauseFilters>
    <FilterButton active={filter === 'all'}>
      Tất cả ({clauses.all.length})
    </FilterButton>
    <FilterButton active={filter === 'key'} color="orange">
      ⚠️ Quan trọng ({clauses.key.length})
    </FilterButton>
    <FilterButton active={filter === 'favorable'} color="green">
      ✅ Thuận lợi ({clauses.favorable.length})
    </FilterButton>
    <FilterButton active={filter === 'unfavorable'} color="red">
      ❌ Bất lợi ({clauses.unfavorable.length})
    </FilterButton>
  </ClauseFilters>
  
  <ClauseList>
    {filteredClauses.map(clause => (
      <ClauseItem
        key={clause.name}
        importance={clause.importance}
        risk={clause.risk}
        expandable
      >
        {/* Nội dung clause */}
      </ClauseItem>
    ))}
  </ClauseList>
</ClauseExplorer>
```

---

## 💡 Tips cho Frontend Developer

### **1. Xử lý null/undefined**
```typescript
// Luôn check null vì AI có thể không trích xuất được một số field
const displayValue = contract.totalValue 
  ? formatCurrency(contract.totalValue, contract.currency)
  : 'Chưa xác định';
```

### **2. Format dữ liệu**
```typescript
// Format tiền tệ
const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND'
  }).format(value);
};

// Format ngày
const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('vi-VN');
};

// Tính thời gian còn lại
const getTimeRemaining = (dueDate: string) => {
  const now = new Date();
  const due = new Date(dueDate);
  const days = Math.floor((due - now) / (1000 * 60 * 60 * 24));
  return days > 0 ? `Còn ${days} ngày` : 'Quá hạn';
};
```

### **3. Color coding**
```typescript
const getRiskColor = (level: string) => {
  const colors = {
    'HIGH': '#EF4444',    // Đỏ
    'MEDIUM': '#F59E0B',  // Cam
    'LOW': '#10B981'      // Xanh lá
  };
  return colors[level] || '#6B7280';
};

const getStatusColor = (status: string) => {
  const colors = {
    'PAID': '#10B981',
    'PENDING': '#F59E0B',
    'OVERDUE': '#EF4444',
    'CANCELLED': '#6B7280'
  };
  return colors[status] || '#6B7280';
};
```

### **4. Responsive Design**
```tsx
// Mobile: Stack layout
// Desktop: Grid layout
<ResponsiveGrid
  mobile={1}
  tablet={2}
  desktop={3}
>
  {items.map(item => <Card>{item}</Card>)}
</ResponsiveGrid>
```

---

## 📊 Ví dụ Component hoàn chỉnh

```tsx
import React from 'react';
import { Card, Badge, Timeline, Tabs } from '@/components';
import { ContractAIOutput } from '@/types';

export const ContractDetailPage: React.FC<{ contractId: string }> = ({ contractId }) => {
  const [contract, setContract] = useState<ContractAIOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch contract data từ API
    fetchContract(contractId).then(data => {
      setContract(data);
      setLoading(false);
    });
  }, [contractId]);

  if (loading) return <LoadingSpinner />;
  if (!contract) return <ErrorMessage />;

  return (
    <div className="contract-detail">
      {/* Header Section */}
      <ContractHeader contract={contract} />
      
      {/* Stats Section */}
      <StatsGrid>
        <StatCard
          label="Giá trị"
          value={formatCurrency(contract.totalValue, contract.currency)}
          icon="dollar"
        />
        <StatCard
          label="Rủi ro"
          value={contract.risk.level}
          color={getRiskColor(contract.risk.level)}
          icon="alert"
        />
        <StatCard
          label="Điều khoản"
          value={contract.clauses.all.length}
          icon="file"
        />
      </StatsGrid>
      
      {/* Main Content Tabs */}
      <Tabs>
        <Tab label="Tổng quan">
          <OverviewSection contract={contract} />
        </Tab>
        
        <Tab label="Thanh toán">
          <PaymentTimeline schedule={contract.payment.schedule} />
        </Tab>
        
        <Tab label="Điều khoản">
          <ClausesExplorer clauses={contract.clauses} />
        </Tab>
        
        <Tab label="Rủi ro">
          <RiskAnalysis risk={contract.risk} />
        </Tab>
        
        <Tab label="Nhắc nhở">
          <RemindersCalendar reminders={contract.reminders} />
        </Tab>
      </Tabs>
    </div>
  );
};
```

---

## ✅ Checklist cho Frontend

- [ ] Handle null/undefined values gracefully
- [ ] Format currency theo locale (VNĐ, USD...)
- [ ] Format dates theo timezone VN
- [ ] Color coding cho risk levels, status
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states cho API calls
- [ ] Error handling
- [ ] Empty states khi không có data
- [ ] Search/Filter cho clauses list
- [ ] Export to PDF functionality
- [ ] Print-friendly layout
- [ ] Accessibility (ARIA labels, keyboard navigation)

---

**Lưu ý:** File mock data mẫu đã được tạo tại: 
- `documents/samples/AI-OUTPUT-SAMPLE-1BILLION.json` (version ngắn gọn)
