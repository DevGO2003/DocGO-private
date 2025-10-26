import logging
import json
import uuid
from typing import Optional, Dict, Any
import google.generativeai as genai
from config import Config
from utils.ai_clients import AIClientFactory
from prompts.contract_analysis_prompt import PROMPT as CONTRACT_ANALYSIS_PROMPT


class AutomationService:
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AutomationService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            cached = AIClientFactory.get_cached_client_model()
            if cached:
                client_name, model_name = cached
                logging.info(f"[AUTOMATION_SERVICE] Using cached client: {client_name}, model: {model_name}")
            
            self.gemini_client = AIClientFactory.get_gemini_client()
            self.openrouter_client = AIClientFactory.get_openrouter_client()
            
            self.VIETNAMESE_RESPONSE_INSTRUCTION = (
                "Lưu ý: Trả lời BẰNG TIẾNG VIỆT, không kèm markdown hay giải thích, chỉ JSON hợp lệ."
            )
            
            logging.info(f"[AUTOMATION_SERVICE_SINGLETON] Initialized with client: {AIClientFactory.get_current_client()}, model: {AIClientFactory.get_current_model()}")
            AutomationService._initialized = True
    
    def _is_quota_error(self, error_str: str) -> bool:
        return AIClientFactory.is_quota_error(error_str)
    
    def _generate_with_fallback(self, prompt: str, max_tokens: int = 2000) -> Optional[str]:
        try:
            return self.gemini_client.generate_content(prompt)
        except Exception as e:
            error_str = str(e)
            if "API key not valid" in error_str or "API_KEY_INVALID" in error_str:
                logging.error(f"[AI_API_KEY_INVALID] Invalid API key: {e}")
                if self.openrouter_client.is_available():
                    return self.openrouter_client.generate_content(prompt, max_tokens)
                else:
                    return {"error": "API_KEY_INVALID", "message": "API key không hợp lệ. Fallback to OpenRouter if available."}
            elif self._is_quota_error(error_str):
                if self.openrouter_client.is_available():
                    return self.openrouter_client.generate_content(prompt, max_tokens)
            raise e
    
    def get_contract_summary_prompt(self, content: str, filename: str) -> str:
        return f"{CONTRACT_ANALYSIS_PROMPT}\n\n📄 HỢP ĐỒNG CẦN PHÂN TÍCH (Tên file: {filename}):\n{content[:4000]}\n"
    
    def generate_contract_summary(self, content: str, filename: str) -> Optional[Dict[str, Any]]:
        
        import time
        import random
        import os
        
        max_retries = 3
        base_delay = 5  
        max_chars = int(os.getenv('AI_SUMMARY_MAX_PROMPT_CHARS', '180000'))  
        
        logging.info(f"[AI_SUMMARY_START] Starting summary generation for: {filename}")
        
        # Validate content
        if not content or not isinstance(content, str):
            logging.warning(f"[AI_SUMMARY_INVALID_CONTENT] Content is None or not string, returning None")
            return None
        
        for attempt in range(max_retries):
            try:
                safe_content = content
                if not safe_content or len(safe_content) == 0:
                    logging.warning(f"[AI_SUMMARY_EMPTY_CONTENT] Content is empty for: {filename}")
                    return None
                
                if len(safe_content) > max_chars:
                    logging.warning(f"[AI_PROMPT_TRUNCATE] Content too large ({len(safe_content)} chars). Truncating to {max_chars} chars.")
                    safe_content = safe_content[:max_chars]
                prompt = self.get_contract_summary_prompt(safe_content, filename)
                prompt = f"{prompt}\n\n{self.VIETNAMESE_RESPONSE_INSTRUCTION}"
                logging.info(f"[AI_SUMMARY_ATTEMPT] Attempt {attempt + 1}/{max_retries} for: {filename}")
                
                response_text = self._generate_with_fallback(prompt, max_tokens=4000)
                
                if not response_text:
                    logging.warning(f"[AI_EMPTY] No response from any AI provider for: {filename}")
                    return None
                
                summary_text = response_text.strip()
                
                cleaned = summary_text
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
                
                json_start = cleaned.find('{')
                json_end = cleaned.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    cleaned = cleaned[json_start:json_end]
                
                parsed = json.loads(cleaned)
                
                logging.info(f"[AI_GEMINI_SUMMARY_SUCCESS] Summary created for: {filename}")
                return parsed
                
            except Exception as e:
                error_str = str(e)
                
                if "API key not valid" in error_str or "API_KEY_INVALID" in error_str:
                    api_key_info = "Thiếu api key"
                    try:
                        if hasattr(self, 'api_key') and self.api_key:
                            api_key_info = f"+ {self.api_key[:10]}..."
                    except:
                        api_key_info = "Thiếu api key"
                    
                    logging.error(f"[AI_API_KEY_INVALID] Invalid API key: {e}")
                    return {"error": "API_KEY_INVALID", "message": f"API key không hợp lệ. Vui lòng kiểm tra lại API key. {api_key_info}"}
                
                if "429" in error_str or "quota" in error_str.lower() or "rate" in error_str.lower():
                    if attempt < max_retries - 1:
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
            from utils.smart_sampler import SmartSampler
            
            keyword_confidence = SmartSampler.get_contract_confidence(content)
            
            if keyword_confidence >= 0.7:
                logging.info(f"[AI_CLASSIFY] Keyword pre-check: confidence={keyword_confidence:.2f}, skipping AI")
                return {
                    "documentType": "contract",
                    "isContract": True,
                    "confidence": keyword_confidence,
                    "reasons": ["Phát hiện từ khóa hợp đồng rõ ràng trong nội dung"],
                    "contractSubtype": None
                }
            
            logging.info(f"[AI_CLASSIFY] Keyword pre-check: confidence={keyword_confidence:.2f}, using AI for better accuracy")
            
            sampling_result = SmartSampler.sample_three_parts(
                text=content,
                max_chars=9000  
            )
            
            sample_text = sampling_result['sample']
            metadata = sampling_result['metadata']
            
            logging.info(f"[AI_CLASSIFY] Sampling: method={metadata['method']}, sample_length={metadata['sample_length']}, original_length={metadata['original_length']}")
            
            categories = [
                "contract", "syllabus", "curriculum", "textbook", "lecture_notes", "assignment",
                "research_paper", "invoice", "receipt", "policy", "manual", "letter", "report", "other"
            ]
            classification_prompt = self._load_prompt_template(
                "document_classification_legacy",
                categories=', '.join(categories),
                filename=filename,
                content=sample_text
            ) + f"\n\n{self.VIETNAMESE_RESPONSE_INSTRUCTION}"
            
            response_text = self.gemini_client.generate_content(classification_prompt)
            
            if response_text:
                try:
                    cleaned = response_text.strip()
                    if cleaned.startswith('```json'):
                        cleaned = cleaned[7:]
                    if cleaned.startswith('```'):
                        cleaned = cleaned[3:]
                    if cleaned.endswith('```'):
                        cleaned = cleaned[:-3]
                    result = json.loads(cleaned)
                    
                    document_type_raw = result.get("documentType") or result.get("classification")
                    
                    if document_type_raw and str(document_type_raw).lower() in [c.lower() for c in categories]:
                        document_type = str(document_type_raw).lower()
                    else:
                        document_type = None
                    is_contract = bool(result.get("isContract") or (document_type and str(document_type).lower() == "contract"))
                    confidence = float(result.get("confidence", 0.5))
                    reasons = result.get("reasons", [])
                    if not isinstance(reasons, list):
                        reasons = [str(reasons)]
                    contract_subtype = result.get("contractSubtype") if is_contract else None
                    
                    return {
                        "documentType": document_type,  
                        "isContract": is_contract,
                        "confidence": confidence,
                        "reasons": reasons,
                        "contractSubtype": contract_subtype
                    }
                except json.JSONDecodeError as je:
                    logging.warning(f"[AI_CLASSIFY] JSON parse failed: {je}, trying keyword-based fallback")
                    
                    confidence = SmartSampler.get_contract_confidence(content)
                    is_contract = confidence >= 0.7
                    
                    if is_contract:
                        return {
                            "documentType": "contract",
                            "isContract": True,
                            "confidence": confidence,
                            "reasons": ["Phát hiện từ khóa hợp đồng trong nội dung"],
                            "contractSubtype": None
                        }
                    else:
                        return {
                            "documentType": "other",
                            "isContract": False,
                            "confidence": 0.5,
                            "reasons": ["Không đủ dấu hiệu hợp đồng"],
                            "contractSubtype": None
                        }
            
            logging.warning("[AI_CLASSIFY] No AI response, using keyword fallback")
            from utils.smart_sampler import SmartSampler
            confidence = SmartSampler.get_contract_confidence(content)
            is_contract = confidence >= 0.7
            
            return {
                "documentType": "contract" if is_contract else "other",
                "isContract": is_contract,
                "confidence": confidence,
                "reasons": ["Phát hiện từ khóa hợp đồng (AI không khả dụng)"] if is_contract else ["Không đủ dấu hiệu hợp đồng"],
                "contractSubtype": None
            }
            
        except Exception as e:
            logging.error(f"[AI_CLASSIFICATION_ERROR] Error in classification: {e}")
            
            from utils.smart_sampler import SmartSampler
            confidence = SmartSampler.get_contract_confidence(content)
            is_contract = confidence >= 0.7
            
            return {
                "documentType": "contract" if is_contract else "other",
                "isContract": is_contract,
                "confidence": confidence,
                "reasons": [f"Phát hiện từ khóa hợp đồng (AI lỗi: {str(e)[:50]}...)"] if is_contract else [f"Lỗi AI, dùng keyword fallback: {str(e)[:50]}..."],
                "contractSubtype": None
            }
    
    def classify_document_from_file(self, file_content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        import tempfile
        import os
        from utils.mime_mapper import get_proper_mime_type, is_supported_by_gemini
        
        try:
            proper_mime_type = get_proper_mime_type(filename, content_type)
            logging.info(f"[AI_FILE_CLASSIFICATION] Classifying file: {filename}, original_mime: {content_type}, proper_mime: {proper_mime_type}")
            
            if not is_supported_by_gemini(proper_mime_type):
                logging.warning(f"[AI_FILE_CLASSIFICATION] MIME type not supported by Gemini: {proper_mime_type}")
                return {
                    "documentType": "other",
                    "isContract": False,
                    "confidence": 1.0,
                    "reasons": [f"Loại file không được hỗ trợ: {proper_mime_type}"],
                    "contractSubtype": None
                }
            
            prompt = f"""
            Phân tích file "{filename}" (loại: {proper_mime_type}) và xác định loại tài liệu.
            
            Trả về JSON với các trường:
            - documentType: "contract", "invoice", "report", "other"
            - isContract: true/false
            - confidence: 0.0-1.0
            - reasons: ["lý do 1", "lý do 2"]
            - contractSubtype: null hoặc loại hợp đồng nếu là contract
            
            {self.VIETNAMESE_RESPONSE_INSTRUCTION}
            """
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            try:
                uploaded_file = genai.upload_file(temp_file_path, mime_type=proper_mime_type)
                logging.info(f"[AI_FILE_UPLOAD] File uploaded: {uploaded_file.uri}")
                
                response_text = self.gemini_client.generate_content(f"{prompt}\n\nFile: {uploaded_file.uri}")
            finally:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            
            if response_text:
                try:
                    cleaned = response_text.strip()
                    if cleaned.startswith('```json'):
                        cleaned = cleaned[7:]
                    if cleaned.startswith('```'):
                        cleaned = cleaned[3:]
                    if cleaned.endswith('```'):
                        cleaned = cleaned[:-3]
                    
                    result = json.loads(cleaned)
                    
                    document_type = result.get("documentType") or "other"
                    is_contract = bool(result.get("isContract") or (str(document_type).lower() == "contract"))
                    confidence = float(result.get("confidence", 0.5))
                    reasons = result.get("reasons", [])
                    if not isinstance(reasons, list):
                        reasons = [str(reasons)]
                    contract_subtype = result.get("contractSubtype") if is_contract else None
                    
                    logging.info(f"[AI_FILE_CLASSIFICATION] Result: {document_type}, isContract: {is_contract}")
                    
                    return {
                        "documentType": str(document_type),
                        "isContract": is_contract,
                        "confidence": confidence,
                        "reasons": reasons,
                        "contractSubtype": contract_subtype
                    }
                    
                except json.JSONDecodeError:
                    filename_lower = filename.lower()
                    contract_indicators = ['hop-dong', 'contract', 'hợp đồng', 'thỏa thuận', 'agreement']
                    
                    if any(indicator in filename_lower for indicator in contract_indicators):
                        return {"documentType": "contract", "isContract": True, "confidence": 0.8, "reasons": ["Tên file có dấu hiệu hợp đồng"], "contractSubtype": None}
                    else:
                        return {"documentType": "other", "isContract": False, "confidence": 0.5, "reasons": ["Không phân tích được nội dung"], "contractSubtype": None}
            
            return {"documentType": "other", "isContract": False, "confidence": 0.5, "reasons": ["Không có phản hồi từ AI"], "contractSubtype": None}
            
        except Exception as e:
            logging.error(f"[AI_FILE_CLASSIFICATION_ERROR] Error in file classification: {e}")
            return {"documentType": "other", "isContract": False, "confidence": 0.5, "reasons": [str(e)], "contractSubtype": None}
    
    def extract_text_with_gemini(self, content: bytes, filename: str, content_type: str) -> str:
        
        try:
            if content_type.startswith('text/'):
                return content.decode('utf-8', errors='ignore')
            else:
                return f"Content extracted from {filename} ({content_type})"
                
        except Exception as e:
            logging.error(f"[AI_EXTRACT_ERROR] Error extracting text: {e}")
            return f"[AI_EXTRACT_ERROR] Could not extract text from {filename}: {str(e)}"

    def extract_sections(self, text: str) -> list:
        if not text:
            return []
        
        try:
            prompt = self._load_prompt_template(
                "contract_sections_analysis",
                text=text[:2000]
            ) + """
            
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
            prompt = self._load_prompt_template(
                "contract_keywords_extraction",
                text=text[:1500]
            ) + """
            
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
            prompt = self._load_prompt_template(
                "contract_parties_extraction",
                text=text[:2500]
            ) + """
            
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
    
    def _load_prompt_template(self, template_name: str, **kwargs) -> str:
        import os
        
        try:
            service_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            prompts_dir = os.path.join(service_dir, "prompts")
            template_path = os.path.join(prompts_dir, f"{template_name}.txt")
            
            with open(template_path, 'r', encoding='utf-8') as f:
                template = f.read()
                
            return template.format(**kwargs)
        except Exception as e:
            logging.error(f"Error loading prompt template {template_name}: {e}")
            return f"Process the following content: {kwargs.get('content', '')}"