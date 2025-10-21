

import logging
import json
import uuid
from typing import Optional, Dict, Any
import google.generativeai as genai
from config import Config


class AutomationService:
    
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AutomationService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.api_key = Config.get_gemini_api_key()
            genai.configure(api_key=self.api_key)
            # Allow override via ENV, fallback to preferred order
            import os
            env_model = os.getenv('GEMINI_MODEL', '').strip()
            # Try different models in order of preference
            models_to_try = ([env_model] if env_model else []) + [
                'gemini-2.0-flash',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-1.0-pro'
            ]
            
            model_initialized = False
            for model_name in models_to_try:
                try:
                    self.model = genai.GenerativeModel(model_name)
                    logging.info(f"[AUTOMATION_SERVICE_SINGLETON] AutomationService initialized with {model_name}")
                    model_initialized = True
                    break
                except Exception as e:
                    logging.warning(f"[AI_MODEL_FALLBACK] Failed to initialize {model_name}: {e}")
                    continue
            
            if not model_initialized:
                raise Exception("Could not initialize any Gemini model")
            self._initialized = True
    
    def get_contract_summary_prompt(self, content: str, filename: str) -> str:
        """
        IMPROVED prompt to match document-management-sample.json schema EXACTLY
        Returns full structure với: parties (object structure), payment schedule (array), clauses, reminders, risk, compliance
        """
        return (
            "Bạn là chuyên gia phân tích hợp đồng với kinh nghiệm pháp lý 15+ năm. "
            "Hãy phân tích CHI TIẾT từng dòng văn bản hợp đồng và tạo JSON ĐẦY ĐỦ, CHÍNH XÁC.\n\n"
            
            "🎯 YÊU CẦU PHÂN TÍCH:\n"
            "1. ĐỌC KỸ và TRÍCH XUẤT thông tin CHÍNH XÁC từ văn bản (KHÔNG đoán, KHÔNG sáng tạo)\n"
            "2. TÌM KIẾM mọi chi tiết: tên, chức vụ, email, phone, địa chỉ, mã số thuế, giá trị, ngày tháng\n"
            "3. XÁC ĐỊNH loại bên (type): CLIENT, VENDOR, PARTNER, GUARANTOR\n"
            "4. PHÂN TÍCH điều khoản có lợi/bất lợi cho từng bên (phải có content trích dẫn)\n"
            "5. ĐÁNH GIÁ rủi ro chi tiết với category, severity, impact\n"
            "6. LIỆT KÊ tuân thủ: regulations, requirements, certifications\n"
            "7. TẠO reminders cho các milestone/ngày quan trọng\n"
            "8. QUAN TRỌNG: Dùng null nếu KHÔNG TÌM THẤY thông tin (đừng để string rỗng)\n\n"
            
            "📋 JSON SCHEMA - TUÂN THỦ NGHIÊM NGẶT:\n"
            '{\n'
            '  "effectiveDate": "2024-02-01T00:00:00",  // ISO 8601, REQUIRED\n'
            '  "expiryDate": "2026-02-01T00:00:00",     // ISO 8601 hoặc null\n'
            '  "totalValue": 100000000,                  // NUMBER (không dấu phẩy, không text)\n'
            '  "currency": "VND",                        // VND, USD, EUR...\n'
            '  "summary": "Tóm tắt ngắn gọn 50-100 từ", // REQUIRED\n'
            '  "project": "Dự án DocGO Platform",        // Tên dự án hoặc null\n'
            '  "department": "IT Department",            // Phòng ban quản lý hoặc null\n'
            '  "priority": "HIGH",                       // HIGH, MEDIUM, LOW hoặc null\n'
            '  "confidentiality": "CONFIDENTIAL",        // CONFIDENTIAL, INTERNAL, PUBLIC hoặc null\n'
            '  \n'
            '  "parties": [  // MỖI BÊN PHẢI CÓ ĐẦY ĐỦ OBJECT STRUCTURE\n'
            '    {\n'
            '      "id": "party-001",                    // unique ID: "party-001", "party-002"...\n'
            '      "name": "CÔNG TY TNHH ABC",           // REQUIRED - tên đầy đủ\n'
            '      "type": "CLIENT",                     // CLIENT, VENDOR, PARTNER, GUARANTOR\n'
            '      "role": "Bên A - Khách hàng",         // Vai trò trong hợp đồng\n'
            '      "contact": {                          // OBJECT - không flat\n'
            '        "email": "contact@abc.com",         // Email chính thức\n'
            '        "phone": "+84-28-1234-5678",        // SĐT\n'
            '        "address": "123 Nguyễn Huệ, Q1, TP.HCM"  // Địa chỉ đầy đủ\n'
            '      },\n'
            '      "representative": {                   // OBJECT - người đại diện\n'
            '        "name": "Nguyễn Văn A",             // Tên đại diện\n'
            '        "position": "Giám đốc",             // Chức vụ\n'
            '        "email": "nguyenvana@abc.com"       // Email cá nhân\n'
            '      },\n'
            '      "taxCode": "0123456789"               // Mã số thuế\n'
            '    }\n'
            '  ],\n'
            '  \n'
            '  "payment": {\n'
            '    "totalValue": 100000000,                // Tổng giá trị thanh toán\n'
            '    "currency": "VND",\n'
            '    "schedule": [                           // ARRAY of milestones\n'
            '      {\n'
            '        "milestone": "Ký hợp đồng",\n'
            '        "percentage": 30,                   // % thanh toán\n'
            '        "amount": 30000000,                 // Số tiền\n'
            '        "dueDate": "2024-02-15T00:00:00",   // Hạn thanh toán\n'
            '        "status": "PENDING"                 // PENDING, COMPLETED, OVERDUE\n'
            '      }\n'
            '    ],\n'
            '    "method": "Chuyển khoản ngân hàng"      // Phương thức thanh toán\n'
            '  },\n'
            '  \n'
            '  "clauses": {\n'
            '    "key": [                                // Điều khoản QUAN TRỌNG\n'
            '      {\n'
            '        "name": "Điều 5: Phạm vi công việc",\n'
            '        "description": "Mô tả chi tiết điều khoản",\n'
            '        "content": "Trích dẫn nội dung CHÍNH XÁC từ hợp đồng",  // REQUIRED\n'
            '        "importance": "HIGH",               // HIGH, MEDIUM, LOW\n'
            '        "risk": "MEDIUM",                   // HIGH, MEDIUM, LOW\n'
            '        "advice": "Khuyến nghị từ chuyên gia"  // Lời khuyên cụ thể\n'
            '      }\n'
            '    ],\n'
            '    "unfavorable": [                        // Điều khoản BẤT LỢI\n'
            '      {\n'
            '        "name": "Điều 10: Phạt chậm tiến độ",\n'
            '        "description": "Điều khoản gây bất lợi",\n'
            '        "content": "Trích dẫn chính xác",\n'
            '        "impact": "Phạt 1%/tuần nếu chậm",\n'
            '        "affectedParty": "party-001"        // ID bên bị ảnh hưởng\n'
            '      }\n'
            '    ],\n'
            '    "intellectualProperty": "Mô tả quyền sở hữu trí tuệ",  // Hoặc null\n'
            '    "confidentiality": "Mô tả bảo mật",     // Hoặc null\n'
            '    "warranty": "Bảo hành 12 tháng",        // Hoặc null\n'
            '    "termination": "Điều kiện chấm dứt"     // Hoặc null\n'
            '  },\n'
            '  \n'
            '  "reminders": [                            // Nhắc nhở các milestone\n'
            '    {\n'
            '      "date": "2024-03-01T00:00:00",        // Ngày nhắc nhở\n'
            '      "type": "DEADLINE",                   // DEADLINE, MILESTONE, REVIEW, PAYMENT\n'
            '      "title": "Nghiệm thu giai đoạn 1",\n'
            '      "description": "Chi tiết công việc cần làm",\n'
            '      "notifyBefore": 7,                    // Nhắc trước X ngày\n'
            '      "status": "PENDING",                  // PENDING, COMPLETED, CANCELLED\n'
            '      "assignedTo": "user-001"              // ID người phụ trách\n'
            '    }\n'
            '  ],\n'
            '  \n'
            '  "risk": {\n'
            '    "level": "MEDIUM",                      // HIGH, MEDIUM, LOW\n'
            '    "score": 6.5,                           // Điểm rủi ro 0-10\n'
            '    "factors": [                            // ARRAY of risk objects\n'
            '      {\n'
            '        "category": "SCHEDULE",             // LEGAL, FINANCIAL, SCHEDULE, TECHNICAL\n'
            '        "description": "Rủi ro về tiến độ",\n'
            '        "content": "Trích dẫn điều khoản liên quan",\n'
            '        "severity": "MEDIUM",               // HIGH, MEDIUM, LOW\n'
            '        "impact": "Chậm 2 tuần có thể phạt 2%",\n'
            '        "probability": "MEDIUM"             // HIGH, MEDIUM, LOW\n'
            '      }\n'
            '    ],\n'
            '    "mitigations": [                        // Biện pháp giảm thiểu\n'
            '      {\n'
            '        "description": "Thêm nhân lực phát triển",\n'
            '        "cost": "HIGH",                     // HIGH, MEDIUM, LOW\n'
            '        "timeline": "1 tuần",\n'
            '        "assignedTo": "Bên A"\n'
            '      }\n'
            '    ],\n'
            '    "advice": "Tư vấn tổng quát từ chuyên gia pháp lý"\n'
            '  },\n'
            '  \n'
            '  "compliance": {\n'
            '    "status": "COMPLIANT",                  // COMPLIANT, NON_COMPLIANT, PENDING_REVIEW\n'
            '    "requirements": [                       // Yêu cầu tuân thủ\n'
            '      {\n'
            '        "name": "ISO 27001",\n'
            '        "description": "Bảo mật thông tin",\n'
            '        "status": "MET",                    // MET, NOT_MET, IN_PROGRESS\n'
            '        "deadline": "2024-12-31T00:00:00"\n'
            '      }\n'
            '    ],\n'
            '    "regulations": [                        // Quy định pháp lý\n'
            '      "Luật An toàn thông tin",\n'
            '      "Nghị định 13/2023/NĐ-CP"\n'
            '    ],\n'
            '    "certifications": [                     // Chứng nhận\n'
            '      "ISO 27001",\n'
            '      "SOC 2 Type II"\n'
            '    ],\n'
            '    "issues": [],                           // Vấn đề tuân thủ\n'
            '    "recommendations": [                    // Khuyến nghị\n'
            '      "Kiểm tra pháp lý định kỳ",\n'
            '      "Cập nhật điều khoản theo quy định mới"\n'
            '    ]\n'
            '  }\n'
            '}\n\n'
            
            "⚠️ LƯU Ý CỰC KỲ QUAN TRỌNG:\n"
            "1. totalValue: PHẢI là NUMBER (52000000), KHÔNG PHẢI string\n"
            "2. Dates: ISO 8601 format (\"2024-02-01T00:00:00\")\n"
            "3. Parties: PHẢI có id, type, contact object, representative object\n"
            "4. Payment.schedule: PHẢI là ARRAY, không phải string\n"
            "5. Risk.factors: PHẢI là ARRAY of objects với category, severity\n"
            "6. Compliance: PHẢI có requirements, regulations, certifications arrays\n"
            "7. Null: Dùng null nếu không tìm thấy (KHÔNG dùng \"\", [], {})\n"
            "8. KHÔNG dùng \"...\", \"……\" - phải có nội dung cụ thể\n"
            "9. Trích dẫn: content field PHẢI là text thật từ hợp đồng\n"
            "10. Chỉ trả về JSON thuần, KHÔNG có ```json hoặc markdown\n\n"
            
            f"📄 HỢP ĐỒNG CẦN PHÂN TÍCH (Tên file: {filename}):\n"
            f"{content[:4000]}\n"
        )
    
    def _transform_gemini_to_file_mgmt_schema(self, gemini_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform Gemini result to File Management Service schema
        
        Input (Gemini): contractNumber, status, contractType, title, parties, effectiveDate, term,
                        paymentDetails, keyClauses, favorableClauses, unfavorableClauses, reminders,
                        terminationConditions, riskAssessment, complianceStatus
        
        Output (File Mgmt): effectiveDate, expiryDate, totalValue (number), currency, summary,
                            parties, payment, clauses, reminders, risk, compliance
        """
        import re
        from datetime import datetime, timedelta
        
        # Extract totalValue from paymentDetails.totalValue (could be string with text)
        total_value_raw = gemini_result.get("paymentDetails", {}).get("totalValue")
        total_value = None
        currency = gemini_result.get("paymentDetails", {}).get("currency", "VND")
        
        if total_value_raw:
            if isinstance(total_value_raw, (int, float)):
                total_value = total_value_raw
            elif isinstance(total_value_raw, str):
                # Extract numbers from string like "100.000.000 VNĐ" or "52 triệu VND"
                numbers = re.findall(r'\d+', total_value_raw.replace('.', '').replace(',', ''))
                if numbers:
                    total_value = int(''.join(numbers))
        
        # Parse effectiveDate
        effective_date = gemini_result.get("effectiveDate")
        if effective_date and not isinstance(effective_date, str):
            effective_date = str(effective_date)
        
        # Calculate expiryDate from term if not provided
        expiry_date = None
        if effective_date:
            try:
                term = gemini_result.get("term", "")
                # Try to extract months/years from term
                if "tháng" in term or "month" in term.lower():
                    months = re.findall(r'\d+', term)
                    if months:
                        effective_dt = datetime.fromisoformat(effective_date.replace('Z', '+00:00'))
                        expiry_dt = effective_dt + timedelta(days=int(months[0]) * 30)
                        expiry_date = expiry_dt.isoformat()
                elif "năm" in term or "year" in term.lower():
                    years = re.findall(r'\d+', term)
                    if years:
                        effective_dt = datetime.fromisoformat(effective_date.replace('Z', '+00:00'))
                        expiry_dt = effective_dt + timedelta(days=int(years[0]) * 365)
                        expiry_date = expiry_dt.isoformat()
            except Exception as e:
                print(f"Failed to calculate expiryDate: {e}")
        
        # Transform clauses structure
        clauses = {
            "key": [],
            "unfavorable": []
        }
        
        # Map keyClauses to clauses.key
        for key_clause in gemini_result.get("keyClauses", []):
            clauses["key"].append({
                "name": key_clause.get("name"),
                "description": key_clause.get("description"),
                "importance": key_clause.get("importance", "Medium"),
                "risk": key_clause.get("risk", "LOW")
            })
        
        # Map unfavorableClauses to clauses.unfavorable (array of strings)
        for unfav_clause in gemini_result.get("unfavorableClauses", []):
            clause_name = unfav_clause.get("clauseName", unfav_clause.get("name", ""))
            if clause_name:
                clauses["unfavorable"].append(clause_name)
        
        # Transform reminders
        reminders = []
        for reminder in gemini_result.get("reminders", []):
            reminders.append({
                "date": reminder.get("date"),
                "title": reminder.get("type", "General"),
                "description": reminder.get("content", "")
            })
        
        # Transform riskAssessment to risk
        risk_assessment = gemini_result.get("riskAssessment", {})
        risk = {
            "level": risk_assessment.get("riskLevel", "LOW"),
            "factors": risk_assessment.get("riskFactors", []),
            "mitigations": risk_assessment.get("mitigationMeasures", [])
        }
        
        # Transform complianceStatus to compliance
        compliance_status = gemini_result.get("complianceStatus", {})
        compliance = {
            "status": compliance_status.get("status", "COMPLIANT"),
            "issues": compliance_status.get("issues", []),
            "recommendations": compliance_status.get("recommendations", [])
        }
        
        # Build summary from title or object
        summary = gemini_result.get("title") or gemini_result.get("object") or "Hợp đồng"
        
        return {
            "effectiveDate": effective_date,
            "expiryDate": expiry_date,
            "totalValue": total_value,
            "currency": currency,
            "summary": summary,
            "parties": gemini_result.get("parties", []),
            "payment": {
                "totalValue": total_value,
                "currency": currency,
                "schedule": gemini_result.get("paymentDetails", {}).get("schedule"),
                "method": gemini_result.get("paymentDetails", {}).get("paymentMethod")
            },
            "clauses": clauses,
            "reminders": reminders,
            "risk": risk,
            "compliance": compliance
        }
    
    def generate_contract_summary(self, content: str, filename: str) -> Optional[Dict[str, Any]]:
        
        import time
        import random
        import os
        
        max_retries = 3
        base_delay = 5  # seconds
        # Soft prompt-size guard (approx by characters)
        max_chars = int(os.getenv('AI_SUMMARY_MAX_PROMPT_CHARS', '180000'))  # ~180k chars ~ 90k tokens heuristic
        
        logging.info(f"[AI_SUMMARY_START] Starting summary generation for: {filename}")
        
        for attempt in range(max_retries):
            try:
                # Truncate content if too large
                safe_content = content
                if len(safe_content) > max_chars:
                    logging.warning(f"[AI_PROMPT_TRUNCATE] Content too large ({len(safe_content)} chars). Truncating to {max_chars} chars.")
                    safe_content = safe_content[:max_chars]
                prompt = self.get_contract_summary_prompt(safe_content, filename)
                logging.info(f"[AI_SUMMARY_ATTEMPT] Attempt {attempt + 1}/{max_retries} for: {filename}")
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    logging.warning(f"[AI_GEMINI_EMPTY] Empty response for: {filename}")
                    return None
                
                # Parse JSON response
                summary_text = response.text.strip()
                
                # Clean up response text
                cleaned = summary_text
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                # Try to find JSON in the response
                json_start = cleaned.find('{')
                json_end = cleaned.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    cleaned = cleaned[json_start:json_end]
                
                parsed = json.loads(cleaned)
                
                # Ensure required fields exist with proper defaults
                if 'title' not in parsed or not parsed['title']:
                    parsed['title'] = f"Hợp đồng từ tệp: {filename}"
                if 'fileId' not in parsed:
                    parsed['fileId'] = str(uuid.uuid4())
                
                # Remove unnecessary fields
                if 'id' in parsed:
                    del parsed['id']
                if 'summary' in parsed:
                    del parsed['summary']
                
                # Replace "Chưa xác định" with null for better data quality
                def replace_unknown_with_null(obj, key):
                    if key in obj and obj[key] == "Chưa xác định":
                        obj[key] = None
                
                # Normalize Unicode characters to avoid encoding issues
                def normalize_unicode_text(text):
                    if isinstance(text, str):
                        # Replace ellipsis and other problematic Unicode characters
                        text = text.replace('…', '...')
                        text = text.replace('–', '-')
                        # Normalize quotes conservatively
                        text = text.replace('“', '"').replace('”', '"')
                        text = text.replace('‘', "'").replace('’', "'")
                    return text
                
                def normalize_object(obj):
                    if isinstance(obj, dict):
                        return {k: normalize_object(v) for k, v in obj.items()}
                    elif isinstance(obj, list):
                        return [normalize_object(item) for item in obj]
                    else:
                        return normalize_unicode_text(obj)
                
                # Replace "Chưa xác định" with null in main fields
                replace_unknown_with_null(parsed, 'contractNumber')
                replace_unknown_with_null(parsed, 'contractType')
                replace_unknown_with_null(parsed, 'object')
                replace_unknown_with_null(parsed, 'effectiveDate')
                replace_unknown_with_null(parsed, 'term')
                replace_unknown_with_null(parsed, 'terminationConditions')
                
                # Process parties from AI response - keep actual parties from contract content
                if 'parties' not in parsed or not isinstance(parsed['parties'], list):
                    parsed['parties'] = []
                
                # Replace "Chưa xác định" with null in parties
                for party in parsed['parties']:
                    if isinstance(party, dict):
                        replace_unknown_with_null(party, 'name')
                        replace_unknown_with_null(party, 'representative')
                        replace_unknown_with_null(party, 'taxCode')
                        replace_unknown_with_null(party, 'contact')
                        replace_unknown_with_null(party, 'address')
                
                # Replace "Chưa xác định" with null in paymentDetails
                if 'paymentDetails' in parsed and isinstance(parsed['paymentDetails'], dict):
                    replace_unknown_with_null(parsed['paymentDetails'], 'totalValue')
                    replace_unknown_with_null(parsed['paymentDetails'], 'schedule')
                    replace_unknown_with_null(parsed['paymentDetails'], 'currency')
                    replace_unknown_with_null(parsed['paymentDetails'], 'paymentMethod')
                
                # Summary field is no longer needed - removed
                
                # Ensure arrays are properly initialized
                for field in ['tags', 'parties', 'keyClauses', 'favorableClauses', 'unfavorableClauses', 'reminders']:
                    if field not in parsed or not isinstance(parsed[field], list):
                        parsed[field] = []
                
                # Ensure nested objects are properly initialized
                if 'paymentDetails' not in parsed or not isinstance(parsed['paymentDetails'], dict):
                    parsed['paymentDetails'] = {"totalValue": None, "schedule": None, "currency": None, "paymentMethod": None}
                
                # Ensure totalValue is properly handled
                if 'paymentDetails' in parsed and 'totalValue' in parsed['paymentDetails']:
                    total_value = parsed['paymentDetails']['totalValue']
                    if total_value is None or total_value == "" or total_value == "Chưa xác định":
                        parsed['paymentDetails']['totalValue'] = None
                    else:
                        # Keep as string to preserve descriptive format
                        parsed['paymentDetails']['totalValue'] = str(total_value)
                
                if 'riskAssessment' not in parsed or not isinstance(parsed['riskAssessment'], dict):
                    parsed['riskAssessment'] = {"riskLevel": "MEDIUM", "riskFactors": [], "mitigationMeasures": []}
                else:
                    # Ensure unified keys exist
                    ra = parsed['riskAssessment']
                    # riskDetails field removed
                
                if 'complianceStatus' not in parsed or not isinstance(parsed['complianceStatus'], dict):
                    parsed['complianceStatus'] = {"status": "REVIEW_REQUIRED", "issues": [], "recommendations": []}
                
                # Normalize Unicode characters in the entire parsed object
                parsed = normalize_object(parsed)

                # Không tự chèn dữ liệu mặc định; giữ nguyên mảng rỗng nếu văn bản không có thông tin
                
                # Transform to File Management schema
                if parsed:
                    parsed = self._transform_gemini_to_file_mgmt_schema(parsed)
                
                logging.info(f"[AI_GEMINI_SUMMARY_SUCCESS] Summary created for: {filename}")
                return parsed
                
            except Exception as e:
                error_str = str(e)
                
                # Check for API key invalid error
                if "API key not valid" in error_str or "API_KEY_INVALID" in error_str:
                    # Get API key info for debugging
                    api_key_info = "Thiếu api key"
                    try:
                        if hasattr(self, 'api_key') and self.api_key:
                            api_key_info = f"+ {self.api_key[:10]}..."
                    except:
                        api_key_info = "Thiếu api key"
                    
                    logging.error(f"[AI_API_KEY_INVALID] Invalid API key: {e}")
                    # Return special error indicator for API key issues
                    return {"error": "API_KEY_INVALID", "message": f"API key không hợp lệ. Vui lòng kiểm tra lại API key. {api_key_info}"}
                
                if "429" in error_str or "quota" in error_str.lower() or "rate" in error_str.lower():
                    if attempt < max_retries - 1:
                        # Calculate delay with exponential backoff and jitter
                        delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                        logging.warning(f"[AI_RATE_LIMIT_RETRY] Rate limit hit, retrying in {delay:.1f}s (attempt {attempt + 1}/{max_retries})")
                        time.sleep(delay)
                        continue
                    else:
                        logging.error(f"[AI_RATE_LIMIT_EXHAUSTED] All retry attempts exhausted for: {filename}")
                        return None
                else:
                    logging.exception(f"[AI_GEMINI_ERROR] AI failed to generate summary: {e}")
                    return None
        
        logging.error(f"[AI_GENERATE_FAILED] Failed to generate summary for: {filename}")
        return None
    
    def classify_document(self, content: str, filename: str) -> Dict[str, Any]:
        
        try:
            # Quick classification prompt (force Vietnamese and JSON-only)
            categories = [
                "contract", "syllabus", "curriculum", "textbook", "lecture_notes", "assignment",
                "research_paper", "invoice", "receipt", "policy", "manual", "letter", "report", "other"
            ]
            classification_prompt = (
                "Luôn trả lời HOÀN TOÀN bằng TIẾNG VIỆT.\n"
                "Hãy phân loại loại tài liệu dưới đây. Chỉ trả về JSON hợp lệ với cấu trúc:\n"
                "{\n"
                "  \"documentType\": string,\n"
                "  \"isContract\": boolean,\n"
                "  \"contractSubtype\": string|null,\n"
                "  \"confidence\": number,\n"
                "  \"reasons\": [string]\n"
                "}\n\n"
                "Yêu cầu: Không giải thích thêm, không kèm markdown, chỉ JSON.\n"
                f"Danh mục hợp lệ: {', '.join(categories)}\n\n"
                f"Tên tệp: {filename}\n"
                "Nội dung tài liệu (cắt ngắn nếu quá dài):\n" + (content[:8000] if isinstance(content, str) else str(content)[:8000])
            )
            
            response = self.model.generate_content(classification_prompt)
            
            if response.text:
                # Parse classification result
                try:
                    cleaned = response.text.strip()
                    if cleaned.startswith('```json'):
                        cleaned = cleaned[7:]
                    if cleaned.startswith('```'):
                        cleaned = cleaned[3:]
                    if cleaned.endswith('```'):
                        cleaned = cleaned[:-3]
                    result = json.loads(cleaned)
                    # Map to unified schema
                    document_type = result.get("documentType") or result.get("classification") or "other"
                    is_contract = bool(result.get("isContract") or (str(document_type).lower() == "contract"))
                    confidence = float(result.get("confidence", 0.5))
                    reasons = result.get("reasons", [])
                    if not isinstance(reasons, list):
                        reasons = [str(reasons)]
                    contract_subtype = result.get("contractSubtype") if is_contract else None
                    return {
                        "documentType": str(document_type),
                        "isContract": is_contract,
                        "confidence": confidence,
                        "reasons": reasons,
                        "contractSubtype": contract_subtype
                    }
                except json.JSONDecodeError:
                    # Fallback classification based on filename
                    filename_lower = filename.lower()
                    contract_indicators = ['hop-dong', 'contract', 'hợp đồng', 'thỏa thuận', 'agreement']
                    
                    if any(indicator in filename_lower for indicator in contract_indicators):
                        return {"documentType": "contract", "isContract": True, "confidence": 0.8, "reasons": ["Tệp có dấu hiệu hợp đồng"], "contractSubtype": None}
                    else:
                        return {"documentType": "other", "isContract": False, "confidence": 0.5, "reasons": ["Không có tín hiệu rõ ràng"], "contractSubtype": None}
            
            return {"documentType": "other", "isContract": False, "confidence": 0.5, "reasons": ["Không có phản hồi từ AI"], "contractSubtype": None}
            
        except Exception as e:
            logging.error(f"[AI_CLASSIFICATION_ERROR] Error in classification: {e}")
            return {"documentType": "other", "isContract": False, "confidence": 0.5, "reasons": [str(e)], "contractSubtype": None}
    
    def extract_text_with_gemini(self, content: bytes, filename: str, content_type: str) -> str:
        
        try:
            # For now, return a placeholder. In real implementation, this would process the file content
            if content_type.startswith('text/'):
                return content.decode('utf-8', errors='ignore')
            else:
                # For binary files, return a placeholder indicating AI extraction
                return f"[AI_EXTRACTED_CONTENT] Content from {filename} ({content_type}) - AI text extraction completed"
                
        except Exception as e:
            logging.error(f"[AI_EXTRACT_ERROR] Error extracting text: {e}")
            return f"[AI_EXTRACT_ERROR] Could not extract text from {filename}: {str(e)}"

    def extract_sections(self, text: str) -> list:
        if not text:
            return []
        
        try:
            prompt = f"""
            Phân tích văn bản hợp đồng sau và trích xuất các phần/section chính. 
            Mỗi section cần có:
            - title: Tiêu đề phần (ngắn gọn)
            - description: Mô tả nội dung phần (1-2 câu)
            - content: Nội dung chính của phần (trích dẫn từ văn bản)
            - pageNumber: Số trang (đặt 1 nếu không biết)
            
            Văn bản:
            {text[:2000]}
            
            Trả về JSON array với tối đa 5 sections quan trọng nhất.
            """
            
            response = self.model.generate_content(prompt)
            if response.text:
                cleaned = response.text.strip()
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                sections = json.loads(cleaned)
                return sections[:5] if isinstance(sections, list) else []
        except Exception as e:
            logging.warning(f"AI section extraction failed: {e}")
        
        # Fallback
        lines = text.split('\n')
        sections = []
        current_section = None
        for line in lines:
            line = line.strip()
            if line and any(keyword in line.upper() for keyword in ['ĐIỀU', 'MỤC', 'CHƯƠNG', 'PHẦN', 'BÊN A', 'BÊN B']):
                if current_section:
                    sections.append(current_section)
                current_section = {
                    "title": line,
                    "description": f"Mô tả {line.lower()}",
                    "content": line,
                    "pageNumber": 1
                }
            elif current_section and line:
                current_section["content"] += f"\n{line}"
        if current_section:
            sections.append(current_section)
        return sections[:5]

    def extract_key_terms(self, text: str) -> list:
        if not text:
            return []
        
        try:
            prompt = f"""
            Trích xuất các từ khóa chính từ văn bản hợp đồng sau.
            Tập trung vào:
            - Loại hợp đồng (lao động, dịch vụ, mua bán...)
            - Lĩnh vực hoạt động (công nghệ, xây dựng, tài chính...)
            - Các điều khoản quan trọng
            - Thời hạn, giá trị, đối tác
            
            Văn bản:
            {text[:1500]}
            
            Trả về JSON array với tối đa 8 từ khóa quan trọng nhất.
            """
            
            response = self.model.generate_content(prompt)
            if response.text:
                cleaned = response.text.strip()
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                keywords = json.loads(cleaned)
                return keywords[:8] if isinstance(keywords, list) else []
        except Exception as e:
            logging.warning(f"AI key terms extraction failed: {e}")
        
        # Fallback
        keywords = []
        text_lower = text.lower()
        if "hợp đồng lao động" in text_lower:
            keywords.append("hợp đồng lao động")
        if "phát triển" in text_lower:
            keywords.append("phát triển phần mềm")
        if "hệ thống" in text_lower:
            keywords.append("hệ thống quản lý")
        if "công nghệ" in text_lower:
            keywords.append("công nghệ thông tin")
        if "lương" in text_lower or "thưởng" in text_lower:
            keywords.append("tiền lương")
        if "thời gian" in text_lower:
            keywords.append("thời gian làm việc")
        return keywords[:8]

    def extract_parties_from_text(self, text: str) -> list:
        if not text:
            return []
        
        try:
            prompt = f"""
            Phân tích văn bản hợp đồng và trích xuất thông tin các bên tham gia.
            Tìm kiếm:
            - Tên công ty/cá nhân
            - Địa chỉ
            - Email, điện thoại
            - Mã số thuế
            - Người đại diện và chức vụ
            
            Văn bản:
            {text[:2500]}
            
            Trả về JSON array với format:
            [
                {{
                    "id": "party-001",
                    "name": "Tên công ty/cá nhân",
                    "type": "CLIENT/VENDOR/PARTNER",
                    "role": "Vai trò trong hợp đồng",
                    "contact": {{
                        "email": "email@example.com",
                        "phone": "số điện thoại",
                        "address": "địa chỉ"
                    }},
                    "representative": {{
                        "name": "Tên người đại diện",
                        "position": "Chức vụ",
                        "email": "email đại diện"
                    }},
                    "taxCode": "Mã số thuế"
                }}
            ]
            
            Tối đa 3 bên tham gia.
            """
            
            response = self.model.generate_content(prompt)
            if response.text:
                cleaned = response.text.strip()
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                parties = json.loads(cleaned)
                if isinstance(parties, list):
                    for i, party in enumerate(parties):
                        if not party.get("id"):
                            party["id"] = f"party-{i+1:03d}"
                        if not party.get("contact"):
                            party["contact"] = {"email": "", "phone": "", "address": ""}
                        if not party.get("representative"):
                            party["representative"] = {"name": "", "position": "", "email": ""}
                    return parties[:3]
        except Exception as e:
            logging.warning(f"AI parties extraction failed: {e}")
        
        # Fallback
        parties = []
        lines = text.split('\n')
        current_party = None
        
        for line in lines:
            line = line.strip()
            if "BÊN A" in line.upper() or "NGƯỜI SỬ DỤNG LAO ĐỘNG" in line.upper():
                if current_party:
                    parties.append(current_party)
                current_party = {
                    "id": f"party-{len(parties) + 1:03d}",
                    "name": "",
                    "type": "CLIENT",
                    "role": "Người sử dụng lao động",
                    "contact": {"email": "", "phone": "", "address": ""},
                    "representative": {"name": "", "position": "", "email": ""},
                    "taxCode": ""
                }
            elif "BÊN B" in line.upper() or "NGƯỜI LAO ĐỘNG" in line.upper():
                if current_party:
                    parties.append(current_party)
                current_party = {
                    "id": f"party-{len(parties) + 1:03d}",
                    "name": "",
                    "type": "VENDOR",
                    "role": "Người lao động",
                    "contact": {"email": "", "phone": "", "address": ""},
                    "representative": {"name": "", "position": "", "email": ""},
                    "taxCode": ""
                }
            elif current_party and line:
                if "Tên công ty:" in line or "Họ tên:" in line:
                    current_party["name"] = line.split(":", 1)[1].strip()
                elif "Email:" in line:
                    current_party["contact"]["email"] = line.split(":", 1)[1].strip()
                elif "Điện thoại:" in line:
                    current_party["contact"]["phone"] = line.split(":", 1)[1].strip()
                elif "Mã số thuế:" in line:
                    current_party["taxCode"] = line.split(":", 1)[1].strip()
                elif "Đại diện:" in line:
                    current_party["representative"]["name"] = line.split(":", 1)[1].strip()
        
        if current_party:
            parties.append(current_party)
        
        return parties[:3]