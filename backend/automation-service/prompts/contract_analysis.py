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
5. ⚠️ QUAN TRỌNG: "clauses.all" PHẢI chứa TẤT CẢ các điều khoản trong hợp đồng (Điều 1, Điều 2, Điều 3, v.v.), KHÔNG được bỏ sót bất kỳ điều khoản nào
6. ⚠️ PHÂN LOẠI ĐIỀU KHOẢN (bắt buộc):
   - "key": Các điều khoản có RỦI RO CAO hoặc ẢNH HƯỞNG LỚN (vi phạm, chấm dứt, trách nhiệm pháp lý, bồi thường, v.v.)
   - "favorable": Các điều khoản về QUYỀN LỢI, LỢI ÍCH của các bên (quyền sở hữu, quyền hủy bỏ, quyền bảo vệ, v.v.)
   - "unfavorable": Các điều khoản về HẠN CHẾ, NGHĨA VỤ NẶNG, RỦI RO (cấm, giới hạn, trách nhiệm, bồi thường, v.v.)
7. Mỗi điều khoản PHẢI được phân loại vào ít nhất một trong ba loại trên (key/favorable/unfavorable). Bất khả kkháng lắm thì sẽ có vài trường bị null

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
  
  "classification": {{  // object - thông tin phân loại và xử lý
    "model": null,  // string - tên model AI được sử dụng, vd: "gemini-1.5-flash", bắt buộc
    "inputTokens": null,  // number - số tokens đầu vào, vd: 3500, có thể null
    "outputTokens": null  // number - số tokens đầu ra, vd: 250, có thể null
  }},
  
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
    "key": [  // array of objects - điều khoản quan trọng (có rủi ro cao, ảnh hưởng lớn)
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
    "favorable": [  // array of objects - điều khoản thuận lợi (quyền lợi, lợi ích, KHÔNG có risk field)
      {{
        "name": null,  // string - tên điều khoản, vd: "Điều 3: Quyền lợi của bên A"
        "description": null,  // string - mô tả chi tiết
        "content": null,  // string - trích dẫn CHÍNH XÁC từ hợp đồng, bắt buộc
        "importance": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ quan trọng
        "advice": null,  // string - khuyến nghị từ chuyên gia
        "pageNumber": null  // number - số trang tìm thấy
      }}
    ],
    "unfavorable": [  // array of objects - điều khoản bất lợi (hạn chế, nghĩa vụ nặng, rủi ro)
      {{
        "name": null,
        "description": null,
        "content": null,
        "impact": null,  // string - ảnh hưởng cụ thể
        "affectedParty": null,  // string - ID bên bị ảnh hưởng
        "pageNumber": null
      }}
    ],
    "all": [  // array of objects - TẤT CẢ điều khoản trong hợp đồng (BẮTBUỘC trích xuất TOÀN BỘ, không bỏ sót)
      {{
        "name": null,  // string - tên điều khoản, vd: "Điều 1: Định nghĩa", "Điều 2: Mục tiêu"
        "description": null,  // string - mô tả chi tiết (50-100 từ)
        "content": null,  // string - trích dẫn CHÍNH XÁC từ hợp đồng (BẮTBUỘC)
        "importance": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ quan trọng
        "risk": null,  // string enum (HIGH|MEDIUM|LOW) - có thể null nếu là favorable
        "advice": null,  // string - khuyến nghị
        "pageNumber": null  // number - số trang
      }}
    ],
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
      "id": null,  // string - unique identifier, vd: "reminder-001", bắt buộc
      "type": null,  // string enum (DEADLINE|MILESTONE|REVIEW|PAYMENT|PAYMENT_DUE) - loại nhắc nhở, bắt buộc
      "title": null,  // string - tiêu đề ngắn gọn, bắt buộc, vd: "Payment Phase 1"
      "description": null,  // string - mô tả chi tiết, có thể null
      "content": null,  // string - nội dung chi tiết, có thể null
      "dueDate": null,  // string ISO8601 - hạn chót, bắt buộc, vd: "2025-11-30T00:00:00"
      "status": null,  // string enum (PENDING|COMPLETED|OVERDUE|CANCELLED) - trạng thái, bắt buộc, vd: "PENDING"
      "priority": null  // string enum (HIGH|MEDIUM|LOW) - mức độ ưu tiên, bắt buộc, vd: "HIGH"
    }}
  ],
  
  "risk": {{  // object - đánh giá rủi ro
    "level": null,  // string enum (LOW|MEDIUM|HIGH) - mức độ rủi ro tổng thể
    "factors": [  // array of objects - các yếu tố rủi ro
      {{
        "category": null,  // string enum (FINANCIAL|LEGAL|OPERATIONAL|TECHNICAL|SCHEDULE) - danh mục rủi ro
        "description": null,  // string - mô tả rủi ro kiểu tóm tắt cho người đọc
        "severity": null,  // string enum (HIGH|MEDIUM|LOW) - mức độ nghiêm trọng
        "probability": null,  // string enum (HIGH|MEDIUM|LOW) - xác suất xảy ra
        "impact": null,  // string - ảnh hưởng cụ thể như thê nào
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
  }}
}}

⚠️ QUY TẮC JSON:
- Không dấu phẩy thừa ở cuối object/array cuối cùng
- Strings dùng ngoặc kép ""
- Đóng đúng tất cả {{}} và []
- totalValue, amount, percentage PHẢI là number không dấu phẩy
- Dates PHẢI là ISO 8601 format

📌 HƯỚNG DẪN TRÍCH XUẤT ĐIỀU KHOẢN:
1. QUÉT TOÀN BỘ hợp đồng từ đầu đến cuối
2. Tìm TẤT CẢ các điều khoản (Điều 1, Điều 2, Điều 3, ..., Điều N)
3. Với mỗi điều khoản tìm thấy:
   - Thêm vào "clauses.all" (BẮTBUỘC)
   - Nếu có rủi ro cao/ảnh hưởng lớn → thêm vào "clauses.key"
   - Nếu là quyền lợi/lợi ích → thêm vào "clauses.favorable"
   - Nếu là hạn chế/bất lợi → thêm vào "clauses.unfavorable"
4. KHÔNG được bỏ sót bất kỳ điều khoản nào
5. Mỗi điều khoản trong "clauses.all" PHẢI có "content" (trích dẫn chính xác)

📝 VÍ DỤ PHÂN LOẠI:
- "Điều 1: Định nghĩa" → "all" (tất cả điều khoản)
- "Điều 3: Quyền lợi của bên A" → "all" + "favorable" (quyền lợi)
- "Điều 5: Trách nhiệm pháp lý" → "all" + "key" (rủi ro cao)
- "Điều 7: Chấm dứt hợp đồng" → "all" + "key" (ảnh hưởng lớn)
- "Điều 8: Bồi thường" → "all" + "unfavorable" (hạn chế/rủi ro)

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
