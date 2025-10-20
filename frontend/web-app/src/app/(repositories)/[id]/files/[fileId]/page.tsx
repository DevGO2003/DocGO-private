'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { useParams, useRouter } from 'next/navigation'
import { fetchFileById } from '../../_services/file-api'
import { mapFileApiToUiDocument } from '../../_services/file-mapper'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractType, translateContractStatus, translateContractTag } from '@/utils/tagTranslations'
import { DocumentDetailTabs, MainTabsNav, SubTabsNav } from '@/components/DocumentDetail/DocumentDetailTabs'
import { HeaderPanel } from '@/components/ui'
import { PencilSquareIcon, ArrowUpTrayIcon, DocumentDuplicateIcon, PencilIcon, DocumentArrowDownIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline'

// Full mock data based on sample.json (RestResponse structure, all fields)
const mockResponse = {
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Đã lấy thông tin file thành công",
  "data": {
    "id": "1",
    "overview": {
      "title": "Hợp đồng mẫu - Dịch vụ phát triển phần mềm (ID: 1)",
      "status": "ACTIVE",
      "documentType": "CONTRACT",
      "contractType": "Phát triển phần mềm",
      "category": "Hợp đồng",
      "tags": ["Phần mềm", "Dịch vụ", "IT", "Mock"],
      "ownerUserId": "system",
      "language": "vi",
      "region": "VN",
      "new": true
    },
    "contract": {
      "effectiveDate": "2025-11-01",
      "expiryDate": "2025-12-31",
      "totalValue": 100000,
      "currency": "USD",
      "summary": "Hợp đồng phát triển phần mềm giữa Company A và Company B với tổng giá trị 100,000 USD...",
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
          "role": "Bên A",
          "contact": {
            "email": "contact@companya.com",
            "phone": "+84-28-1234-5678",
            "address": "123 Nguyễn Huệ, Q1, TP.HCM"
          },
          "representative": {
            "name": "Nguyễn Văn A",
            "position": "Giám đốc",
            "email": "nguyenvana@companya.com"
          },
          "taxCode": "ABC123"
        },
        {
          "id": "party-002",
          "name": "Company B",
          "type": "VENDOR",
          "role": "Bên B",
          "contact": {
            "email": "info@companyb.com",
            "phone": "+84-28-8765-4321",
            "address": "456 Lê Lợi, Q1, TP.HCM"
          },
          "representative": {
            "name": "Trần Thị B",
            "position": "Giám đốc Kỹ thuật",
            "email": "tranthib@companyb.com"
          },
          "taxCode": "DEF456"
        },
        {
          "id": "party-003",
          "name": "Company C",
          "type": "PARTNER",
          "role": "Bên C (Đối tác)",
          "contact": {
            "email": "partner@companyc.com",
            "phone": "+84-28-9999-8888",
            "address": "789 Hai Bà Trưng, Q3, TP.HCM"
          },
          "representative": {
            "name": "Lê Văn C",
            "position": "Quản lý Dự án",
            "email": "levanc@companyc.com"
          },
          "taxCode": "GHI789"
        }
      ],
      "payment": {
        "schedule": [
          {
            "milestone": "Ký hợp đồng",
            "percentage": 50,
            "amount": 50000,
            "dueDate": "2025-11-01T00:00:00Z",
            "status": "PENDING"
          },
          {
            "milestone": "Hoàn thành giai đoạn 1",
            "percentage": 30,
            "amount": 30000,
            "dueDate": "2025-12-01T00:00:00Z",
            "status": "PENDING"
          },
          {
            "milestone": "Hoàn thành toàn bộ",
            "percentage": 20,
            "amount": 20000,
            "dueDate": "2025-12-31T00:00:00Z",
            "status": "PENDING"
          }
        ],
        "method": "BANK_TRANSFER",
        "paymentMethod": "Bank transfer"
      },
      "clauses": {
        "key": [
          {
            "name": "Phạm vi công việc",
            "description": "Mô tả chi tiết phạm vi phát triển hệ thống quản lý tài liệu DocGO.",
            "content": "\"Bên B cam kết phát triển hệ thống DocGO với đầy đủ tính năng AI và bảo mật.\"",
            "importance": "high",
            "risk": "low",
            "advice": "Khuyến nghị làm rõ chi tiết kỹ thuật (từ AI Claude)"
          },
          {
            "name": "Thanh toán",
            "description": "Quy định lịch thanh toán 50% trước, 50% sau.",
            "content": "\"Thanh toán đợt 1: 50% giá trị hợp đồng trong vòng 7 ngày sau ký kết.\"",
            "importance": "high",
            "risk": "medium",
            "advice": "Thêm điều khoản phạt chậm thanh toán"
          },
          {
            "name": "Bảo hành",
            "description": "Cam kết bảo hành hệ thống sau nghiệm thu.",
            "content": "\"Bảo hành 12 tháng, Bên B chịu trách nhiệm sửa lỗi miễn phí.\"",
            "importance": "medium",
            "risk": "low",
            "advice": "Mở rộng bảo hành lên 24 tháng cho phần AI"
          }
        ],
        "unfavorable": [
          {
            "name": "Thời gian thực hiện",
            "description": "Thời hạn hợp đồng ngắn, có thể dẫn đến áp lực tiến độ.",
            "content": "\"Dự án phải hoàn thành trước ngày 31/12/2025, không gia hạn.\"",
            "risk": "medium",
            "advice": "Xem xét gia hạn nếu cần"
          },
          {
            "name": "Phạt vi phạm",
            "description": "Phạt nặng nếu Bên B chậm trễ.",
            "content": "\"Phạt 0.5% giá trị hợp đồng mỗi ngày chậm trễ.\"",
            "risk": "high",
            "advice": "Đàm phán giảm mức phạt"
          },
          {
            "name": "Chấm dứt hợp đồng",
            "description": "Điều khoản chấm dứt một chiều từ Bên A.",
            "content": "\"Bên A có quyền chấm dứt hợp đồng với thông báo 30 ngày mà không bồi thường.\"",
            "risk": "high",
            "advice": "Yêu cầu điều khoản đối xứng"
          }
        ],
        "intellectualProperty": "Tất cả quyền sở hữu trí tuệ thuộc về bên A",
        "confidentiality": "Bên B cam kết bảo mật thông tin dự án",
        "warranty": "Bảo hành 12 tháng sau khi nghiệm thu",
        "termination": "Có thể chấm dứt hợp đồng với thông báo trước 30 ngày"
      },
      "reminders": [
        {
          "id": "reminder-001",
          "type": "PAYMENT_DUE",
          "title": "Thanh toán đợt 1",
          "description": "Nhắc nhở thanh toán 50% giá trị hợp đồng.",
          "content": "\"Thanh toán đợt 1 phải thực hiện trước ngày 01/11/2025.\"",
          "dueDate": "2025-11-01T00:00:00Z",
          "status": "PENDING",
          "priority": "HIGH"
        },
        {
          "id": "reminder-002",
          "type": "MILESTONE_REVIEW",
          "title": "Đánh giá giai đoạn 1",
          "description": "Kiểm tra tiến độ giai đoạn 1.",
          "content": "\"Giai đoạn 1 phải được review trước 30/06/2025.\"",
          "dueDate": "2025-06-30T00:00:00Z",
          "status": "PENDING",
          "priority": "MEDIUM"
        },
        {
          "id": "reminder-003",
          "type": "EXPIRY_WARNING",
          "title": "Cảnh báo hết hạn",
          "description": "Nhắc nhở trước hết hạn để gia hạn.",
          "content": "\"Hợp đồng kết thúc 31/12/2025, thông báo gia hạn trước 30 ngày.\"",
          "dueDate": "2025-12-01T00:00:00Z",
          "status": "PENDING",
          "priority": "HIGH"
        }
      ],
      "risk": {
        "riskLevel": "MEDIUM",
        "factors": [
          {
            "type": "TECHNICAL",
            "description": "Rủi ro về công nghệ AI mới có thể gây lỗi tích hợp.",
            "content": "\"Hệ thống phải sử dụng AI mới nhất, nhưng chưa test đầy đủ.\"",
            "probability": "MEDIUM",
            "impact": "HIGH",
            "riskToParties": [
              {
                "id": "party-002",
                "name": "Company B"
              }
            ],
            "beneficiaries": [
              {
                "id": null,
                "name": "Không ai"
              }
            ]
          },
          {
            "type": "SCHEDULE",
            "description": "Rủi ro về tiến độ do thời hạn ngắn.",
            "content": "\"Dự án phải hoàn thành trong 2 tháng, không gia hạn.\"",
            "probability": "LOW",
            "impact": "MEDIUM",
            "riskToParties": [
              {
                "id": "party-001",
                "name": "Company A"
              }
            ],
            "beneficiaries": [
              {
                "id": "party-002",
                "name": "Company B"
              }
            ]
          },
          {
            "type": "FINANCIAL",
            "description": "Rủi ro thanh toán chậm ảnh hưởng dòng tiền.",
            "content": "\"Thanh toán đợt 2 chỉ sau nghiệm thu đầy đủ.\"",
            "probability": "MEDIUM",
            "impact": "HIGH",
            "riskToParties": [
              {
                "id": "party-002",
                "name": "Company B"
              },
              {
                "id": "party-001",
                "name": "Company A"
              }
            ],
            "beneficiaries": []
          }
        ],
        "mitigationProposals": [
          {
            "description": "Đào tạo team và thử nghiệm kỹ thuật AI.",
            "content": "\"Bên B phải cung cấp báo cáo test hàng tuần.\"",
            "cost": "LOW",
            "timeline": "2 tuần",
            "assignedTo": "Bên B"
          },
          {
            "description": "Lập kế hoạch chi tiết và theo dõi tiến độ hàng tuần.",
            "content": "\"Meeting review hàng tuần bắt buộc giữa hai bên.\"",
            "cost": "MEDIUM",
            "timeline": "1 tháng",
            "assignedTo": "Bên A"
          },
          {
            "description": "Thêm escrow cho thanh toán lớn và phạt chậm.",
            "content": "\"Sử dụng escrow service cho thanh toán lớn.\"",
            "cost": "HIGH",
            "timeline": "1 tuần",
            "assignedTo": "Cả hai bên"
          }
        ],
        "advice": "Tư vấn pháp lý để phân bổ rủi ro rõ ràng; theo dõi hàng tuần (từ AI Claude)"
      },
      "compliance": {
        "regulations": ["Luật An toàn thông tin", "Nghị định 13/2023/NĐ-CP"],
        "certifications": ["ISO 27001", "SOC 2"],
        "auditSchedule": "2024-06-01T00:00:00Z",
        "complianceStatus": "COMPLIANT",
        "status": "compliant",
        "issues": [],
        "recommendations": ["Kiểm tra pháp lý hợp đồng"]
      }
    },
    "content": {
      "extractedText": "Hợp đồng dịch vụ phát triển phần mềm...",
      "summary": "Hợp đồng phát triển hệ thống DocGO với giá trị 100,000 USD",
      "keyTerms": [
        "phát triển phần mềm",
        "hệ thống quản lý tài liệu",
        "tính năng AI",
        "tự động hóa"
      ],
      "sections": [
        {
          "title": "Điều 1: Đối tượng hợp đồng",
          "description": "Mô tả đối tượng và phạm vi chính của hợp đồng.",
          "content": "Bên A thuê bên B phát triển hệ thống quản lý tài liệu DocGO với đầy đủ tính năng AI và bảo mật.",
          "pageNumber": 1
        },
        {
          "title": "Điều 2: Thời gian thực hiện",
          "description": "Quy định thời gian bắt đầu, kết thúc và các mốc quan trọng.",
          "content": "Dự án được thực hiện trong 2 tháng từ 01/11/2025 đến 31/12/2025, với review hàng tháng.",
          "pageNumber": 2
        },
        {
          "title": "Điều 3: Thanh toán và bảo hành",
          "description": "Chi tiết lịch thanh toán và điều khoản bảo hành sau nghiệm thu.",
          "content": "Thanh toán 50% trước, 50% sau; bảo hành 12 tháng với hỗ trợ miễn phí.",
          "pageNumber": 3
        }
      ],
      "plaintext": "This is a test contract file for upload testing...\n\nContract Title: Test Contract 2025...",
      "ocr": {
        "text": "This is a test contract file for upload testing...\nSigned,\nCompany A\nCompany B",
        "status": "COMPLETED"
      },
      "classification": {
        "isContract": true,
        "confidence": 0.85,
        "category": "Hợp đồng",
        "language": "vi"
      },
      "processing": {
        "status": "COMPLETED",
        "error": null
      },
      "jsonContent": null,
      "jsonAnalysisStatus": null
    },
    "file": {
      "id": "1",
      "name": "hop-dong-1.txt",
      "type": "text/plain",
      "size": 312,
      "hash": {
        "md5": "a1b2c3d4e5f6789012345678901234567",
        "sha256": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      },
      "permissions": {
        "read": ["user-001", "user-002"],
        "write": ["user-001"],
        "delete": ["user-001"],
        "share": ["user-001"]
      },
      "security": {
        "encryption": "AES-256",
        "watermark": true,
        "digitalSignature": true,
        "accessLogging": true
      },
      "version": 1
    },
    "storage": {
      "location": "s3://docgo-contracts/2024/01/",
      "backupLocations": [
        "s3://docgo-backup/contracts/2024/01/",
        "gs://docgo-archive/contracts/2024/01/"
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
        "url": "https://docgo-storage.s3.amazonaws.com/documents/1.txt",
        "bucket": "docgo-storage",
        "objectKey": "documents/1.txt",
        "region": "us-east-1",
        "contentType": "text/plain",
        "size": 312,
        "versionId": "s3-version-xyz789",
        "checksum": {
          "originalMD5": "md5-hash-abc123",
          "archiveMD5": "md5-hash-def456"
        }
      },
      "local": {
        "path": null,
        "filename": "hop-dong-1.txt",
        "mimeType": "text/plain",
        "size": 312,
        "mtime": null,
        "revision": null
      }
    },
    "versioning": {
      "currentVersionInfo": {
        "tag": "1.0",
        "number": 1
      },
      "versions": [
        {
          "version": "1.0",
          "createdAt": "2024-01-15T09:00:00Z",
          "createdBy": "user-001",
          "changes": "Phiên bản đầu tiên",
          "fileId": "file-001"
        }
      ],
      "changeLog": [
        {
          "version": "1.0",
          "date": "2024-01-15T09:00:00Z",
          "author": "user-001",
          "changes": "Tạo hợp đồng ban đầu"
        }
      ],
      "previousVersion": null,
      "changeSummary": null,
      "changedFields": [],
      "diff": {},
      "history": [
        {
          "version": 1,
          "versionTag": "1.0.0",
          "changedAt": "2025-10-19T08:45:00Z",
          "changedBy": "system",
          "changeType": "CREATE",
          "storage": {
            "s3": { "versionId": null },
            "local": { "revision": null }
          }
        }
      ]
    },
    "metadata": {
      "fileSystem": {
        "dateModified": "2025-10-19T08:45:00Z",
        "dateAdded": "2025-10-19T08:45:00Z",
        "mediaFilename": "hop-dong-1.txt",
        "originalFilename": "hop-dong-1.txt",
        "originalMD5": "md5-hash-abc123",
        "originalFileSize": 312,
        "originalMimeType": "text/plain",
        "archiveMD5": "md5-hash-def456",
        "archiveFileSize": 312
      },
      "originalDocument": {
        "dcFormat": "text/plain",
        "dcTitle": "Hợp đồng mẫu ID 1 - Dịch vụ phát triển phần mềm",
        "dcCreator": "System",
        "dcDescription": "Hợp đồng cung cấp dịch vụ phát triển phần mềm.",
        "dcSubject": "Phần mềm, Dịch vụ, IT",
        "xmpCreateDate": null,
        "xmpCreatorTool": null,
        "xmpModifyDate": null,
        "xmpMetadataDate": null,
        "pdfKeywords": null,
        "pdfProducer": null,
        "xmpDocumentID": null,
        "xmpInstanceID": null,
        "pdfaid:part": null,
        "pdfaid:conformance": null,
        "dc:creator": "System"
      },
      "archivedDocument": {
        "archivedPdfProducer": null,
        "archivedMetadataDate": null,
        "archivedModifyDate": null,
        "archivedCreateDate": null,
        "archivedCreatorTool": null,
        "archivedDocumentID": null,
        "archivedDcFormat": null,
        "archivedDcTitle": null,
        "archivedDcCreator": null,
        "archivedXmpMetadataDate": null,
        "archivedXmpModifyDate": null,
        "archivedXmpCreateDate": null,
        "archivedXmpCreatorTool": null,
        "archivedXmpMMDocumentID": null,
        "archivedDcFormat": null,
        "archivedPdfaidPart": null,
        "archivedPdfaidConformance": null,
        "archivedDcCreator": null
      },
      "technical": {
        "encoding": "UTF-8",
        "lineEnding": "LF",
        "bom": false,
        "compression": "NONE",
        "pages": null,
        "wordCount": 2500,
        "characterCount": 15000
      }
    },
    "audit": {
      "createdAt": "2025-10-19T08:45:00Z",
      "createdBy": "system",
      "lastModifiedAt": "2025-10-19T08:45:00Z",
      "lastModifiedBy": "system",
      "version": 1,
      "changeHistory": [
        {
          "action": "CREATE",
          "timestamp": "2025-10-19T08:45:00Z",
          "userId": "system",
          "details": "Tạo file mới",
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      ],
      "accessLog": [
        {
          "action": "VIEW",
          "timestamp": "2025-10-19T08:45:00Z",
          "userId": "system",
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      ],
      "updatedAt": "2025-10-19T08:45:00Z",
      "updatedBy": "system",
      "deletedAt": null,
      "deletedBy": null,
      "isDeleted": false
    },
    "processing": null
  },
  "timestamp": "2025-10-19T08:45:10Z",
  "requestId": "req-xyz789-123abc",
  "path": "/api/v1/file-management-service/file-details/1"
}

// Mock contract summary (separate for tabs)
const mockContractSummary = {
  summary: 'Tóm tắt mock cho hợp đồng ID 1: Hợp đồng phát triển phần mềm DocGO với giá trị 100,000 USD, rủi ro trung bình.',
  keyPoints: [
    'Phạm vi: Phát triển hệ thống quản lý tài liệu.',
    'Thanh toán: Theo milestone.',
    'Rủi ro: Trễ hạn do thay đổi yêu cầu.'
  ],
  riskScore: 3.5,
  complianceScore: 8.2
}

export default function DocumentDetailPage() {
  const params = useParams() as { fileId?: string; id?: string }
  const router = useRouter()
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null)
  const [contractSummary, setContractSummary] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const [activeMainTab, setActiveMainTab] = useState<string>('contracts')
  const [activeSubTab, setActiveSubTab] = useState<string>('basic-info')

  useEffect(() => {
    console.log('Detail page loaded for fileId:', params.fileId, 'repositoryId:', params.id)
    
    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      let apiData = null
      let apiSummary = null

      try {
        // Fetch file detail from File Management Service (API primary)
        const currentFileId = params.fileId || params.id as string
        console.log('Fetching file (detail) with ID:', currentFileId)
        const resp = await fetchFileById(currentFileId)
        if (resp?.data) {
          console.log('API success - all fields:', resp.data) // Log all fields from API
          // Map API file detail to UI structure expected by tabs (use full sample structure)
        const doc = mapFileApiToUiDocument(resp.data)
          apiData = {
            // Map to UI (example, adjust as needed to display all sample fields)
            id: resp.data.id,
            title: resp.data.overview.title,
            description: resp.data.overview.description || resp.data.content.summary,
            status: resp.data.overview.status,
            contractType: resp.data.overview.contractType,
            tags: resp.data.overview.tags,
            parties: resp.data.contract?.parties || [],
            effectiveDate: resp.data.contract?.effectiveDate,
            expiryDate: resp.data.contract?.expiryDate,
          paymentDetails: {
              totalValue: resp.data.contract?.totalValue,
              currency: resp.data.contract?.currency,
              schedule: resp.data.contract?.payment?.schedule || [],
              paymentMethod: resp.data.contract?.payment?.method,
            },
            keyClauses: resp.data.contract?.clauses?.key || [],
          unfavorableClauses: resp.data.contract?.clauses?.unfavorable || [],
          reminders: resp.data.contract?.reminders || [],
          riskAssessment: {
              riskLevel: resp.data.contract?.risk?.riskLevel || 'LOW',
            riskFactors: resp.data.contract?.risk?.factors || [],
              mitigationMeasures: resp.data.contract?.risk?.mitigationProposals || [],
          },
          complianceStatus: {
              status: resp.data.contract?.compliance?.complianceStatus || 'COMPLIANT',
            issues: resp.data.contract?.compliance?.issues || [],
            recommendations: resp.data.contract?.compliance?.recommendations || [],
          },
            content: resp.data.content?.plaintext || resp.data.content?.extractedText || '',
            authorNotes: [], // From audit or custom
            fileSystemMetadata: resp.data.metadata?.fileSystem || {},
            originalDocumentMetadata: resp.data.metadata?.originalDocument || {},
            archivedDocumentMetadata: resp.data.metadata?.archivedDocument || {},
            // Additional sample fields for display (all from sample.json)
            workflow: resp.data.contract?.workflow || {},
            storage: resp.data.storage || {},
            versioning: resp.data.versioning || {},
            audit: resp.data.audit || {},
            processing: resp.data.processing || {},
            file: resp.data.file || {},
            // Log all for debug
            ...resp.data // Spread to have all fields available in UI
          }
          apiSummary = mockContractSummary // Or fetch separate
          console.log('Mapped UI data with all fields:', apiData) // Log mapped
        } else {
          console.log('API returned no data, using mock fallback')
        }
      } catch (e: any) {
        console.error('Error fetching document detail from API:', e)
        console.log('API failed, falling back to mock data with sample.json structure')
      }

      // Set data: prefer API, fallback to mock (full sample.json)
      const finalData = apiData || mockResponse.data
      setData(finalData)
      setContractSummary(apiSummary || mockContractSummary)

        setLoading(false)
    }
    fetchDetail()
  }, [params.fileId, params.id, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Không tìm thấy tài liệu. (Check console for API/mock details)</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderPanel
          title={data.title || data.overview?.title}
          subtitle={`Mã: HD-${data.id} · Loại: ${translateContractType(data.contractType || data.overview?.contractType, t)} · Trạng thái: ${translateContractStatus(data.status || data.overview?.status, t)}`}
          breadcrumbs={[
            { label: 'Tài liệu', href: '/documents' },
            { label: 'Danh sách', href: `/repositories/${params.id}/files` },
            { label: 'Chi tiết', current: true },
          ]}
          right={
            <div className="w-full">
              <div className="flex flex-wrap gap-[5px] items-center justify-end mb-[5px]">
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <PencilSquareIcon className="w-3 h-3" />
                  Chỉnh sửa
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <ArrowUpTrayIcon className="w-3 h-3" />
                  Gửi duyệt
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  Tạo phiên bản
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <PencilIcon className="w-3 h-3" />
                  Gửi ký
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <DocumentArrowDownIcon className="w-3 h-3" />
                  Tải PDF
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">
                  <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  Bình luận
                </button>
                <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-rose-300 text-xs text-rose-700 hover:bg-rose-50">
                  <TrashIcon className="w-3 h-3" />
                  Xóa
                </button>
              </div>
            </div>
          }
        >
          <div className="mt-2">
            <MainTabsNav
              activeMainTab={activeMainTab}
              onChange={(tabId) => {
                setActiveMainTab(tabId)
                if (tabId === 'contracts') setActiveSubTab('basic-info')
                else if (tabId === 'overview') setActiveSubTab('details')
                else if (tabId === 'comments') setActiveSubTab('comments-list')
              }}
            />
            <SubTabsNav
              activeMainTab={activeMainTab}
              activeSubTab={activeSubTab}
              onChange={(tabId) => setActiveSubTab(tabId)}
            />
          </div>
        </HeaderPanel>

        <DocumentDetailTabs
          documentData={data}
          contractSummary={contractSummary}
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
        />

        {/* Debug section to display all sample.json fields (temporary for verification) */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Debug: All Fields from Sample.json (API or Mock)</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
          <p className="text-sm text-gray-600 mt-2">Console log: Check for 'API success - all fields' or 'using mock fallback'.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

function badgeClass(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case 'PENDING_REVIEW':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'ACTIVE':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'TERMINATED':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'ARCHIVED':
      return 'bg-slate-50 text-slate-700 border-slate-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}