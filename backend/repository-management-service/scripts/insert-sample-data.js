// MongoDB Script: Insert Sample Data for Testing
// Run this in MongoDB Compass or mongo shell
// Database: docgo
// Collection: files

use docgo;

// Insert sample file document
db.files.insertOne({
  "_id": "FILE-2025-001-TEST",
  "overview": {
    "title": "Test Contract Document",
    "status": "ACTIVE",
    "documentType": "CONTRACT",
    "tags": ["contract", "test"],
    "ownerUserId": "system",
    "language": "vi",
    "region": "VN",
    "isNew": true
  },
  "metadata": {
    "file": {
      "name": "test-contract.pdf",
      "mimeType": "application/pdf",
      "size": NumberLong(312),
      "hash": {
        "md5": "a1b2c3d4e5f6789012345678901234567",
        "sha256": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      }
    },
    "fileSystem": {
      "dateAdded": "2025-10-19T08:45:00Z",
      "dateModified": "2025-10-19T08:45:00Z",
      "originalFilename": "test-upload-file.txt",
      "originalMD5": "md5-hash-abc123",
      "originalFileSize": NumberLong(312),
      "originalMimeType": "text/plain",
      "archiveMD5": "md5-hash-def456",
      "archiveFileSize": NumberLong(312)
    },
    "originalDocument": {
      "dcFormat": "application/pdf",
      "dcTitle": "Software Development Contract",
      "dcCreator": "Microsoft Word 2019",
      "dcDescription": "Document management system development contract",
      "dcSubject": "Contract, Software Development, DocGO",
      "xmpCreateDate": "2024-01-15T08:30:00Z",
      "xmpCreatorTool": "Microsoft Word 2019",
      "xmpModifyDate": "2024-01-15T09:00:00Z",
      "xmpMetadataDate": "2024-01-15T09:00:00Z",
      "xmpDocumentID": "doc-2024-004-new",
      "xmpInstanceID": "doc-2024-004-new-v1.0",
      "pdfKeywords": "contract, development, software, DocGO",
      "pdfProducer": "Microsoft Word 2019",
      "pdfaidPart": NumberInt(3),
      "pdfaidConformance": "B"
    },
    "archivedDocument": {
      "dcFormat": "application/pdf",
      "dcTitle": "Software Development Contract (Archived)",
      "dcCreator": "Archive System",
      "pdfProducer": "DocGO Archive System v1.0",
      "xmpCreateDate": "2024-01-15T08:30:00Z",
      "xmpModifyDate": "2024-01-15T09:00:00Z",
      "xmpMetadataDate": "2024-01-15T09:00:00Z",
      "xmpCreatorTool": "OCRmyPDF 16.10.4 / Tesseract OCR",
      "xmpDocumentID": "doc-2024-004-new-archived",
      "pdfaidPart": NumberInt(3),
      "pdfaidConformance": "A"
    },
    "technical": {
      "encoding": "UTF-8",
      "lineEnding": "LF",
      "bom": false,
      "compression": "NONE",
      "pages": NumberInt(15),
      "wordCount": NumberInt(2500),
      "characterCount": NumberInt(15000)
    }
  },
  "contract": {
    "type": "SOFTWARE_DEVELOPMENT",
    "effectiveDate": "2025-11-01",
    "expiryDate": "2025-12-31",
    "totalValue": 100000.0,
    "currency": "USD",
    "summary": "Software development contract between Company A and Company B with total value of 100,000 USD",
    "project": "DocGO Platform Development",
    "department": "IT Department",
    "priority": "HIGH",
    "confidentiality": "CONFIDENTIAL",
    "workflow": {
      "currentStage": "APPROVAL",
      "stages": [
        {
          "name": "DRAFT",
          "status": "COMPLETED",
          "completedAt": "2024-01-15T09:00:00Z",
          "assignedTo": "user-001"
        },
        {
          "name": "REVIEW",
          "status": "COMPLETED",
          "completedAt": "2024-01-20T14:30:00Z",
          "assignedTo": "user-002"
        },
        {
          "name": "APPROVAL",
          "status": "IN_PROGRESS",
          "startedAt": "2024-01-21T08:00:00Z",
          "assignedTo": "user-003"
        }
      ]
    },
    "parties": [
      {
        "id": "party-001",
        "name": "Company A",
        "type": "CLIENT",
        "role": "Party A",
        "taxCode": "ABC123",
        "contact": {
          "email": "contact@companya.com",
          "phone": "+84-28-1234-5678",
          "address": "123 Nguyen Hue, District 1, Ho Chi Minh City"
        },
        "representative": {
          "name": "Nguyen Van A",
          "position": "Director",
          "email": "nguyenvana@companya.com"
        }
      }
    ],
    "payment": {
      "method": "BANK_TRANSFER",
      "schedule": [
        {
          "milestone": "Contract signing",
          "percentage": NumberInt(50),
          "amount": 50000.0,
          "dueDate": "2025-11-01T00:00:00Z",
          "status": "PENDING"
        }
      ]
    },
    "clauses": {
      "key": [
        {
          "name": "Scope of work",
          "description": "Detailed description of DocGO document management system development scope",
          "content": "Party B commits to develop DocGO system with full AI and security features",
          "importance": "HIGH",
          "risk": "LOW",
          "advice": "Recommend clarifying technical details"
        }
      ],
      "unfavorable": [],
      "intellectualProperty": "All intellectual property rights belong to Party A",
      "confidentiality": "Party B commits to maintain project information confidentiality",
      "warranty": "12-month warranty after acceptance",
      "termination": "Contract may be terminated with 30-day advance notice"
    },
    "reminders": [
      {
        "id": "reminder-001",
        "type": "PAYMENT_DUE",
        "title": "Payment phase 1",
        "description": "Reminder for 50% contract value payment",
        "content": "Payment phase 1 must be made before November 1, 2025",
        "dueDate": "2025-11-01T00:00:00Z",
        "status": "PENDING",
        "priority": "HIGH"
      }
    ],
    "risk": {
      "level": "MEDIUM",
      "factors": [
        {
          "type": "TECHNICAL",
          "description": "Risk of new AI technology causing integration errors",
          "content": "System must use latest AI but not fully tested",
          "probability": "MEDIUM",
          "impact": "HIGH",
          "riskToParties": [{"id": "party-002", "name": "Company B"}],
          "beneficiaries": []
        }
      ],
      "mitigationProposals": [
        {
          "description": "Train team and test AI technology",
          "content": "Party B must provide weekly test reports",
          "cost": "LOW",
          "timeline": "2 weeks",
          "assignedTo": "Party B"
        }
      ],
      "advice": "Legal consultation to clearly allocate risks"
    },
    "compliance": {
      "status": "COMPLIANT",
      "regulations": ["Information Security Law", "Decree 13/2023/ND-CP"],
      "certifications": ["ISO 27001", "SOC 2"],
      "auditSchedule": "2024-06-01T00:00:00Z",
      "issues": [],
      "recommendations": ["Contract legal review"]
    }
  },
  "content": {
    "plaintext": "This is a test contract file for upload testing...",
    "extractedText": "Software development service contract...",
    "summary": "Contract for DocGO system development with value of 100,000 USD",
    "keyTerms": ["software development", "document management system", "AI features"],
    "sections": [
      {
        "title": "Article 1: Contract subject",
        "description": "Description of contract subject and main scope",
        "content": "Party A hires Party B to develop DocGO document management system",
        "pageNumber": NumberInt(1)
      }
    ],
    "ocr": null,
    "extraction": null,
    "summarization": null,
    "classification": {
      "isContract": true,
      "confidence": 0.85,
      "language": "vi"
    },
    "processing": {
      "status": "COMPLETED",
      "error": null
    },
    "jsonContent": null,
    "jsonAnalysisStatus": null
  },
  "storage": {
    "location": "s3://docgo-contracts/2024/01/",
    "backupLocations": [
      "s3://docgo-backup/contracts/2024/01/"
    ],
    "retentionPolicy": {
      "duration": "7 years",
      "autoDelete": false,
      "archiveAfter": "2 years"
    },
    "accessControl": {
      "public": false,
      "restrictedUsers": ["user-001", "user-002"],
      "ipWhitelist": ["192.168.1.0/24"]
    },
    "s3": {
      "url": "https://docgo-storage.s3.amazonaws.com/documents/FILE-2025-001-TEST.txt",
      "bucket": "docgo-storage",
      "objectKey": "documents/FILE-2025-001-TEST.txt",
      "region": "us-east-1",
      "contentType": "text/plain",
      "size": NumberLong(312),
      "versionId": "s3-version-xyz789",
      "checksum": {
        "md5": "md5-hash-abc123"
      }
    },
    "local": {
      "path": null,
      "filename": "test-upload-file.txt",
      "mimeType": "text/plain",
      "size": NumberLong(312),
      "mtime": null,
      "revision": null
    }
  },
  "security": {
    "encryption": "AES-256",
    "watermark": true,
    "digitalSignature": true,
    "accessLogging": true,
    "permissions": {
      "read": ["user-001", "user-002"],
      "write": ["user-001"],
      "delete": ["user-001"],
      "share": ["user-001"]
    }
  },
  "versioning": {
    "current": {
      "number": NumberInt(1),
      "tag": "1.0"
    }
  },
  "audit": {
    "createdAt": "2025-10-19T08:45:00Z",
    "createdBy": "system",
    "updatedAt": "2025-10-19T08:45:00Z",
    "updatedBy": "system",
    "deletedAt": null,
    "deletedBy": null,
    "isDeleted": false,
    "changeHistory": [
      {
        "action": "CREATE",
        "timestamp": "2025-10-19T08:45:00Z",
        "actor": "system",
        "details": "File created",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    ],
    "accessLog": [
      {
        "action": "VIEW",
        "timestamp": "2025-10-19T08:45:00Z",
        "actor": "system",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    ]
  }
});

// Verify insertion
print("Sample data inserted!");
print("Document ID: FILE-2025-001-TEST");
print("");
print("To verify, run:");
print("db.files.findOne({_id: 'FILE-2025-001-TEST'})");
