# Enum Values Documentation - API v3

## Complete list of all enum values in English with full possible values

---

## 🔹 Root Level Enums

### **statusCode** (HTTP Status Code)
- **200** - SUCCESS
- **204** - NO_CONTENT
- **400** - BAD_REQUEST
- **404** - NOT_FOUND
- **409** - CONFLICT
- **500** - INTERNAL_SERVER_ERROR

### **shortMessage** (Short Response Message)
- **SUCCESS** - Success
- **NOT_FOUND** - Not Found
- **BAD_REQUEST** - Bad Request
- **CONFLICT** - Conflict
- **NO_CONTENT** - No Content
- **INTERNAL_SERVER_ERROR** - Internal Server Error

---

## 🔹 Overview Section

### **overview.status** (Document Lifecycle Status)
- **ACTIVE** - Active
- **DRAFT** - Draft
- **DELETED** - Deleted
- **ARCHIVED** - Archived
- **INACTIVE** - Inactive

### **overview.documentType** (Document Type)
- **CONTRACT** - Contract
- **INVOICE** - Invoice
- **MEMO** - Memo
- **REPORT** - Report
- **AGREEMENT** - Agreement
- **NOT_DOCUMENT** - Not a Document

### **overview.language** (Language Code - ISO 639-1)
- **vi** - Vietnamese
- **en** - English
- **fr** - French
- **zh** - Chinese

### **overview.region** (Region Code - ISO 3166-1)
- **VN** - Vietnam
- **US** - United States
- **EU** - European Union
- **APAC** - Asia Pacific

---

## 🔹 Metadata Section

### **metadata.file.mimeType** (MIME Type)
- **application/pdf** - PDF Document
- **text/plain** - Plain Text
- **application/json** - JSON File

### **metadata.originalDocument.dcFormat** (Dublin Core Format)
- **application/pdf** - PDF Document
- **text/plain** - Plain Text
- **application/json** - JSON File
- **unknown** - Unknown Format

### **metadata.originalDocument.pdfaidPart** (PDF/A Part Number)
- **1** - PDF/A-1
- **2** - PDF/A-2
- **3** - PDF/A-3

### **metadata.originalDocument.pdfaidConformance** (PDF/A Conformance Level)
- **A** - Level A (Accessible)
- **B** - Level B (Basic)
- **U** - Level U (Unicode)

### **metadata.technical.encoding** (Text Encoding)
- **UTF-8** - UTF-8
- **UTF-16** - UTF-16
- **ASCII** - ASCII

### **metadata.technical.lineEnding** (Line Ending Style)
- **LF** - Line Feed (Unix)
- **CRLF** - Carriage Return + Line Feed (Windows)

### **metadata.technical.compression** (Compression Method)
- **NONE** - No Compression
- **GZIP** - GZIP Compression
- **DEFLATE** - DEFLATE Compression

---

## 🔹 Contract Section

### **contract.type** (Contract Type)
- **SERVICE_AGREEMENT** - Service Agreement
- **PURCHASE_AGREEMENT** - Purchase Agreement
- **PARTNERSHIP_AGREEMENT** - Partnership Agreement
- **EMPLOYMENT_CONTRACT** - Employment Contract
- **SALES_CONTRACT** - Sales Contract
- **LEASE_AGREEMENT** - Lease Agreement
- **LICENSE_AGREEMENT** - License Agreement
- **NON_DISCLOSURE_AGREEMENT** - Non-Disclosure Agreement
- **SOFTWARE_DEVELOPMENT** - Software Development
- **CONSULTING_AGREEMENT** - Consulting Agreement
- **OTHERS** - Others (custom string allowed)

### **contract.currency** (Currency Code - ISO 4217)
- **USD** - US Dollar
- **VND** - Vietnamese Dong
- **EUR** - Euro
- **JPY** - Japanese Yen

### **contract.priority** (Priority Level)
- **HIGH** - High Priority
- **MEDIUM** - Medium Priority
- **LOW** - Low Priority

### **contract.confidentiality** (Confidentiality Level)
- **CONFIDENTIAL** - Confidential
- **INTERNAL** - Internal Use Only
- **PUBLIC** - Public
- **RESTRICTED** - Restricted

### **contract.workflow.currentStage** (Current Workflow Stage)
- **DRAFT** - Draft
- **REVIEW** - Under Review
- **APPROVAL** - Awaiting Approval
- **SIGNED** - Signed
- **EXECUTED** - Executed
- **TERMINATED** - Terminated

### **contract.workflow.stages[].name** (Stage Name)
- **DRAFT** - Draft
- **REVIEW** - Review
- **APPROVAL** - Approval
- **SIGNED** - Signed
- **EXECUTED** - Executed
- **TERMINATED** - Terminated

### **contract.workflow.stages[].status** (Stage Status)
- **COMPLETED** - Completed
- **IN_PROGRESS** - In Progress
- **PENDING** - Pending
- **FAILED** - Failed

### **contract.parties[].type** (Party Type)
- **CLIENT** - Client
- **VENDOR** - Vendor
- **PARTNER** - Partner
- **GUARANTOR** - Guarantor

### **contract.payment.method** (Payment Method)
- **BANK_TRANSFER** - Bank Transfer
- **CREDIT_CARD** - Credit Card
- **WIRE** - Wire Transfer
- **CHECK** - Check
- **CASH** - Cash
- **DIGITAL_WALLET** - Digital Wallet

### **contract.payment.schedule[].status** (Payment Status)
- **PENDING** - Pending
- **PAID** - Paid
- **OVERDUE** - Overdue
- **CANCELLED** - Cancelled

### **contract.clauses.key[].importance** (Clause Importance)
- **HIGH** - High Importance
- **MEDIUM** - Medium Importance
- **LOW** - Low Importance

### **contract.clauses.key[].risk** (Clause Risk Level)
- **LOW** - Low Risk
- **MEDIUM** - Medium Risk
- **HIGH** - High Risk

### **contract.clauses.unfavorable[].risk** (Unfavorable Clause Risk)
- **LOW** - Low Risk
- **MEDIUM** - Medium Risk
- **HIGH** - High Risk

### **contract.reminders[].type** (Reminder Type)
- **PAYMENT_DUE** - Payment Due
- **MILESTONE_REVIEW** - Milestone Review
- **EXPIRY_WARNING** - Expiry Warning
- **CONTRACT_RENEWAL** - Contract Renewal

### **contract.reminders[].status** (Reminder Status)
- **PENDING** - Pending
- **SENT** - Sent
- **RESOLVED** - Resolved
- **OVERDUE** - Overdue

### **contract.reminders[].priority** (Reminder Priority)
- **HIGH** - High Priority
- **MEDIUM** - Medium Priority
- **LOW** - Low Priority

### **contract.risk.level** (Overall Risk Level)
- **LOW** - Low Risk
- **MEDIUM** - Medium Risk
- **HIGH** - High Risk

### **contract.risk.factors[].type** (Risk Factor Type)
- **TECHNICAL** - Technical Risk
- **SCHEDULE** - Schedule Risk
- **FINANCIAL** - Financial Risk
- **LEGAL** - Legal Risk
- **OPERATIONAL** - Operational Risk

### **contract.risk.factors[].probability** (Risk Probability)
- **LOW** - Low Probability
- **MEDIUM** - Medium Probability
- **HIGH** - High Probability

### **contract.risk.factors[].impact** (Risk Impact)
- **LOW** - Low Impact
- **MEDIUM** - Medium Impact
- **HIGH** - High Impact

### **contract.risk.mitigationProposals[].cost** (Mitigation Cost)
- **LOW** - Low Cost
- **MEDIUM** - Medium Cost
- **HIGH** - High Cost

### **contract.compliance.status** (Compliance Status)
- **COMPLIANT** - Compliant
- **NON_COMPLIANT** - Non-Compliant
- **PENDING_REVIEW** - Pending Review
- **IN_AUDIT** - In Audit

---

## 🔹 Content Section

### **content.ocr.status** (OCR Processing Status)
- **COMPLETED** - Completed
- **FAILED** - Failed
- **PROCESSING** - Processing
- **SKIPPED** - Skipped

### **content.ocr.engine** (OCR Engine)
- **GEMINI_VISION** - Gemini Vision API
- **TESSERACT** - Tesseract OCR
- **TESSERACT_FALLBACK** - Tesseract Fallback
- **PADDLEOCR** - PaddleOCR

### **content.extraction.status** (Extraction Status)
- **SUCCESS** - Success
- **PARTIAL** - Partial Success
- **FAILED** - Failed

### **content.extraction.method** (Extraction Method)
- **DIRECT** - Direct Text Extraction
- **OCR** - OCR Extraction
- **HYBRID** - Hybrid (Direct + OCR)

### **content.summarization.status** (Summarization Status)
- **SUCCESS** - Success
- **FAILED** - Failed
- **SKIPPED** - Skipped

### **content.classification.language** (Detected Language - ISO 639-1)
- **vi** - Vietnamese
- **en** - English
- **fr** - French
- **zh** - Chinese

### **content.processing.status** (Overall Processing Status)
- **COMPLETED** - Completed
- **PROCESSING** - Processing
- **FAILED** - Failed

### **content.jsonAnalysisStatus** (JSON Analysis Status)
- **PARSED** - Successfully Parsed
- **INVALID** - Invalid JSON
- **PENDING** - Pending Analysis

---

## 🔹 Storage Section

### **storage.s3.region** (AWS S3 Region)
- **us-east-1** - US East (N. Virginia)
- **us-west-2** - US West (Oregon)
- **eu-west-1** - EU (Ireland)
- **ap-southeast-1** - Asia Pacific (Singapore)

---

## 🔹 Security Section

### **security.encryption** (Encryption Algorithm)
- **AES-256** - AES 256-bit
- **AES-128** - AES 128-bit
- **NONE** - No Encryption

---

## 🔹 Versioning Section

### **versioning.history[].changeType** (Change Type)
- **CREATE** - Created
- **UPDATE** - Updated
- **DELETE** - Deleted
- **ARCHIVE** - Archived

---

## 🔹 Audit Section

### **audit.changeHistory[].action** (Change Action)
- **CREATE** - Created
- **UPDATE** - Updated
- **DELETE** - Deleted
- **VIEW** - Viewed
- **SHARE** - Shared
- **DOWNLOAD** - Downloaded
- **UPLOAD** - Uploaded
- **RESTORE** - Restored

### **audit.accessLog[].action** (Access Action)
- **VIEW** - Viewed
- **EDIT** - Edited
- **DOWNLOAD** - Downloaded
- **SHARE** - Shared
- **DELETE** - Deleted

---

## 📝 Usage Notes

### **Boolean Fields**
All boolean fields use standard JSON boolean values:
- **true** - Yes/Enabled
- **false** - No/Disabled

### **Null Values**
Fields that can be null are explicitly marked with `null` when no value exists.

### **String Enums**
All enum values are UPPERCASE strings except:
- **Language codes**: lowercase (ISO 639-1)
- **Region codes**: UPPERCASE (ISO 3166-1)
- **Currency codes**: UPPERCASE (ISO 4217)

### **Custom Values**
Some fields allow custom string values beyond the enum list:
- **contract.type**: Can accept custom contract type strings
- **contract.parties[].role**: Can accept custom role descriptions

---

## 🔄 Version History

**Version 3.0** (2025-10-22)
- All enum values converted to English
- Complete enum documentation
- Removed duplicate fields
- Optimized for MongoDB storage
- Enhanced audit/versioning structure

**Version 2.0** (2025-10-21)
- Restructured into 8 main sections
- Removed duplicate fields
- Enhanced security section

**Version 1.0** (2024-10-19)
- Initial schema design

---

**Last Updated:** 2025-10-22  
**Schema Version:** v3  
**API Version:** v1
