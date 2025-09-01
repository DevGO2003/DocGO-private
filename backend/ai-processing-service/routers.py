
from fastapi import APIRouter, File, UploadFile, Header, HTTPException, Body, Request
from docx import Document
import PyPDF2
import os
from config import get_gemini_api_key
import google.generativeai as genai
import json
import uuid
from datetime import datetime, timezone
from schemas.response import RestResponse
from schemas.contract_summary import ContractSummary, ContractSummaryResponse
from bs4 import BeautifulSoup
from pptx import Presentation
from openpyxl import load_workbook
from striprtf.striprtf import rtf_to_text
import csv

router = APIRouter(prefix="/api/v1/ai-processing-service")

RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)


def read_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs if para.text])

def read_pdf(file_path: str) -> str:
    text = ""
    with open(file_path, "rb") as f:
        pdf_reader = PyPDF2.PdfReader(f)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    return text


def ask_gemini(api_key: str, content: str, question: str) -> str:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = f"Nội dung tài liệu:\n{content}\n\nCâu hỏi: {question}"
    response = model.generate_content(prompt)
    return response.text


# API 1: EXTRACT (doc, pdf)
@router.post("/extract", summary="Trích xuất toàn bộ nội dung file (doc/pdf)", tags=["AI Processing Service"])
async def extract_api(
    request: Request,
    file: UploadFile = File(..., description="File hợp đồng (docx, pdf)"),
    gemini_api_key: str = Header(None, description="Gemini API Key (tùy chọn)")
):
    """
    🔹 Đầu vào
    
    📄 file (bắt buộc, body)
    Loại: UploadFile (DOCX hoặc PDF)
    Mô tả: Tệp hợp đồng cần trích xuất toàn bộ nội dung văn bản.
    
    🔑 gemini_api_key (tùy chọn, header)
    Loại: string
    Mô tả: API key để gọi Gemini AI. Nếu không cung cấp, sẽ sử dụng key từ biến môi trường.
    
    🔹 Đầu ra
    
    📝 data
    Loại: string
    Mô tả: Chuỗi văn bản chứa toàn bộ nội dung được trích xuất từ file (không qua AI xử lý).
    
    📊 apiVersion
    Loại: string
    Mô tả: Phiên bản API (v1).
    
    🔢 statusCode
    Loại: integer
    Mô tả: Mã trạng thái HTTP (200: thành công, 400: lỗi đầu vào, 204: không có nội dung, 500: lỗi server).
    
    📋 shortMessage
    Loại: string
    Mô tả: Thông báo ngắn gọn về kết quả.
    
    📖 description
    Loại: string
    Mô tả: Mô tả chi tiết về kết quả xử lý.
    
    🕒 timestamp
    Loại: string (ISO-8601)
    Mô tả: Thời gian xử lý yêu cầu.
    
    🆔 requestId
    Loại: string (UUID)
    Mô tả: Định danh duy nhất của yêu cầu.
    
    🛣️ path
    Loại: string
    Mô tả: Đường dẫn API được gọi.
    """
    # Extract API logic
    temp_path = os.path.join(RESULTS_DIR, file.filename)
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    if file.filename.endswith(".docx"):
        content = read_docx(temp_path)
    elif file.filename.endswith(".pdf"):
        content = read_pdf(temp_path)
    else:
        os.remove(temp_path)
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file docx hoặc pdf.")
    
    os.remove(temp_path)
    if not content.strip():
        raise HTTPException(status_code=204, detail="Không có nội dung văn bản để gửi cho AI.")
    
    # Trích xuất toàn bộ nội dung file (không cần AI)
    extracted_content = content.strip()
    
    if not extracted_content:
        return RestResponse(
            statusCode=204,
            shortMessage="No Content",
            description="File không chứa nội dung văn bản.",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
    
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Trích xuất toàn bộ nội dung file thành công.",
        data=extracted_content,
        path=request.url.path,
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )





# API 4: CLASSIFY (nhận diện loại tài liệu: hợp đồng, đề cương, giáo trình, sách giáo khoa, ...)
@router.post("/classify", summary="Phân loại loại tài liệu (file đa định dạng hoặc text)", tags=["AI Processing Service"])
async def classify_api(
    request: Request,
    file: UploadFile = File(None, description="File cần phân loại (txt, md, html, json, csv, xlsx, pptx, rtf, docx, pdf)"),
    text: str = Body(None, description="Nội dung văn bản dạng chuỗi"),
    gemini_api_key: str = Header(None, description="Gemini API Key (tùy chọn)")
):
    """
    🔹 Đầu vào
    
    📄 file (tùy chọn, body)
    Loại: UploadFile (txt, md, html, json, csv, xlsx, pptx, rtf, docx, pdf)
    Mô tả: Tệp cần phân loại. Cung cấp file HOẶC text.
    
    📝 text (tùy chọn, body)
    Loại: string
    Mô tả: Nội dung văn bản dạng chuỗi cần phân loại. Cung cấp file HOẶC text.
    
    🔑 gemini_api_key (tùy chọn, header)
    Loại: string
    Mô tả: API key để gọi Gemini AI. Nếu không cung cấp, sẽ sử dụng key từ biến môi trường.
    
    🔹 Đầu ra
    
    📝 data
    Loại: object
    Mô tả: JSON kết quả phân loại gồm: documentType, isContract, confidence, reasons, contractSubtype (nếu có).
    """
    # Chuẩn hóa nội dung đầu vào như summarize
    content = None
    if file:
        temp_path = os.path.join(RESULTS_DIR, file.filename)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        filename_lower = file.filename.lower()
        try:
            if filename_lower.endswith(".txt") or filename_lower.endswith(".md"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as tf:
                    content = tf.read()
            elif filename_lower.endswith(".html") or filename_lower.endswith(".htm"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as hf:
                    html = hf.read()
                    content = BeautifulSoup(html, "html.parser").get_text(separator="\n")
            elif filename_lower.endswith(".json"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as jf:
                    try:
                        obj = json.load(jf)
                        content = json.dumps(obj, ensure_ascii=False, indent=2)
                    except Exception:
                        jf.seek(0)
                        content = jf.read()
            elif filename_lower.endswith(".csv"):
                lines = []
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as cf:
                    reader = csv.reader(cf)
                    for row in reader:
                        lines.append(", ".join([str(col) for col in row]))
                content = "\n".join(lines)
            elif filename_lower.endswith(".xlsx"):
                wb = load_workbook(temp_path, data_only=True)
                texts = []
                for ws in wb.worksheets:
                    for row in ws.iter_rows(values_only=True):
                        row_vals = [str(cell) for cell in row if cell is not None]
                        if row_vals:
                            texts.append(" \t ".join(row_vals))
                content = "\n".join(texts)
            elif filename_lower.endswith(".pptx"):
                prs = Presentation(temp_path)
                texts = []
                for slide in prs.slides:
                    for shape in slide.shapes:
                        if hasattr(shape, "has_text_frame") and shape.has_text_frame:
                            for paragraph in shape.text_frame.paragraphs:
                                texts.append("".join([run.text for run in paragraph.runs]))
                content = "\n".join([t for t in texts if t and t.strip()])
            elif filename_lower.endswith(".rtf"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as rf:
                    content = rtf_to_text(rf.read())
            elif filename_lower.endswith(".docx"):
                content = read_docx(temp_path)
            elif filename_lower.endswith(".pdf"):
                content = read_pdf(temp_path)
            else:
                raise HTTPException(status_code=400, detail="Định dạng file không được hỗ trợ cho classify.")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    elif text:
        content = text
    else:
        raise HTTPException(status_code=400, detail="Cần cung cấp file hoặc text để phân loại.")

    if not content or not content.strip():
        raise HTTPException(status_code=204, detail="Không có nội dung để gửi cho AI.")

    api_key = gemini_api_key or get_gemini_api_key()

    try:
        categories = [
            "contract", "syllabus", "curriculum", "textbook", "lecture_notes", "assignment",
            "research_paper", "invoice", "receipt", "policy", "manual", "letter", "report", "other"
        ]
        prompt = (
            "Hãy phân loại loại tài liệu dưới đây. Chỉ trả về JSON hợp lệ với cấu trúc:\n"
            "{\n"
            "  \"documentType\": string, // một trong: contract, syllabus, curriculum, textbook, lecture_notes, assignment, research_paper, invoice, receipt, policy, manual, letter, report, other\n"
            "  \"isContract\": boolean,\n"
            "  \"contractSubtype\": string|null, // ví dụ: Service Agreement, NDA, Sales Contract ... nếu là hợp đồng\n"
            "  \"confidence\": number, // 0..1\n"
            "  \"reasons\": [string] // 2-5 gợi ý lý do\n"
            "}\n\n"
            "Yêu cầu: Không giải thích thêm, không kèm markdown, chỉ JSON.\n"
            "Danh mục hợp lệ: " + ", ".join(categories) + "\n\n"
            "Nội dung tài liệu:\n" + content[:8000]
        )

        answer = ask_gemini(api_key, content, prompt)

        cleaned = answer.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]

        data_out = None
        try:
            parsed = json.loads(cleaned)
            # Hậu kiểm tối thiểu
            if isinstance(parsed, dict):
                doc_type = parsed.get("documentType", "other")
                is_contract = parsed.get("isContract", False)
                confidence = parsed.get("confidence", 0.0)
                reasons = parsed.get("reasons", [])
                subtype = parsed.get("contractSubtype")
                data_out = {
                    "documentType": doc_type,
                    "isContract": bool(is_contract),
                    "confidence": float(confidence),
                    "reasons": reasons if isinstance(reasons, list) else [],
                    "contractSubtype": subtype if (is_contract and isinstance(subtype, str)) else None
                }
            else:
                data_out = parsed
        except Exception:
            # Nếu không parse được JSON, trả về text gốc để debug
            data_out = {"documentType": "other", "isContract": False, "confidence": 0.0, "reasons": [answer]}

        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Phân loại tài liệu thành công.",
            data=data_out,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )

    except Exception as e:
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi xảy ra khi gọi AI classify: {e}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )


# API 3: SUMMARIZE (đa định dạng văn bản hoặc chuỗi)
@router.post("/summarize", summary="Tóm tắt hợp đồng (nhiều định dạng văn bản hoặc chuỗi)", tags=["AI Processing Service"])
async def summarize_api(
    request: Request,
    file: UploadFile = File(None, description="File văn bản cần tóm tắt (txt, md, html, json, csv, xlsx, pptx, rtf, docx, pdf)"),
    text: str = Body(None, description="Nội dung văn bản dạng chuỗi"),
    gemini_api_key: str = Header(None, description="Gemini API Key (tùy chọn)")
):
    """
    🔹 Đầu vào
    
    📄 file (tùy chọn, body)
    Loại: UploadFile (txt, md, html, json, csv, xlsx, pptx, rtf, docx, pdf)
    Mô tả: Tệp văn bản cần tóm tắt. Chỉ cần cung cấp file HOẶC text, không cần cả hai.
    
    📝 text (tùy chọn, body)
    Loại: string
    Mô tả: Nội dung văn bản dạng chuỗi cần tóm tắt. Chỉ cần cung cấp file HOẶC text, không cần cả hai.
    
    🔑 gemini_api_key (tùy chọn, header)
    Loại: string
    Mô tả: API key để gọi Gemini AI. Nếu không cung cấp, sẽ sử dụng key từ biến môi trường.
    
    🔹 Đầu ra
    
    📝 data
    Loại: object hoặc string
    Mô tả: Nếu AI trả về JSON hợp lệ, data sẽ là object chứa các trường tóm tắt hợp đồng (title, parties, object, effective_date, ...). Nếu không parse được JSON, data sẽ là chuỗi text.
    
    📊 apiVersion
    Loại: string
    Mô tả: Phiên bản API (v1).
    
    🔢 statusCode
    Loại: integer
    Mô tả: Mã trạng thái HTTP (200: thành công, 400: lỗi đầu vào, 204: không có nội dung, 500: lỗi server).
    
    📋 shortMessage
    Loại: string
    Mô tả: Thông báo ngắn gọn về kết quả.
    
    📖 description
    Loại: string
    Mô tả: Mô tả chi tiết về kết quả xử lý.
    
    🕒 timestamp
    Loại: string (ISO-8601)
    Mô tả: Thời gian xử lý yêu cầu.
    
    🆔 requestId
    Loại: string (UUID)
    Mô tả: Định danh duy nhất của yêu cầu.
    
    🛣️ path
    Loại: string
    Mô tả: Đường dẫn API được gọi.
    """
    # Summarize API logic
    content = None
    if file:
        temp_path = os.path.join(RESULTS_DIR, file.filename)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        filename_lower = file.filename.lower()
        try:
            if filename_lower.endswith(".txt") or filename_lower.endswith(".md"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as tf:
                    content = tf.read()
            elif filename_lower.endswith(".html") or filename_lower.endswith(".htm"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as hf:
                    html = hf.read()
                    content = BeautifulSoup(html, "html.parser").get_text(separator="\n")
            elif filename_lower.endswith(".json"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as jf:
                    try:
                        obj = json.load(jf)
                        content = json.dumps(obj, ensure_ascii=False, indent=2)
                    except Exception:
                        jf.seek(0)
                        content = jf.read()
            elif filename_lower.endswith(".csv"):
                lines = []
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as cf:
                    reader = csv.reader(cf)
                    for row in reader:
                        lines.append(", ".join([str(col) for col in row]))
                content = "\n".join(lines)
            elif filename_lower.endswith(".xlsx"):
                wb = load_workbook(temp_path, data_only=True)
                texts = []
                for ws in wb.worksheets:
                    for row in ws.iter_rows(values_only=True):
                        row_vals = [str(cell) for cell in row if cell is not None]
                        if row_vals:
                            texts.append(" \t ".join(row_vals))
                content = "\n".join(texts)
            elif filename_lower.endswith(".pptx"):
                prs = Presentation(temp_path)
                texts = []
                for slide in prs.slides:
                    for shape in slide.shapes:
                        if hasattr(shape, "has_text_frame") and shape.has_text_frame:
                            for paragraph in shape.text_frame.paragraphs:
                                texts.append("".join([run.text for run in paragraph.runs]))
                content = "\n".join([t for t in texts if t and t.strip()])
            elif filename_lower.endswith(".rtf"):
                with open(temp_path, "r", encoding="utf-8", errors="ignore") as rf:
                    content = rtf_to_text(rf.read())
            elif filename_lower.endswith(".docx"):
                content = read_docx(temp_path)
            elif filename_lower.endswith(".pdf"):
                content = read_pdf(temp_path)
            else:
                raise HTTPException(status_code=400, detail="Định dạng file không được hỗ trợ cho summarize.")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    elif text:
        content = text
    else:
        raise HTTPException(status_code=400, detail="Cần cung cấp file hợp lệ (txt, md, html, json, csv, xlsx, pptx, rtf, docx, pdf) hoặc nội dung chuỗi.")
    
    if not content or not content.strip():
        raise HTTPException(status_code=204, detail="Không có nội dung để gửi cho AI.")
    api_key = gemini_api_key or get_gemini_api_key()
    try:
        prompt = (
            "Hãy phân tích và tóm tắt hợp đồng dưới đây thành một JSON với cấu trúc như sau: "
            '{\n'
            '  "id": "string",\n'
            '  "contractNumber": "string",\n'
            '  "status": "string",\n'
            '  "contractType": "string",\n'
            '  "title": "string",\n'
            '  "tag": ["string"],\n'
            '  "parties": [\n'
            '    {"role": "string", "name": "string", "representative": "string", "taxCode": "string", "contact": "string", "address": "string", "businessLicense": "string"}, ...\n'
            '  ],\n'
            '  "object": "string",\n'
            '  "effectiveDate": "string (ISO 8601)",\n'
            '  "term": "string",\n'
            '  "paymentDetails": {"totalValue": "number", "schedule": "string", "currency": "string", "paymentMethod": "string},\n'
            '  "keyClauses": [\n'
            '    {"name": "string", "description": "string", "source": "string}, ...\n'
            '  ],\n'
            '  "favorableClauses": [\n'
            '    {"clauseName": "string", "description": "string", "benefitTo": "string}, ...\n'
            '  ],\n'
            '  "unfavorableClauses": [\n'
            '    {"clauseName": "string", "description": "string", "riskTo": "string}, ...\n'
            '  ],\n'
            '  "reminders": [\n'
            '    {"type": "string", "date": "string (ISO 8601)", "content": "string}, ...\n'
            '  ],\n'
            '  "terminationConditions": "string",\n'
            '  "riskAssessment": {\n'
            '    "riskLevel": "LOW|MEDIUM|HIGH",\n'
            '      "riskFactors": ["string"],\n'
            '      "mitigationMeasures": ["string"]\n'
            '  },\n'
            '  "complianceStatus": {\n'
            '    "status": "COMPLIANT|NON_COMPLIANT|REVIEW_REQUIRED",\n'
            '      "issues": ["string"],\n'
            '      "recommendations": ["string"]\n'
            '  }\n'
            '}'
            "\nYêu cầu:\n"
            "1. Chỉ trả về đúng JSON hợp lệ, không giải thích thêm\n"
            "2. Nếu không thể tóm tắt được thông tin hợp lệ, hãy trả về 'KHÔNG_THỂ_TÓM_TẮT'\n"
            "3. Lưu ý: reminders chỉ có ngày nhắc nhở là ngày cụ thể (ISO 8601), nếu không có ngày cụ thể thì để date=null\n"
            "4. Điền thông tin dựa trên nội dung hợp đồng, nếu không có thông tin thì để null hoặc mảng rỗng\n"
            "5. Sử dụng camelCase cho tất cả các key\n"
            "6. totalValue phải là số (number), không phải chuỗi\n"
            "7. effectiveDate và reminders.date phải theo định dạng ISO 8601 (yyyy-MM-ddTHH:mm:ssZ)\n"
            "8. Thứ tự các trường trong parties: role trước, name sau\n"
            "9. Tạo ID và contractNumber ngẫu nhiên\n\n"
            "Dưới đây là nội dung hợp đồng:"
        )
        answer = ask_gemini(api_key, content, prompt)
        
        # Kiểm tra xem AI có trả về thông báo lỗi không
        error_indicators = [
            "tôi xin lỗi",
            "tôi không thể",
            "không thể tóm tắt",
            "không thể xử lý",
            "không có đủ thông tin",
            "cần thêm thông tin",
            "không thể phân tích",
            "không thể đọc",
            "lỗi",
            "error",
            "không_thể_tóm_tắt",
            "không có thông tin",
            "không phải là hợp đồng",
            "không phải hợp đồng",
            "không thể tìm thấy",
            "không có dữ liệu"
        ]
        
        answer_lower = answer.lower()
        is_error_response = any(indicator in answer_lower for indicator in error_indicators)
        
        if is_error_response:
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description="AI không thể tóm tắt thông tin từ tài liệu này. Có thể do định dạng không hỗ trợ hoặc nội dung không phù hợp.",
                data=answer,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
        # Loại bỏ các ký tự đặc biệt, markdown, ...
        cleaned = answer.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.replace('\n', '').replace('\r', '').replace('\\', '')
        
        data_out = answer  # Mặc định trả về text gốc
        
        try:
            summary_json = json.loads(cleaned)
            # Nếu có contract_summary thì chỉ lấy các trường con ra ngoài data
            if isinstance(summary_json, dict) and 'contract_summary' in summary_json:
                data_out = summary_json['contract_summary']
                # Xử lý reminders: nếu không có ngày hợp lệ thì để null
                if 'reminders' in data_out and isinstance(data_out['reminders'], list):
                    # Đầu tiên set date = None nếu không hợp lệ
                    for r in data_out['reminders']:
                        date_val = r.get('date')
                        if not date_val or not isinstance(date_val, str) or not date_val.strip():
                            r['date'] = None
                    # Sau đó loại bỏ reminders có date == None
                    data_out['reminders'] = [r for r in data_out['reminders'] if r.get('date') is not None]
            else:
                data_out = summary_json
        except Exception as parse_error:
            # Nếu không parse được JSON, vẫn trả về text gốc
            data_out = answer
            print(f"Warning: Không thể parse JSON từ AI response: {parse_error}")
            
    except Exception as e:
        # Xử lý lỗi từ Gemini AI
        error_message = f"Lỗi AI/Summarize: {str(e)}"
        print(f"Error in summarize_api: {error_message}")
        
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description="Lỗi xảy ra khi gọi AI service. Vui lòng thử lại sau.",
            data={"error": error_message, "raw_content": content[:200] + "..." if len(content) > 200 else content},
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
    
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Tóm tắt hợp đồng thành công.",
        data=data_out,
        path=request.url.path,
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )


# API Test: Kiểm tra GEMINI_API_KEY
@router.get("/test/get-geminiapikey", summary="Kiểm tra GEMINI_API_KEY mà hệ thống đọc được", tags=["Test"])
async def test_gemini_api_key_api(request: Request):
    """
    🔹 Đầu vào
    
    Không có tham số đầu vào.
    
    🔹 Đầu ra
    
    📝 data
    Loại: object
    Mô tả: Thông tin về GEMINI_API_KEY và trạng thái hệ thống.
    
    📊 apiVersion
    Loại: string
    Mô tả: Phiên bản API (v1).
    
    🔢 statusCode
    Loại: integer
    Mô tả: Mã trạng thái HTTP (200: thành công, 500: lỗi server).
    
    📋 shortMessage
    Loại: string
    Mô tả: Thông báo ngắn gọn về kết quả.
    
    📖 description
    Loại: string
    Mô tả: Mô tả chi tiết về kết quả kiểm tra.
    
    🕒 timestamp
    Loại: string (ISO-8601)
    Mô tả: Thời gian xử lý yêu cầu.
    
    🆔 requestId
    Loại: string (UUID)
    Mô tả: Định danh duy nhất của yêu cầu.
    
    🛣️ path
    Loại: string
    Mô tả: Đường dẫn API được gọi.
    """
    try:
        # Lấy GEMINI_API_KEY từ biến môi trường
        api_key = os.getenv("GEMINI_API_KEY")
        
        # Kiểm tra các biến môi trường khác
        kafka_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        kafka_file_topic = os.getenv("KAFKA_FILE_EVENTS_TOPIC", "file.events")
        kafka_ai_topic = os.getenv("KAFKA_AI_EVENTS_TOPIC", "ai.events")
        
        # Tạo response data
        test_data = {
            "geminiApiKey": {
                "exists": api_key is not None,
                "length": len(api_key) if api_key else 0,
                "masked": f"{api_key[:8]}...{api_key[-4:]}" if api_key and len(api_key) > 12 else "N/A" if not api_key else api_key,
                "status": "CONFIGURED" if api_key else "NOT_CONFIGURED"
            },
            "environment": {
                "kafkaBootstrapServers": kafka_servers,
                "kafkaFileEventsTopic": kafka_file_topic,
                "kafkaAiEventsTopic": kafka_ai_topic,
                "host": os.getenv("HOST", "0.0.0.0"),
                "port": os.getenv("PORT", "8017"),
                "debug": os.getenv("DEBUG", "false")
            },
            "systemInfo": {
                "pythonPath": os.getcwd(),
                "envFiles": {
                    "dotenvLoaded": True,
                    "envLocalExists": os.path.exists(".env.local"),
                    "envExampleExists": os.path.exists("env_exmaple.txt")
                }
            }
        }
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Kiểm tra GEMINI_API_KEY thành công",
            data=test_data,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )
        
    except Exception as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi kiểm tra GEMINI_API_KEY: {str(e)}",
            data=None,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )


