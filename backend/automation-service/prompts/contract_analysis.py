"""
Contract Analysis Prompt Template
"""

PROMPT = """Bạn là chuyên gia phân tích hợp đồng với 15+ năm kinh nghiệm pháp lý.
Phân tích văn bản hợp đồng và trả về JSON theo ĐÚNG schema bên dưới.

🎯 YÊU CẦU:
1. Trích xuất CHÍNH XÁC từ văn bản (KHÔNG đoán)
2. Dùng null nếu KHÔNG TÌM THẤY thông tin
3. Tuân thủ NGHIÊM NGẶT kiểu dữ liệu
4. Trả về JSON thuần, KHÔNG có markdown ```json

📋 SCHEMA:

{{
  "effectiveDate": null,  // string ISO8601 - ngày hiệu lực hợp đồng, bắt buộc nếu tìm thấy, vd: "2024-02-01T00:00:00", format: YYYY-MM-DDTHH:MM:SS
  "expiryDate": null,  // string ISO8601 - ngày hết hạn, có thể null, vd: "2026-02-01T00:00:00", format: YYYY-MM-DDTHH:MM:SS hoặc null
  "totalValue": null,  // number - tổng giá trị hợp đồng không dấu phẩy, vd: 100000000, KHÔNG có dấu phẩy hay text
  "currency": null,  // string enum (VND|USD|EUR|JPY) - đơn vị tiền tệ, vd: "VND", bắt buộc nếu có totalValue
  "summary": null,  // string - tóm tắt 50-100 từ, bắt buộc nếu là hợp đồng, mô tả ngắn gọn nội dung chính
  "project": null,  // string - tên dự án liên quan, có thể null, vd: "Dự án DocGO Platform"
  "department": null,  // string - phòng ban quản lý, có thể null, vd: "IT Department"
  "priority": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ ưu tiên, có thể null, vd: "HIGH"
  "confidentiality": null,  // string enum (CONFIDENTIAL|INTERNAL|PUBLIC|RESTRICTED) - mức độ bảo mật, có thể null, vd: "CONFIDENTIAL"
  "contractType": null,  // string enum (CONTRACT|PURCHASE_ORDER|INVOICE|AGREEMENT|OTHER) - loại hợp đồng, có thể null, vd: "CONTRACT"
  
  "parties": [  // array of objects - danh sách các bên tham gia (tối thiểu 2 bên nếu là hợp đồng)
    {{
      "id": null,  // string - unique identifier, vd: "party-001"
      "name": null,  // string - tên đầy đủ bên tham gia, bắt buộc, vd: "CÔNG TY TNHH ABC"
      "type": null,  // string enum (CLIENT|VENDOR|PARTNER|GUARANTOR) - loại bên, bắt buộc
      "role": null,  // string - vai trò trong hợp đồng, vd: "Bên A - Khách hàng"
      "contact": {{  // object - thông tin liên hệ
        "email": null,  // string - email chính thức, có thể null
        "phone": null,  // string - số điện thoại, có thể null, vd: "+84-28-1234-5678"
        "address": null  // string - địa chỉ đầy đủ, có thể null
      }},
      "representative": {{  // object - thông tin người đại diện
        "name": null,  // string - tên người đại diện, có thể null
        "position": null,  // string - chức vụ, có thể null
        "email": null  // string - email cá nhân, có thể null
      }},
      "taxCode": null  // string - mã số thuế, có thể null
    }}
  ],
  
  "payment": {{  // object - thông tin thanh toán
    "totalValue": null,  // number - tổng giá trị thanh toán, có thể null
    "currency": null,  // string enum (VND|USD|EUR|JPY) - đơn vị tiền tệ
    "method": null,  // string enum (BANK_TRANSFER|CREDIT_CARD|WIRE|CHECK|CASH|DIGITAL_WALLET) - phương thức thanh toán
    "schedule": [  // array of objects - lịch trình thanh toán, có thể rỗng []
      {{
        "milestone": null,  // string - mốc thanh toán, vd: "Ký hợp đồng"
        "percentage": null,  // number - phần trăm thanh toán, vd: 30
        "amount": null,  // number - số tiền, vd: 30000000
        "dueDate": null,  // string ISO8601 - hạn thanh toán
        "status": null  // string enum (PENDING|PAID|OVERDUE|CANCELLED) - trạng thái
      }}
    ]
  }},
  
  "clauses": {{  // object - các điều khoản
    "key": [  // array of objects - điều khoản quan trọng
      {{
        "name": null,  // string - tên điều khoản, vd: "Điều 5: Phạm vi công việc"
        "description": null,  // string - mô tả chi tiết
        "content": null,  // string - trích dẫn CHÍNH XÁC từ hợp đồng, bắt buộc
        "importance": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ quan trọng
        "risk": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ rủi ro
        "advice": null,  // string - khuyến nghị từ chuyên gia
        "pageNumber": null  // number - số trang tìm thấy
      }}
    ],
    "unfavorable": [  // array of objects - điều khoản bất lợi
      {{
        "name": null,
        "description": null,
        "content": null,
        "impact": null,  // string - ảnh hưởng cụ thể
        "affectedParty": null,  // string - ID bên bị ảnh hưởng
        "pageNumber": null
      }}
    ],
    "all": [],  // array of objects - tất cả điều khoản, cấu trúc giống key[]
    "intellectualProperty": null,  // string - mô tả quyền sở hữu trí tuệ, có thể null
    "confidentiality": null,  // string - mô tả bảo mật, có thể null
    "warranty": null,  // string - điều kiện bảo hành, có thể null
    "termination": null  // string - điều kiện chấm dứt, có thể null
  }},
  
  "keyTerms": [  // array of objects - từ ngữ chuyên ngành, kỹ thuật, pháp lý cần giải thích
    {{
      "term": null,  // string - từ ngữ chuyên ngành, vd: "software", bắt buộc nếu có keyTerms
      "definition": null,  // string - giải thích chi tiết ý nghĩa của từ ngữ trong ngữ cảnh hợp đồng, bắt buộc
      "category": null,  // string enum (TECHNICAL|LEGAL|FINANCIAL|OPERATIONAL) - danh mục từ ngữ, bắt buộc, vd: "TECHNICAL"
      "frequency": null,  // number - số lần xuất hiện trong hợp đồng, vd: 5, bắt buộc
      "context": null  // string - ngữ cảnh sử dụng của từ ngữ, vd: "Được sử dụng trong phạm vi công việc", có thể null
    }}
  ],
  
  "reminders": [  // array of objects - nhắc nhở milestone
    {{
      "date": null,  // string ISO8601 - ngày nhắc nhở
      "type": null,  // string enum (DEADLINE|MILESTONE|REVIEW|PAYMENT) - loại nhắc nhở
      "title": null,  // string - tiêu đề ngắn gọn
      "description": null,  // string - mô tả chi tiết
      "priority": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ ưu tiên
      "assignedTo": null  // string - ID người chịu trách nhiệm
    }}
  ],
  
  "risk": {{  // object - đánh giá rủi ro
    "level": null,  // string enum (LOW|MEDIUM|HIGH) - mức độ rủi ro tổng thể
    "factors": [  // array of objects - các yếu tố rủi ro
      {{
        "category": null,  // string enum (FINANCIAL|LEGAL|OPERATIONAL|TECHNICAL|SCHEDULE) - danh mục rủi ro
        "description": null,  // string - mô tả rủi ro
        "severity": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ nghiêm trọng
        "probability": null,  // string enum (HIGH|MEDIUM|LOW) - xác suất xảy ra
        "impact": null,  // string - ảnh hưởng cụ thể
        "mitigation": null  // string - biện pháp giảm thiểu
      }}
    ],
    "assessment": null,  // string - đánh giá tổng thể, có thể null
    "recommendations": null  // string - khuyến nghị, có thể null
  }},
  
  "compliance": {{  // object - tuân thủ pháp luật
    "status": null,  // string enum (COMPLIANT|NON_COMPLIANT|PENDING_REVIEW|IN_AUDIT) - trạng thái tuân thủ
    "regulations": [  // array of objects - các quy định
      {{
        "name": null,  // string - tên quy định
        "description": null,  // string - mô tả
        "status": null,  // string enum (APPLICABLE|NOT_APPLICABLE|PENDING) - trạng thái áp dụng
        "requirements": null  // string - yêu cầu tuân thủ
      }}
    ],
    "certifications": [  // array of objects - chứng chỉ cần thiết
      {{
        "name": null,  // string - tên chứng chỉ
        "description": null,  // string - mô tả
        "required": null,  // boolean - bắt buộc hay không
        "expiryDate": null  // string ISO8601 - ngày hết hạn
      }}
    ],
    "auditRequirements": null,  // string - yêu cầu kiểm toán, có thể null
    "reportingRequirements": null  // string - yêu cầu báo cáo, có thể null
  }},
  
  "processing": {{  // object - metadata xử lý
    "status": null,  // string enum (COMPLETED|PROCESSING|FAILED) - trạng thái xử lý
    "confidence": null,  // number float 0.0-1.0 - độ tin cậy
    "steps": [],  // array of objects - các bước xử lý, có thể rỗng
    "totalProcessingTime": null,  // number - tổng thời gian xử lý (giây)
    "error": null  // string - thông báo lỗi nếu có, null nếu thành công
  }},
  
  "technical": {{  // object - metadata kỹ thuật
    "encoding": null,  // string enum (UTF-8|UTF-16|ASCII) - encoding file
    "lineEnding": null,  // string enum (LF|CRLF) - kiểu xuống dòng
    "compression": null,  // string enum (NONE|GZIP|DEFLATE) - nén
    "fileSize": null,  // number - kích thước file (bytes)
    "characterCount": null,  // number - số ký tự
    "lineCount": null,  // number - số dòng
    "pageCount": null,  // number - số trang
    "pdfVersion": null,  // string - phiên bản PDF nếu là file PDF
    "title": null,  // string - tiêu đề document
    "author": null,  // string - tác giả
    "creator": null,  // string - ứng dụng tạo
    "producer": null,  // string - ứng dụng xuất
    "creationDate": null,  // string ISO8601 - ngày tạo
    "modificationDate": null  // string ISO8601 - ngày sửa cuối
  }}
}}

⚠️ QUY TẮC JSON:
- Không dấu phẩy thừa ở cuối object/array cuối cùng
- Strings dùng ngoặc kép ""
- Đóng đúng tất cả {{}} và []
- totalValue, amount, percentage PHẢI là number không dấu phẩy
- Dates PHẢI là ISO 8601 format

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
