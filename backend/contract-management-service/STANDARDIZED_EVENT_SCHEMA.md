# Chuẩn hóa Event Schema và API Response

## Tổng quan

Tài liệu này mô tả cấu trúc chuẩn hóa cho Event `SummaryCreated` từ AI Processing Service và API Response từ Contract Management Service.

## 1. Event SummaryCreated (AI Processing Service)

### Cấu trúc Event
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

## 2. API Response (Contract Management Service)

### GET /api/v1/contract-management-service/contracts/{id}

```json
{
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Thông tin hợp đồng đã được lấy thành công với format mới nhất quán với AI event structure.",
  "data": {
    "id": 1,
    "contractNumber": "CONTRACT-1234567890",
    "title": "Hợp đồng cung cấp dịch vụ phần mềm",
    "status": "DRAFT",
    "summary": "Tóm tắt hợp đồng",
    "contractType": "SERVICE_AGREEMENT",
    "riskLevel": "MEDIUM",
    "keyTerms": "Điều khoản chính",
    "aiProcessed": true,
    "processingStatus": "COMPLETED",
    "createdAt": "2024-01-01T10:00:00",
    "createdBy": "system",
    "deletedAt": null,
    "deletedBy": null,
    "isDeleted": false,
    "version": 1,
    "contractObject": "Cung cấp dịch vụ phát triển phần mềm quản lý nhà thuốc",
    "effectiveDate": "2024-01-01",
    "contractTerm": "6 năm, tự động gia hạn các năm tiếp theo",
    "totalValue": "4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)",
    "paymentSchedule": "Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu",
    "currency": "VND",
    "terminationConditions": "Hợp đồng có thể bị chấm dứt trước thời hạn nếu các bên thỏa thuận",
    "riskAssessment": "Đánh giá rủi ro",
    "complianceStatus": "COMPLIANT",
    "legalReviewRequired": false,
    "reviewDeadline": null,
    "contractSummary": {
      "title": "Hợp đồng cung cấp dịch vụ phần mềm",
      "tag": ["service", "software", "development", "contract"],
      "parties": [
        {
          "id": 1,
          "contractId": 1,
          "partyName": "Công ty Cổ phần Phát triển Phần mềm",
          "partyRole": "Bên cung cấp dịch vụ (Bên B)",
          "representative": "Ông Nguyễn Văn Dũng, Giám đốc",
          "taxCode": "0109889002",
          "contactInfo": "0983.456.455",
          "address": "123 Đường ABC, Quận 1, TP.HCM",
          "businessLicense": "BL123456789",
          "partyType": "COMPANY",
          "isPrimary": true,
          "createdAt": "2024-01-01T10:00:00",
          "updatedAt": "2024-01-01T10:00:00"
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
    },
    "summaries": [
      {
        "title": "contract.pdf",
        "object": "Tóm tắt từ AI"
      }
    ],
    "parties": [
      {
        "id": 1,
        "contractId": 1,
        "partyName": "Công ty Cổ phần Phát triển Phần mềm",
        "partyRole": "Bên cung cấp dịch vụ (Bên B)",
        "representative": "Ông Nguyễn Văn Dũng, Giám đốc",
        "taxCode": "0109889002",
        "contactInfo": "0983.456.455",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "businessLicense": "BL123456789",
        "partyType": "COMPANY",
        "isPrimary": true,
        "createdAt": "2024-01-01T10:00:00",
        "updatedAt": "2024-01-01T10:00:00"
      }
    ]
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "requestId": "uuid-string",
  "path": "/api/v1/contract-management-service/contracts/1"
}
```

## 3. Database Schema Updates

### Contract Table
```sql
-- Thêm các trường mới
ALTER TABLE contracts 
ADD COLUMN payment_method VARCHAR(255) NULL COMMENT 'Phương thức thanh toán',
ADD COLUMN reminders JSON NULL COMMENT 'Danh sách nhắc nhở hợp đồng';

-- Cập nhật comment cho các trường hiện có
ALTER TABLE contracts 
MODIFY COLUMN contract_object TEXT COMMENT 'Đối tượng hợp đồng',
MODIFY COLUMN effective_date VARCHAR(255) COMMENT 'Ngày có hiệu lực (yyyy-MM-dd)',
MODIFY COLUMN contract_term VARCHAR(255) COMMENT 'Thời hạn hợp đồng',
MODIFY COLUMN total_value VARCHAR(255) COMMENT 'Tổng giá trị hợp đồng',
MODIFY COLUMN payment_schedule TEXT COMMENT 'Lịch trình thanh toán',
MODIFY COLUMN currency VARCHAR(50) COMMENT 'Đơn vị tiền tệ',
MODIFY COLUMN termination_conditions TEXT COMMENT 'Điều kiện chấm dứt hợp đồng',
MODIFY COLUMN risk_assessment TEXT COMMENT 'Đánh giá rủi ro (JSON)',
MODIFY COLUMN compliance_status VARCHAR(100) COMMENT 'Trạng thái tuân thủ',
MODIFY COLUMN legal_review_required BOOLEAN DEFAULT FALSE COMMENT 'Yêu cầu rà soát pháp lý',
MODIFY COLUMN review_deadline DATE NULL COMMENT 'Hạn chót rà soát';
```

## 4. Luồng xử lý

### 4.1 AI Processing Flow
1. **File Upload** → File Storage Service
2. **FileUploaded Event** → AI Processing Service
3. **AI Processing** → Extract, Classify, Summarize
4. **SummaryCreated Event** → Contract Management Service
5. **Contract Creation** → Database

### 4.2 Event Processing
1. **Kafka Listener** nhận SummaryCreated event
2. **AiEventProcessingService** xử lý event
3. **Contract Creation/Update** với thông tin từ AI
4. **Contract Parties** được tạo từ event data
5. **Contract Summary** được lưu trữ

## 5. Lợi ích của cấu trúc mới

### 5.1 Nhất quán
- Tất cả services sử dụng cùng format camelCase
- Event và API response có cấu trúc tương đồng
- Dễ dàng mapping giữa event và database

### 5.2 Đầy đủ thông tin
- File information: metadata về file gốc
- AI processing result: thông tin về quá trình xử lý AI
- Contract summary: thông tin nghiệp vụ chi tiết

### 5.3 Mở rộng
- Dễ dàng thêm fields mới
- Hỗ trợ nhiều loại contract khác nhau
- Flexible schema cho future requirements

### 5.4 Traceable
- Correlation ID để trace end-to-end
- Event ID cho idempotency
- Timestamp cho audit trail

## 6. Implementation Notes

### 6.1 AI Processing Service
- Cập nhật prompt để sử dụng camelCase
- Thêm riskAssessment và complianceStatus
- Chuẩn hóa event structure

### 6.2 Contract Management Service
- Thêm AiEventProcessingService
- Cập nhật ContractResponseDto
- Thêm Kafka listener
- Cập nhật database schema

### 6.3 Database Migration
- Chạy script `update_contract_schema.sql`
- Backup data trước khi migrate
- Test với dữ liệu thực tế

## 7. Testing

### 7.1 Event Testing
```bash
# Test AI Processing Service
curl -X POST http://localhost:8017/api/v1/ai-processing-service/summarize \
  -H "Content-Type: multipart/form-data" \
  -F "file=@contract.pdf"
```

### 7.2 API Testing
```bash
# Test Contract Management Service
curl -X GET http://localhost:8003/api/v1/contract-management-service/contracts/1
```

### 7.3 Integration Testing
- Upload file → Verify event → Check contract creation
- Verify data consistency between event and API response
- Test error handling and edge cases
