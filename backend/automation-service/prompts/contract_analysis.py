"""
Contract Analysis Prompt Template
"""

PROMPT = """Bạn là chuyên gia phân tích hợp đồng với kinh nghiệm pháp lý 15+ năm.
Hãy phân tích CHI TIẾT từng dòng văn bản hợp đồng và tạo JSON ĐẦY ĐỦ, CHÍNH XÁC.

🎯 YÊU CẦU PHÂN TÍCH:
1. ĐỌC KỸ và TRÍCH XUẤT thông tin CHÍNH XÁC từ văn bản (KHÔNG đoán, KHÔNG sáng tạo)
2. TÌM KIẾM mọi chi tiết: tên, chức vụ, email, phone, địa chỉ, mã số thuế, giá trị, ngày tháng
3. XÁC ĐỊNH loại bên (type): CLIENT, VENDOR, PARTNER, GUARANTOR
4. PHÂN TÍCH điều khoản có lợi/bất lợi cho từng bên (phải có content trích dẫn)
5. ĐÁNH GIÁ rủi ro chi tiết với category, severity, impact
6. LIỆT KÊ tuân thủ: regulations, requirements, certifications
7. TẠO reminders cho các milestone/ngày quan trọng
8. QUAN TRỌNG: Dùng null nếu KHÔNG TÌM THẤY thông tin (đừng để string rỗng)

📋 JSON SCHEMA - TUÂN THỦ NGHIÊM NGẶT:

{
  "effectiveDate": "2024-02-01T00:00:00",  // ISO 8601, REQUIRED
  "expiryDate": "2026-02-01T00:00:00",     // ISO 8601 hoặc null
  "totalValue": 100000000,                  // NUMBER (không dấu phẩy, không text)
  "currency": "VND",                        // VND, USD, EUR...
  "summary": "Tóm tắt ngắn gọn 50-100 từ", // REQUIRED
  "project": "Dự án DocGO Platform",        // Tên dự án hoặc null
  "department": "IT Department",            // Phòng ban quản lý hoặc null
  "priority": "HIGH",                       // HIGH, MEDIUM, LOW hoặc null
  "confidentiality": "CONFIDENTIAL",        // CONFIDENTIAL, INTERNAL, PUBLIC hoặc null
  
  "parties": [  // MỖI BÊN PHẢI CÓ ĐẦY ĐỦ OBJECT STRUCTURE
    {
      "id": "party-001",                    // unique ID: "party-001", "party-002"...
      "name": "CÔNG TY TNHH ABC",           // REQUIRED - tên đầy đủ
      "type": "CLIENT",                     // CLIENT, VENDOR, PARTNER, GUARANTOR
      "role": "Bên A - Khách hàng",         // Vai trò trong hợp đồng
      "contact": {                          // OBJECT - không flat
        "email": "contact@abc.com",         // Email chính thức
        "phone": "+84-28-1234-5678",        // SĐT
        "address": "123 Nguyễn Huệ, Q1, TP.HCM"  // Địa chỉ đầy đủ
      },
      "representative": {                   // OBJECT - người đại diện
        "name": "Nguyễn Văn A",             // Tên đại diện
        "position": "Giám đốc",             // Chức vụ
        "email": "nguyenvana@abc.com"       // Email cá nhân
      },
      "taxCode": "0123456789"               // Mã số thuế
    }
  ],
  
  "payment": {
    "totalValue": 100000000,                // Tổng giá trị thanh toán
    "currency": "VND",
    "schedule": [                           // ARRAY of milestones
      {
        "milestone": "Ký hợp đồng",
        "percentage": 30,                   // % thanh toán
        "amount": 30000000,                 // Số tiền
        "dueDate": "2024-02-15T00:00:00",   // Hạn thanh toán
        "status": "PENDING"                 // PENDING, COMPLETED, OVERDUE
      }
    ],
    "method": "Chuyển khoản ngân hàng"      // Phương thức thanh toán
  },
  
  "clauses": {
    "key": [                                // Điều khoản QUAN TRỌNG
      {
        "name": "Điều 5: Phạm vi công việc",
        "description": "Mô tả chi tiết điều khoản",
        "content": "Trích dẫn nội dung CHÍNH XÁC từ hợp đồng",  // REQUIRED
        "importance": "HIGH",               // HIGH, MEDIUM, LOW
        "risk": "MEDIUM",                   // HIGH, MEDIUM, LOW
        "advice": "Khuyến nghị từ chuyên gia",  // Lời khuyên cụ thể
        "pageNumber": 3                     // Số trang tìm thấy
      }
    ],
    "unfavorable": [                        // Điều khoản BẤT LỢI
      {
        "name": "Điều 10: Phạt chậm tiến độ",
        "description": "Điều khoản gây bất lợi",
        "content": "Trích dẫn chính xác",
        "impact": "Phạt 1%/tuần nếu chậm",
        "affectedParty": "party-001",       // ID bên bị ảnh hưởng
        "pageNumber": 5                    // Số trang tìm thấy
      }
    ],
    "all": [                                // TẤT CẢ ĐIỀU KHOẢN
      {
        "name": "Điều 5: Phạm vi công việc",
        "description": "Điều khoản xác định phạm vi công việc cần thực hiện. Đây là điều khoản quan trọng vì nó định nghĩa ranh giới và trách nhiệm của các bên trong hợp đồng.",
        "content": "Trích dẫn nội dung CHÍNH XÁC từ hợp đồng",
        "importance": "HIGH",
        "risk": "MEDIUM",
        "advice": "Khuyến nghị từ chuyên gia",
        "pageNumber": 3
      },
      {
        "name": "Điều 10: Phạt chậm tiến độ",
        "description": "Điều khoản quy định về phạt chậm tiến độ. Đây là điều khoản bất lợi vì nó có thể gây thiệt hại tài chính nếu không hoàn thành đúng hạn.",
        "content": "Trích dẫn chính xác",
        "importance": "LOW",
        "risk": "HIGH",
        "advice": "Cần đảm bảo tiến độ thực hiện",
        "pageNumber": 5
      }
    ],
    "intellectualProperty": "Mô tả quyền sở hữu trí tuệ",  // Hoặc null
    "confidentiality": "Mô tả bảo mật",     // Hoặc null
    "warranty": "Bảo hành 12 tháng",        // Hoặc null
    "termination": "Điều kiện chấm dứt"     // Hoặc null
  },
  
  "reminders": [                            // Nhắc nhở các milestone
    {
      "date": "2024-03-01T00:00:00",        // Ngày nhắc nhở
      "type": "DEADLINE",                   // DEADLINE, MILESTONE, REVIEW, PAYMENT
      "title": "Nghiệm thu giai đoạn 1",
      "description": "Chi tiết công việc cần làm",
      "priority": "HIGH",                   // HIGH, MEDIUM, LOW
      "assignedTo": "party-001"             // ID người chịu trách nhiệm
    }
  ],
  
  "risk": {
    "factors": [                            // Yếu tố rủi ro
      {
        "category": "FINANCIAL",            // FINANCIAL, LEGAL, OPERATIONAL, TECHNICAL
        "description": "Rủi ro tài chính",
        "severity": "HIGH",                 // HIGH, MEDIUM, LOW
        "probability": "MEDIUM",            // HIGH, MEDIUM, LOW
        "impact": "Ảnh hưởng đến ngân sách",
        "mitigation": "Biện pháp giảm thiểu rủi ro"
      }
    ],
    "assessment": "Đánh giá tổng thể rủi ro", // Hoặc null
    "recommendations": "Khuyến nghị giảm thiểu rủi ro"  // Hoặc null
  },
  
  "compliance": {
    "regulations": [                        // Quy định pháp luật
      {
        "name": "Luật Lao động 2019",
        "description": "Quy định về hợp đồng lao động",
        "status": "APPLICABLE",             // APPLICABLE, NOT_APPLICABLE, PENDING
        "requirements": "Yêu cầu tuân thủ"
      }
    ],
    "certifications": [                     // Chứng chỉ cần thiết
      {
        "name": "ISO 9001",
        "description": "Hệ thống quản lý chất lượng",
        "required": true,                   // true/false
        "expiryDate": "2025-12-31T00:00:00" // Ngày hết hạn
      }
    ],
    "auditRequirements": "Yêu cầu kiểm toán", // Hoặc null
    "reportingRequirements": "Yêu cầu báo cáo"  // Hoặc null
  }
}

⚠️ LƯU Ý CỰC KỲ QUAN TRỌNG:
1. totalValue: PHẢI là NUMBER (52000000), KHÔNG PHẢI string
2. Dates: ISO 8601 format ("2024-02-01T00:00:00")
3. Parties: PHẢI có id, type, contact object, representative object
4. Payment.schedule: PHẢI là ARRAY, không phải string
5. Risk.factors: PHẢI là ARRAY of objects với category, severity
6. Compliance: PHẢI có regulations, certifications arrays
7. Null: Dùng null nếu không tìm thấy (KHÔNG dùng "", [], {})
8. KHÔNG dùng "...", "……" - phải có nội dung cụ thể
9. Trích dẫn: content field PHẢI là text thật từ hợp đồng
10. Chỉ trả về JSON thuần, KHÔNG có ```json hoặc markdown

📄 HỢP ĐỒNG CẦN PHÂN TÍCH (Tên file: {filename}):
{extracted_text}
"""


def get_contract_analysis_prompt(content: str, filename: str) -> str:
    """
    Generate contract analysis prompt
    
    Args:
        content: Contract document content
        filename: Original filename
        
    Returns:
        Formatted prompt for contract analysis
    """
    return PROMPT.format(extracted_text=content[:4000], filename=filename)
