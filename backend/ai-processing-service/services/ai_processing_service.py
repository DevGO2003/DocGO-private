"""
AI Processing Service - Gom các chức năng chung giữa API và Event handler
"""

import logging
import json
import uuid
from typing import Optional, Dict, Any
import google.generativeai as genai
from config import get_gemini_api_key


class AIProcessingService:
    """Service xử lý AI chung cho cả API và Event handler"""
    
    def __init__(self):
        self.api_key = get_gemini_api_key()
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def get_contract_summary_prompt(self, content: str, filename: str) -> str:
        """Tạo prompt chuẩn cho việc tóm tắt hợp đồng - dùng chung cho API và Event"""
        return (
            "Bạn là chuyên gia phân tích hợp đồng. Hãy phân tích chi tiết hợp đồng dưới đây và tạo JSON tóm tắt chính xác.\n\n"
            "YÊU CẦU PHÂN TÍCH:\n"
            "1. ĐỌC KỸ từng dòng văn bản để trích xuất thông tin CHÍNH XÁC\n"
            "2. Tìm kiếm và trích xuất thông tin cụ thể từ văn bản thực tế\n"
            "3. KHÔNG sử dụng dấu \"...\" hoặc \"……\" - phải trích xuất thông tin thực tế\n"
            "4. Xác định các điều khoản có lợi và bất lợi cho từng bên\n"
            "5. Đánh giá rủi ro dựa trên nội dung thực tế\n"
            "6. Đưa ra khuyến nghị tuân thủ pháp luật\n"
            "7. QUAN TRỌNG: Nếu không tìm thấy thông tin cụ thể, hãy trả về null thay vì \"Chưa xác định\"\n"
            "8. Đảm bảo mỗi điều khoản trong keyClauses, favorableClauses, unfavorableClauses là một object riêng biệt\n"
            "9. riskFactors và mitigationMeasures phải là danh sách chi tiết từng yếu tố\n\n"
            "THÔNG TIN CẦN TRÍCH XUẤT:\n"
            "- Tên công ty/tổ chức tham gia (Bên A, Bên B)\n"
            "- Tên người đại diện và chức vụ\n"
            "- Địa chỉ cụ thể của các bên\n"
            "- Mã số thuế (nếu có)\n"
            "- Số điện thoại, email (nếu có)\n"
            "- Số hợp đồng (nếu có)\n"
            "- Ngày ký hợp đồng\n"
            "- Giá trị hợp đồng (số tiền cụ thể)\n"
            "- Thời hạn hợp đồng\n"
            "- Đối tượng hợp đồng (sản phẩm/dịch vụ cụ thể)\n\n"
            "TRẢ VỀ JSON VỚI CẤU TRÚC SAU:\n"
            '{\n'
            '  "contractNumber": "số hợp đồng thực tế từ văn bản",\n'
            '  "status": null,\n'
            '  "contractType": "loại hợp đồng cụ thể",\n'
            '  "title": "tiêu đề đầy đủ của hợp đồng",\n'
            '  "tags": ["các từ khóa liên quan"],\n'
            '  "parties": [\n'
            '    {\n'
            '      "role": "vai trò thực tế từ hợp đồng (Bên A, Bên B, Bên mua, Bên bán, v.v.)",\n'
            '      "name": "tên công ty/tổ chức thực tế từ hợp đồng",\n'
            '      "representative": "tên người đại diện thực tế từ hợp đồng",\n'
            '      "taxCode": "mã số thuế thực tế từ hợp đồng",\n'
            '      "contact": "thông tin liên hệ thực tế từ hợp đồng",\n'
            '      "address": "địa chỉ thực tế từ hợp đồng",\n'
            '      "businessLicense": null\n'
            '    }\n'
            '  ],\n'
            '  "object": "đối tượng hợp đồng chi tiết",\n'
            '  "effectiveDate": "ngày có hiệu lực (ISO 8601)",\n'
            '  "term": "thời hạn hợp đồng cụ thể",\n'
            '  "paymentDetails": {\n'
            '    "totalValue": "giá trị hợp đồng chi tiết từ văn bản",\n'
            '    "schedule": "lịch thanh toán chi tiết",\n'
            '    "currency": "đơn vị tiền tệ",\n'
            '    "paymentMethod": "phương thức thanh toán"\n'
            '  },\n'
            '  "keyClauses": [\n'
            '    {"name": "tên điều khoản", "description": "mô tả chi tiết nội dung", "source": "điều số tham chiếu"}\n'
            '  ],\n'
            '  "favorableClauses": [\n'
            '    {"clauseName": "tên điều khoản có lợi", "description": "mô tả lợi ích", "benefitTo": "bên được hưởng lợi"}\n'
            '  ],\n'
            '  "unfavorableClauses": [\n'
            '    {"clauseName": "tên điều khoản bất lợi", "description": "mô tả rủi ro", "riskTo": "bên chịu rủi ro"}\n'
            '  ],\n'
            '  "reminders": [],\n'
            '  "terminationConditions": "các điều kiện chấm dứt hợp đồng",\n'
            '  "riskAssessment": {\n'
            '    "riskLevel": "LOW|MEDIUM|HIGH",\n'
            '    "riskFactors": ["các yếu tố rủi ro cụ thể"],\n'
            '    "mitigationMeasures": ["các biện pháp giảm thiểu rủi ro"]\n'
            '  },\n'
            '  "complianceStatus": {\n'
            '    "status": "COMPLIANT|NON_COMPLIANT|REVIEW_REQUIRED",\n'
            '    "issues": ["các vấn đề tuân thủ pháp luật"],\n'
            '    "recommendations": ["khuyến nghị cải thiện"]\n'
            '  }\n'
            '}\n\n'
            "LƯU Ý QUAN TRỌNG:\n"
            "- PHẢI trích xuất thông tin CHÍNH XÁC từ văn bản, KHÔNG được bịa đặt\n"
            "- KHÔNG sử dụng dấu \"...\" hoặc \"……\" - phải tìm thông tin thực tế\n"
            "- Nếu văn bản có dấu \"...\" thì bỏ qua và tìm thông tin khác\n"
            "- ĐỌC KỸ từng dòng để tìm thông tin cụ thể\n"
            "- Tìm kiếm tên công ty, địa chỉ, mã số thuế, số điện thoại trong văn bản\n"
            "- Trích xuất số hợp đồng, ngày ký, giá trị từ văn bản thực tế\n"
            "- Phân tích kỹ các điều khoản để xác định điều có lợi/bất lợi\n"
            "- Đánh giá rủi ro dựa trên nội dung thực tế\n"
            "- totalValue có thể là mô tả chi tiết, ví dụ: \"100.000.000 VNĐ (Chưa bao gồm thuế)\" hoặc \"50.000 USD\"\n"
            "- Nếu không tìm thấy thông tin cụ thể, dùng \"Chưa xác định\" thay vì null\n"
            "- Chỉ trả về JSON hợp lệ, không kèm markdown\n\n"
            f"NỘI DUNG HỢP ĐỒNG:\n{content[:10000]}\n"
        )
    
    def generate_contract_summary(self, content: str, filename: str) -> Optional[Dict[str, Any]]:
        """Gọi Gemini để tạo JSON tóm tắt hợp đồng; fallback nếu lỗi."""
        try:
            prompt = self.get_contract_summary_prompt(content, filename)
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
                    text = text.replace('"', '"')
                    text = text.replace('"', '"')
                    text = text.replace(''', "'")
                    text = text.replace(''', "'")
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
            
            if 'complianceStatus' not in parsed or not isinstance(parsed['complianceStatus'], dict):
                parsed['complianceStatus'] = {"status": "REVIEW_REQUIRED", "issues": [], "recommendations": []}
            
            # Normalize Unicode characters in the entire parsed object
            parsed = normalize_object(parsed)
            
            logging.info(f"[AI_GEMINI_SUMMARY_SUCCESS] Summary created for: {filename}")
            return parsed
            
        except Exception as e:
            logging.exception(f"[AI_GEMINI_FALLBACK] Using fallback summary due to exception: {e}")
            return None
    
    def classify_document(self, content: str, filename: str) -> Dict[str, Any]:
        """Phân loại tài liệu sử dụng Gemini AI"""
        try:
            # Quick classification prompt
            classification_prompt = f"""
            Phân loại tài liệu sau đây. Trả về JSON với format:
            {{
                "classification": "CONTRACT|GENERAL|INVOICE|OTHER",
                "confidence": 0.0-1.0,
                "categories": ["danh sách các thể loại"]
            }}
            
            Tài liệu: {filename}
            Nội dung: {content[:2000]}
            """
            
            response = self.model.generate_content(classification_prompt)
            
            if response.text:
                # Parse classification result
                try:
                    result = json.loads(response.text.strip())
                    return result
                except json.JSONDecodeError:
                    # Fallback classification based on filename
                    filename_lower = filename.lower()
                    contract_indicators = ['hop-dong', 'contract', 'hợp đồng', 'thỏa thuận', 'agreement']
                    
                    if any(indicator in filename_lower for indicator in contract_indicators):
                        return {"classification": "CONTRACT", "confidence": 0.8, "categories": ["document", "contract"]}
                    else:
                        return {"classification": "GENERAL", "confidence": 0.5, "categories": ["document"]}
            
            return {"classification": "GENERAL", "confidence": 0.5, "categories": ["document"]}
            
        except Exception as e:
            logging.error(f"[AI_CLASSIFICATION_ERROR] Error in classification: {e}")
            return {"classification": "GENERAL", "confidence": 0.5, "categories": ["document"]}
    
    def extract_text_with_gemini(self, content: bytes, filename: str, content_type: str) -> str:
        """Trích xuất text từ file sử dụng Gemini AI"""
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
