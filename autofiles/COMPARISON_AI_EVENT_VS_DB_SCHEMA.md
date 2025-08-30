# So sánh AI Event vs Database Schema - Contract Management Service

## 1. AI Processing Service Event Structure

### Event: SummaryCreated
```json
{
  "eventVersion": "v1",
  "eventType": "SummaryCreated",
  "eventId": "uuid-string",
  "timestamp": "2024-01-01T10:00:00Z",
  "source": "ai-processing-service",
  "correlationId": "uuid-string",
  "actor": {
    "userId": "user-id",
    "userRole": "uploader",
    "ip": "client-ip"
  },
  "data": {
    "fileInformation": {
      "fileId": "file-id",
      "filename": "contract.pdf",
      "fileType": "CONTRACT",
      "fileKey": "file-key",
      "bucket": "bucket-name",
      "contentType": "application/pdf",
      "fileSize": 1024000,
      "uploadedAt": "2024-01-01T10:00:00Z"
    },
    "aiProcessingResult": {
      "extractionMethod": "AI/OCR",
      "confidence": 0.95,
      "processingTime": 15000,
      "modelVersion": "gemini-2.0-flash",
      "processedAt": "2024-01-01T10:00:00Z"
    },
    "contractSummary": {
      "title": "Hợp đồng cung cấp dịch vụ phần mềm",
      "tag": ["service", "software", "development", "contract"],
      "parties": [
        {
          "name": "Công ty Cổ phần Phát triển Phần mềm",
          "role": "Bên cung cấp dịch vụ (Bên B)",
          "representative": "Ông Nguyễn Văn Dũng, Giám đốc",
          "taxCode": "0109889002",
          "contact": "0983.456.455",
          "address": "123 Đường ABC, Quận 1, TP.HCM",
          "businessLicense": "BL123456789"
        }
      ],
      "object": "Cung cấp dịch vụ phát triển phần mềm quản lý nhà thuốc",
      "effectiveDate": "2024-01-01",
      "term": "6 năm, tự động gia hạn các năm tiếp theo",
      "paymentDetails": {
        "totalValue": "4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)",
        "schedule": "Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu",
        "currency": "VND",
        "paymentMethod": "Chuyển khoản ngân hàng"
      },
      "keyClauses": [
        {
          "name": "Nội dung hợp tác",
          "description": "Các bên thỏa thuận về việc cung cấp và sử dụng dịch vụ",
          "source": "Điều 1"
        }
      ],
      "favorableClauses": [
        {
          "clauseName": "Tự động gia hạn không phí",
          "description": "Hợp đồng có hiệu lực và sẽ tự động gia hạn các năm tiếp theo",
          "benefitTo": "Bên sử dụng dịch vụ (Bên A)"
        }
      ],
      "unfavorableClauses": [
        {
          "clauseName": "Tự động gia hạn",
          "description": "Hợp đồng sẽ tự động gia hạn hàng năm mà không cần thông báo",
          "riskTo": "Bên sử dụng dịch vụ (Bên A)"
        }
      ],
      "reminders": [
        {
          "type": "gia hạn",
          "date": "2029-12-31",
          "content": "Hợp đồng sẽ tự động gia hạn vào ngày này"
        }
      ],
      "terminationConditions": "Hợp đồng có thể bị chấm dứt trước thời hạn nếu các bên thỏa thuận",
      "riskAssessment": {
        "riskLevel": "MEDIUM",
        "riskFactors": [
          "Tự động gia hạn không thông báo",
          "Phạt vi phạm cao"
        ],
        "mitigationMeasures": [
          "Theo dõi sát sao thời hạn hợp đồng",
          "Tuân thủ nghiêm ngặt các điều khoản"
        ]
      },
      "complianceStatus": {
        "status": "COMPLIANT",
        "issues": [],
        "recommendations": [
          "Rà soát lại điều khoản tự động gia hạn"
        ]
      }
    }
  },
  "metadata": {
    "serviceVersion": "1.0.0",
    "region": "ap-southeast-1"
  }
}
```

## 2. Database Schema - Contract Management Service

### Contract Entity
```java
@Entity
@Table(name = "contracts")
public class Contract extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_number", nullable = false, unique = true)
    private String contractNumber;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status;

    @Column(name = "parties_json", columnDefinition = "JSON")
    private String partiesJson;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "system_id")
    private String systemId;

    // Thông tin tóm tắt hợp đồng
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "contract_type")
    private String contractType;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "key_terms", columnDefinition = "TEXT")
    private String keyTerms;

    @Column(name = "ai_processed")
    private Boolean aiProcessed = false;

    @Column(name = "processing_status")
    @Enumerated(EnumType.STRING)
    private ProcessingStatus processingStatus = ProcessingStatus.PENDING;

    // New fields from updated schema
    @Column(name = "contract_object", columnDefinition = "TEXT")
    private String contractObject;

    @Column(name = "effective_date")
    private String effectiveDate;

    @Column(name = "contract_term")
    private String contractTerm;

    @Column(name = "total_value")
    private String totalValue;

    @Column(name = "payment_schedule", columnDefinition = "TEXT")
    private String paymentSchedule;

    @Column(name = "currency")
    private String currency;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "reminders", columnDefinition = "JSON")
    private String reminders;

    @Column(name = "termination_conditions", columnDefinition = "TEXT")
    private String terminationConditions;

    @Column(name = "risk_assessment", columnDefinition = "TEXT")
    private String riskAssessment;

    @Column(name = "compliance_status")
    private String complianceStatus;

    @Column(name = "legal_review_required")
    private Boolean legalReviewRequired = false;

    @Column(name = "review_deadline")
    private LocalDate reviewDeadline;
}
```

### ContractParty Entity
```java
@Entity
@Table(name = "contract_parties")
public class ContractParty extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "party_name", nullable = false)
    private String partyName;

    @Column(name = "party_role")
    private String partyRole;

    @Column(name = "representative")
    private String representative;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "contact_info")
    private String contactInfo;

    @Column(name = "address")
    private String address;

    @Column(name = "business_license")
    private String businessLicense;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type")
    private PartyType partyType;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;
}
```

### ContractSummary Entity
```java
@Entity
@Table(name = "contract_summaries")
public class ContractSummary extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "file_id")
    private String fileId;

    @Column(name = "filename")
    private String filename;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "summary_length")
    private Integer summaryLength;

    @Column(name = "key_points", columnDefinition = "TEXT")
    private String keyPoints;

    @Column(name = "extraction_method")
    private String extractionMethod;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "classification")
    private String classification;

    @Column(name = "classification_confidence")
    private Double classificationConfidence;

    @Column(name = "categories", columnDefinition = "TEXT")
    private String categories;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
```

## 3. So sánh Mapping

### 3.1 Mapping trực tiếp

| AI Event Field | Database Field | Mapping Type | Notes |
|----------------|----------------|--------------|-------|
| `contractSummary.title` | `contracts.title` | Direct | ✅ |
| `contractSummary.object` | `contracts.contract_object` | Direct | ✅ |
| `contractSummary.effectiveDate` | `contracts.effective_date` | Direct | ✅ |
| `contractSummary.term` | `contracts.contract_term` | Direct | ✅ |
| `contractSummary.paymentDetails.totalValue` | `contracts.total_value` | Direct | ✅ |
| `contractSummary.paymentDetails.currency` | `contracts.currency` | Direct | ✅ |
| `contractSummary.paymentDetails.paymentMethod` | `contracts.payment_method` | Direct | ✅ |
| `contractSummary.paymentDetails.schedule` | `contracts.payment_schedule` | Direct | ✅ |
| `contractSummary.terminationConditions` | `contracts.termination_conditions` | Direct | ✅ |
| `contractSummary.reminders` | `contracts.reminders` | JSON | ✅ |
| `contractSummary.riskAssessment` | `contracts.risk_assessment` | JSON | ✅ |
| `contractSummary.complianceStatus.status` | `contracts.compliance_status` | Direct | ✅ |

### 3.2 Mapping phức tạp

| AI Event Field | Database Field | Mapping Type | Notes |
|----------------|----------------|--------------|-------|
| `contractSummary.parties[]` | `contract_parties` table | One-to-Many | ✅ Tạo nhiều records |
| `contractSummary.tag[]` | `contracts.contract_type` | Derived | ⚠️ Cần logic mapping |
| `contractSummary.keyClauses[]` | `contracts.key_terms` | JSON | ✅ |
| `contractSummary.favorableClauses[]` | `contracts.key_terms` | Combined JSON | ⚠️ Gộp với keyClauses |
| `contractSummary.unfavorableClauses[]` | `contracts.key_terms` | Combined JSON | ⚠️ Gộp với keyClauses |

### 3.3 Metadata Mapping

| AI Event Field | Database Field | Mapping Type | Notes |
|----------------|----------------|--------------|-------|
| `fileInformation.fileId` | `contracts.system_id` | Direct | ✅ |
| `fileInformation.filename` | `contract_summaries.filename` | Direct | ✅ |
| `aiProcessingResult.confidence` | `contract_summaries.confidence` | Direct | ✅ |
| `aiProcessingResult.extractionMethod` | `contract_summaries.extraction_method` | Direct | ✅ |
| `aiProcessingResult.processedAt` | `contract_summaries.processed_at` | Direct | ✅ |

## 4. Điểm khác biệt và Vấn đề

### 4.1 Điểm khác biệt chính

1. **Cấu trúc dữ liệu**:
   - AI Event: Nested JSON structure
   - Database: Normalized relational structure

2. **Parties handling**:
   - AI Event: Array trong contractSummary
   - Database: Separate table với foreign key

3. **Clauses handling**:
   - AI Event: Separate arrays (keyClauses, favorableClauses, unfavorableClauses)
   - Database: Single JSON field (key_terms)

4. **Risk Assessment**:
   - AI Event: Structured object với riskLevel, riskFactors, mitigationMeasures
   - Database: JSON string

### 4.2 Vấn đề cần giải quyết

1. **Data Loss**: Một số thông tin chi tiết có thể bị mất khi chuyển đổi
2. **Query Performance**: JSON fields khó query và index
3. **Data Consistency**: Cần validation khi mapping
4. **Versioning**: Schema changes có thể ảnh hưởng đến mapping

## 5. Đề xuất cải thiện

### 5.1 Database Schema Optimization

```sql
-- Thêm các bảng riêng cho clauses
CREATE TABLE contract_clauses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    clause_type ENUM('KEY', 'FAVORABLE', 'UNFAVORABLE'),
    name VARCHAR(255),
    description TEXT,
    source VARCHAR(255),
    benefit_to VARCHAR(255),
    risk_to VARCHAR(255),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- Thêm bảng riêng cho risk assessment
CREATE TABLE contract_risk_assessments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH'),
    risk_factors JSON,
    mitigation_measures JSON,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
```

### 5.2 Mapping Service Enhancement

```java
@Service
public class AiEventMappingService {
    
    public Contract mapFromAiEvent(AiEventDto event) {
        Contract contract = new Contract();
        
        // Direct mappings
        contract.setTitle(event.getData().getContractSummary().getTitle());
        contract.setContractObject(event.getData().getContractSummary().getObject());
        contract.setEffectiveDate(event.getData().getContractSummary().getEffectiveDate());
        
        // Complex mappings
        contract.setKeyTerms(combineClauses(event.getData().getContractSummary()));
        contract.setRiskAssessment(mapRiskAssessment(event.getData().getContractSummary().getRiskAssessment()));
        
        return contract;
    }
    
    private String combineClauses(ContractSummaryDto summary) {
        // Logic để combine tất cả clauses
    }
}
```

## 6. Kết luận

Mapping giữa AI Event và Database Schema hiện tại **có thể thực hiện được** nhưng cần:

1. **Cải thiện schema** để hỗ trợ tốt hơn structured data
2. **Tối ưu mapping logic** để tránh data loss
3. **Thêm validation** để đảm bảo data consistency
4. **Cân nhắc performance** khi query JSON fields

Schema hiện tại đã hỗ trợ cơ bản cho việc lưu trữ dữ liệu từ AI Event, nhưng cần cải thiện để tận dụng tối đa thông tin từ AI Processing Service.

