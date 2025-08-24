
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
@router.post("/extract", summary="Trích xuất thông tin hợp đồng (doc/pdf)", tags=["AI Processing Service"])
async def extract_api(
    request: Request,
    file: UploadFile = File(..., description="File hợp đồng (docx, pdf)"),
    gemini_api_key: str = Header(None, description="Gemini API Key (tùy chọn)")
):
    """
    🔹 Đầu vào
    
    📄 file (bắt buộc, body)
    Loại: UploadFile (DOCX hoặc PDF)
    Mô tả: Tệp hợp đồng cần phân tích và trích xuất thông tin.
    
    🔑 gemini_api_key (tùy chọn, header)
    Loại: string
    Mô tả: API key để gọi Gemini AI. Nếu không cung cấp, sẽ sử dụng key từ biến môi trường.
    
    🔹 Đầu ra
    
    📝 data
    Loại: string
    Mô tả: Chuỗi văn bản chứa các điều khoản chính của hợp đồng (do AI sinh ra).
    
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
    
    api_key = gemini_api_key or get_gemini_api_key()
    try:
        prompt = """Hãy phân tích và trích xuất các điều khoản chính của hợp đồng dưới đây. 

Yêu cầu:
1. Chỉ trả về nội dung trích xuất, không giải thích thêm
2. Nếu không thể trích xuất được thông tin hợp lệ, hãy trả về "KHÔNG_THỂ_TRÍCH_XUẤT"
3. Tập trung vào các điều khoản quan trọng như: đối tượng hợp đồng, thời hạn, giá trị, điều kiện thanh toán, quyền và nghĩa vụ các bên, điều kiện chấm dứt

Nội dung hợp đồng:"""
        answer = ask_gemini(api_key, content, prompt)
        
        # Kiểm tra xem AI có trả về thông báo lỗi không
        error_indicators = [
            "tôi xin lỗi",
            "tôi không thể",
            "không thể trích xuất",
            "không thể xử lý",
            "không có đủ thông tin",
            "cần thêm thông tin",
            "không thể phân tích",
            "không thể đọc",
            "lỗi",
            "error",
            "không_thể_trích_xuất",
            "không có điều khoản",
            "không phải là hợp đồng",
            "không phải hợp đồng",
            "không có thông tin",
            "không thể tìm thấy",
            "không có dữ liệu"
        ]
        
        answer_lower = answer.lower()
        is_error_response = any(indicator in answer_lower for indicator in error_indicators)
        
        if is_error_response:
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description="AI không thể trích xuất thông tin từ tài liệu này. Có thể do định dạng không hỗ trợ hoặc nội dung không phù hợp.",
                data=answer,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
    except Exception as e:
        # Xử lý lỗi từ Gemini AI
        error_message = f"Lỗi AI/Extract: {str(e)}"
        print(f"Error in extract_api: {error_message}")
        
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
        description="Trích xuất điều khoản thành công.",
        data=answer,
        path=request.url.path,
        timestamp=datetime.now(),
        requestId=str(uuid.uuid4())
    )






# API 3: SUMMARIZE (txt, string input)
@router.post("/summarize", summary="Tóm tắt hợp đồng (txt/string)", tags=["AI Processing Service"])
async def summarize_api(
    request: Request,
    file: UploadFile = File(None, description="File txt cần tóm tắt"),
    text: str = Body(None, description="Nội dung văn bản dạng chuỗi (txt)"),
    gemini_api_key: str = Header(None, description="Gemini API Key (tùy chọn)")
):
    """
    🔹 Đầu vào
    
    📄 file (tùy chọn, body)
    Loại: UploadFile (TXT)
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
    print(f"DEBUG: file={file}, text={text}")
    content = None
    if file:
        temp_path = os.path.join(RESULTS_DIR, file.filename)
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        if file.filename.endswith(".txt"):
            with open(temp_path, "r", encoding="utf-8") as tf:
                content = tf.read()
        else:
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file txt hoặc chuỗi văn bản.")
        os.remove(temp_path)
    elif text:
        content = text
    else:
        raise HTTPException(status_code=400, detail="Cần cung cấp file txt hoặc nội dung chuỗi.")
    
    if not content or not content.strip():
        raise HTTPException(status_code=204, detail="Không có nội dung để gửi cho AI.")
    api_key = gemini_api_key or get_gemini_api_key()
    try:
        prompt = (
            "Hãy phân tích và tóm tắt hợp đồng dưới đây thành một JSON với cấu trúc như sau: "
            '{\n'
            '  "contract_summary": {\n'
            '    "title": string,\n'
            '    "tag": string hoặc mảng string,\n'
            '    "parties": [\n'
            '      {"name": string, "role": string, "representative": string, "tax_code": string, "contact": string}, ...\n'
            '    ],\n'
            '    "object": string,\n'
            '    "effective_date": string,\n'
            '    "term": string,\n'
            '    "payment_details": {"total_value": string, "schedule": string, "currency": string},\n'
            '    "key_clauses": [\n'
            '      {"name": string, "description": string, "source": string}, ...\n'
            '    ],\n'
            '    "favorable_clauses": [\n'
            '      {"clause_name": string, "description": string, "benefit_to": string}, ...\n'
            '    ],\n'
            '    "unfavorable_clauses": [\n'
            '      {"clause_name": string, "description": string, "risk_to": string}, ...\n'
            '    ],\n'
            '    "reminders": [\n'
            '      {"type": "gia hạn|xem xét|hết hạn", "date": "yyyy-MM-dd hoặc null", "content": string}, ...\n'
            '    ],\n'
            '    "termination_conditions": string\n'
            '  }\n'
            '}'
            "\nYêu cầu:\n"
            "1. Chỉ trả về đúng JSON hợp lệ, không giải thích thêm\n"
            "2. Nếu không thể tóm tắt được thông tin hợp lệ, hãy trả về 'KHÔNG_THỂ_TÓM_TẮT'\n"
            "3. Lưu ý: reminders chỉ có ngày nhắc nhở là ngày cụ thể (yyyy-MM-dd), nếu không có ngày cụ thể thì để date=null\n"
            "4. Điền thông tin dựa trên nội dung hợp đồng, nếu không có thông tin thì để null hoặc mảng rỗng\n\n"
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


