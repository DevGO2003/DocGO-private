from fastapi import APIRouter, File, UploadFile, Header, HTTPException, Body, Request, Query, Form, WebSocket, WebSocketDisconnect
import logging
import asyncio

# Setup logger
logger = logging.getLogger(__name__)
import aiohttp
from docx import Document
import PyPDF2
import os
from config import Config
import os
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
from services.ai_processing_service import AutomationService
from services.document_processor import DocumentProcessor
from services.file_service import FileStorageService

# Initialize document processor
document_processor = DocumentProcessor()
# from services.notification_service import NotificationService
from services.batch_service import BatchService
from services.event_service import EventService
# from schemas.notification_schemas import (
#     NotificationRequest, NotificationHistoryRequest, NotificationTemplate,
#     EmailNotificationRequest, SMSNotificationRequest, PushNotificationRequest,
#     WebSocketNotificationRequest
# )
from schemas.batch_schemas import (
    BatchJobRequest, BatchJobStatusRequest, BatchJobListRequest,
    BatchJobCancelRequest, BatchJobRetryRequest, BatchProcessingRequest,
    BatchProcessingResponse
)
from schemas.event_schemas import (
    EventHandlerRequest, EventSubscriptionRequest, EventPublishRequest,
    EventHistoryRequest, EventHandlerResponse
)
from schemas.view_schemas import ViewType, ViewMapper, PaginatedViewResponse

router = APIRouter(prefix="/api/v1/automation-service")
@router.post("/documents/upload", summary="Upload tài liệu (hybrid sync/async)", tags=["📁 APIs Quản lý File"])
async def upload_document_api(
    request: Request,
    file: UploadFile = File(...),
    folder: str = Query("documents"),
    user_id: str = Query("system")
):
    from schemas.response import RestResponse
    from datetime import datetime
    import uuid
    from pathlib import Path
    from services.document_processor import DocumentProcessor

    try:
        # Dùng FileStorageService để lưu file (local + S3 nếu bật)
        fs_service = FileStorageService()
        # FastAPI UploadFile cần reset lại pointer nếu đã đọc trước đó
        # đảm bảo đọc nội dung trong service
        upload_result = fs_service.upload_file(file, folder, user_id)
        size = upload_result.file_size
        document_id = str(uuid.uuid4())

        # Nếu nhỏ hơn hoặc bằng ngưỡng → xử lý sync
        if size <= Config.MAX_SYNC_SIZE:
            processor = DocumentProcessor()
            
            # OCR extraction
            ocr_text = ""
            try:
                # Read file content from upload
                file_content = await file.read()
                await file.seek(0)  # Reset file pointer
                
                # Extract text from file content
                if file.filename.lower().endswith('.pdf'):
                    ocr_text = processor.extract_text_from_pdf(file_content)
                elif file.filename.lower().endswith('.docx'):
                    ocr_text = processor.extract_text_from_docx(file_content)
                elif file.filename.lower().endswith('.txt'):
                    ocr_text = file_content.decode('utf-8')
            except Exception as e:
                logger.warning(f"OCR extraction failed for {file.filename}: {e}")
                ocr_text = ""

            # AI Classification
            classification_result = {}
            try:
                from services.ai_processing_service import AutomationService
                ai_service = AutomationService()
                classification_result = ai_service.classify_document(ocr_text or upload_result.s3_key, file.filename)
            except Exception as e:
                logger.warning(f"AI Classification failed for {file.filename}: {e}")
                classification_result = {"documentType": "other", "isContract": False, "confidence": 0.0, "reasons": ["Classification failed"]}

            # AI Summarization (nếu là contract)
            summary_result = None
            if classification_result.get("isContract", False):
                try:
                    from services.ai_processing_service import AutomationService
                    ai_service = AutomationService()
                    summary_result = ai_service.summarize_contract(ocr_text or upload_result.s3_key, file.filename)
                except Exception as e:
                    logger.warning(f"AI Summarization failed for {file.filename}: {e}")
                    summary_result = None

            # Suy luận extension, category, contractMetadata theo chuẩn mới
            filename_lower = file.filename.lower()
            extension = filename_lower.split('.')[-1] if '.' in filename_lower else None
            category = "HOP_DONG_CHUNG" if classification_result.get("isContract", False) else "TAI_LIEU_CHUNG"
            contract_metadata = None
            if summary_result and isinstance(summary_result, dict):
                eff = summary_result.get("effectiveDate")
                exp = summary_result.get("expiryDate")
                total = summary_result.get("paymentDetails", {}).get("totalValue") if isinstance(summary_result.get("paymentDetails"), dict) else summary_result.get("totalValue")
                try:
                    total_num = float(total) if total is not None and not isinstance(total, (int, float)) else total
                except Exception:
                    total_num = None
                curr = summary_result.get("paymentDetails", {}).get("currency") if isinstance(summary_result.get("paymentDetails"), dict) else summary_result.get("currency")
                contract_metadata = {
                    "effectiveDate": eff,
                    "expiryDate": exp,
                    "totalValue": total_num,
                    "currency": curr
                }

            # Gọi Document Service tạo record với đầy đủ AI results
            ds_url = Config.get_document_service_url() + "/api/v1/document-management-service/documents"
            payload = {
                "fileName": file.filename,
                "fileSize": size,
                "fileType": file.content_type,
                "extension": extension,
                "category": category,
                "documentType": file.content_type,
                "fileUrl": upload_result.file_url,
                "fileId": upload_result.file_id,
                "processingStatus": "COMPLETED",
                "ocrText": ocr_text,
                "classificationResult": classification_result,
                "summaryResult": summary_result,
                "contractMetadata": contract_metadata
            }
            async with aiohttp.ClientSession() as session:
                async def _post_json():
                    async with session.post(ds_url, json=payload) as resp:
                        data = await resp.json()
                        return data
                ds_resp = await _post_json()

            return RestResponse(
                statusCode=201,
                shortMessage="Created",
                description="Upload và xử lý đồng bộ thành công",
                data={
                    "documentId": ds_resp.get("data", {}).get("id") or ds_resp.get("data", {}).get("_id"),
                    "fileUrl": upload_result.file_url,
                    "ocrText": ocr_text,
                    "classificationResult": classification_result,
                    "summaryResult": summary_result,
                    "processingStatus": "COMPLETED"
                },
                path=str(request.url.path),
                timestamp=datetime.now(),
                requestId=document_id
            )

        # Ngược lại → trả 202 và xử lý nền với progress tracking thật
        # Read file content trước khi upload
        file_content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        async def background_pipeline(doc_id: str, file_content: bytes):
            from services.websocket_manager import websocket_manager
            
            try:
                # Stage 1: Saving document (20%)
                await websocket_manager.broadcast_progress(doc_id, 20, "saving_document", "Đang lưu tài liệu...")
                await asyncio.sleep(0.5)
                
                # Stage 2: Uploading to storage (40%)
                await websocket_manager.broadcast_progress(doc_id, 40, "uploading_to_storage", "Đang tải lên storage...")
                await asyncio.sleep(0.5)
                
                # Stage 3: OCR extraction (60%)
                await websocket_manager.broadcast_progress(doc_id, 60, "ocr_extracting", "Đang trích xuất văn bản...")
                ocr_text = ""
                try:
                    processor = DocumentProcessor()
                    if file.filename.lower().endswith('.pdf'):
                        ocr_text = processor.extract_text_from_pdf(file_content)
                    elif file.filename.lower().endswith('.docx'):
                        ocr_text = processor.extract_text_from_docx(file_content)
                    elif file.filename.lower().endswith('.txt'):
                        ocr_text = file_content.decode('utf-8')
                except Exception as e:
                    logger.warning(f"OCR extraction failed for {file.filename}: {e}")
                    ocr_text = ""
                
                # Stage 4: AI Classification (75%)
                await websocket_manager.broadcast_progress(doc_id, 75, "ai_classifying", "Đang phân loại tài liệu...")
                classification_result = {}
                try:
                    from services.ai_processing_service import AutomationService
                    ai_service = AutomationService()
                    classification_result = ai_service.classify_document(ocr_text or file_content.decode('utf-8'), file.filename)
                except Exception as e:
                    logger.warning(f"AI Classification failed for {file.filename}: {e}")
                    classification_result = {"documentType": "other", "isContract": False, "confidence": 0.0, "reasons": ["Classification failed"]}
                
                # Stage 5: AI Summarization (nếu là contract) (90%)
                summary_result = None
                if classification_result.get("isContract", False):
                    await websocket_manager.broadcast_progress(doc_id, 90, "ai_summarizing", "Đang tóm tắt hợp đồng...")
                    try:
                        from services.ai_processing_service import AutomationService
                        ai_service = AutomationService()
                        summary_result = ai_service.summarize_contract(ocr_text or file_content.decode('utf-8'), file.filename)
                    except Exception as e:
                        logger.warning(f"AI Summarization failed for {file.filename}: {e}")
                        summary_result = None
                
                # Stage 6: Processing complete (100%)
                await websocket_manager.broadcast_progress(doc_id, 100, "processing_complete", "Xử lý hoàn tất")
                
                # Update Document Service với kết quả cuối cùng
                ds_put_url = Config.get_document_service_url() + f"/api/v1/document-management-service/documents/{doc_id}/processing-result"
                # Cập nhật thêm category và contractMetadata sau khi có kết quả AI
                category = "HOP_DONG_CHUNG" if classification_result.get("isContract", False) else "TAI_LIEU_CHUNG"
                contract_metadata = None
                if summary_result and isinstance(summary_result, dict):
                    eff = summary_result.get("effectiveDate")
                    exp = summary_result.get("expiryDate")
                    total = summary_result.get("paymentDetails", {}).get("totalValue") if isinstance(summary_result.get("paymentDetails"), dict) else summary_result.get("totalValue")
                    try:
                        total_num = float(total) if total is not None and not isinstance(total, (int, float)) else total
                    except Exception:
                        total_num = None
                    curr = summary_result.get("paymentDetails", {}).get("currency") if isinstance(summary_result.get("paymentDetails"), dict) else summary_result.get("currency")
                    contract_metadata = {
                        "effectiveDate": eff,
                        "expiryDate": exp,
                        "totalValue": total_num,
                        "currency": curr
                    }
                update_payload = {
                    "processingStatus": "COMPLETED",
                    "ocrText": ocr_text,
                    "classificationResult": classification_result,
                    "summaryResult": summary_result,
                    "category": category,
                    "contractMetadata": contract_metadata,
                    "documentType": file.content_type
                }
                async with aiohttp.ClientSession() as session:
                    async with session.put(ds_put_url, json=update_payload) as resp:
                        if resp.status != 200:
                            logger.error(f"Failed to update document service for {doc_id}: {resp.status}")
                
                # Send completion message
                await websocket_manager.send_completion(doc_id, {
                    "ocrText": ocr_text,
                    "classificationResult": classification_result,
                    "summaryResult": summary_result
                })
                
            except Exception as e:
                logger.error(f"Background processing failed for {doc_id}: {e}")
                await websocket_manager.send_error(doc_id, f"Xử lý thất bại: {str(e)}", "PROCESSING_ERROR")

        # Tạo trước bản ghi ở DS với trạng thái PROCESSING
        ds_url = Config.get_document_service_url() + "/api/v1/document-management-service/documents"
        filename_lower = file.filename.lower()
        extension = filename_lower.split('.')[-1] if '.' in filename_lower else None
        create_payload = {
            "fileName": file.filename,
            "fileSize": size,
            "fileType": file.content_type,
            "extension": extension,
            "documentType": file.content_type,
            "processingStatus": "PROCESSING",
            "ocrText": "",
            "classificationResult": {}
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(ds_url, json=create_payload) as resp:
                created = await resp.json()
                created_id = created.get("data", {}).get("id") or created.get("data", {}).get("_id")
        import asyncio
        asyncio.create_task(background_pipeline(created_id, file_content))

        return RestResponse(
            statusCode=202,
            shortMessage="Accepted",
            description="Tệp lớn, đã nhận và đang xử lý nền",
            data={
                "documentId": created_id,
                "fileUrl": upload_result.file_url,
                "processingStatus": "PROCESSING"
            },
            path=str(request.url.path),
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
    except HTTPException as e:
        from schemas.response import RestResponse as RR
        return RR(
            statusCode=e.status_code,
            shortMessage="Error",
            description=e.detail,
            data=None,
            path=str(request.url.path),
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )


@router.websocket("/documents/progress/{document_id}")
async def documents_progress_ws(websocket: WebSocket, document_id: str):
    from services.websocket_manager import websocket_manager
    
    await websocket_manager.connect(websocket, document_id)
    
    try:
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for client messages (ping/pong, etc.)
                message = await websocket.receive_text()
                logger.info(f"Received message from {document_id}: {message}")
                
                # Handle ping/pong or other client messages
                if message == "ping":
                    await websocket.send_text("pong")
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for {document_id}")
                break
            except Exception as e:
                logger.error(f"Error in WebSocket for {document_id}: {e}")
                break
                
    except Exception as e:
        logger.error(f"WebSocket error for {document_id}: {e}")
    finally:
        await websocket_manager.disconnect(websocket, document_id)

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
    # Luôn ép AI trả lời bằng tiếng Việt
    vietnamese_instruction = (
        "YÊU CẦU NGHIÊM NGẶT: Luôn trả lời HOÀN TOÀN bằng TIẾNG VIỆT, không dùng ngôn ngữ khác.\n"
    )
    prompt = f"{vietnamese_instruction}Nội dung tài liệu:\n{content}\n\nYêu cầu/Xử lý: {question}"
    response = model.generate_content(prompt)
    return response.text


# API 1: EXTRACT (doc, pdf)
@router.post("/document/extract", summary="Trích xuất nội dung", tags=["🤖 APIs Xử lý AI"])
async def extract_api(
    request: Request,
    file: UploadFile = File(...),
    gemini_api_key: str = Header(None)
):
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
@router.post("/document/classify", summary="Phân loại tài liệu", tags=["🤖 APIs Xử lý AI"])
async def classify_api(
    request: Request,
    gemini_api_key: str = Header(None)
):
    # Chuẩn hóa nội dung đầu vào như summarize
    content = None
    file = None
    text = None
    
    # Parse request based on content type
    content_type = request.headers.get('content-type', '')
    
    if 'multipart/form-data' in content_type:
        # Handle multipart form data
        form = await request.form()
        file = form.get('file')
        text = form.get('text')
    elif 'application/json' in content_type:
        # Handle JSON request
        try:
            body = await request.json()
            text = body.get('text')
        except Exception as e:
            print(f"[DEBUG] JSON parse error: {e}")
    
    if file:
        temp_path = os.path.join(RESULTS_DIR, file.filename)
        file_content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(file_content)

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
            elif filename_lower.endswith(".doc"):
                try:
                    import textract  # optional dependency, may require system utils (antiword/catdoc)
                    bytes_text = textract.process(temp_path)
                    content = bytes_text.decode('utf-8', errors='ignore')
                except Exception as e:
                    raise HTTPException(status_code=422, detail=f"Không thể đọc file .doc: {str(e)}. Vui lòng cài antiword/catdoc trong môi trường hoặc chuyển sang .docx/.pdf")
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

    api_key = gemini_api_key or Config.get_gemini_api_key()

    try:
        categories = [
            "contract", "syllabus", "curriculum", "textbook", "lecture_notes", "assignment",
            "research_paper", "invoice", "receipt", "policy", "manual", "letter", "report", "other"
        ]
        prompt = (
            "Luôn trả lời HOÀN TOÀN bằng TIẾNG VIỆT.\n"
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
# Endpoint đã được chuyển sang contract_router.py
    # Summarize API logic
    content = None
    file = None
    text = None
    
    # Debug logging để trace request
    print(f"[DEBUG] Request content type: {request.headers.get('content-type', 'unknown')}")
    
    # Parse request based on content type
    content_type = request.headers.get('content-type', '')
    
    if 'multipart/form-data' in content_type:
        # Handle multipart form data
        form = await request.form()
        file = form.get('file')
        text = form.get('text')
        print(f"[DEBUG] Multipart - File: {file}, Text: {text}")
    elif 'application/json' in content_type:
        # Handle JSON request
        try:
            body = await request.json()
            text = body.get('text')
            print(f"[DEBUG] JSON - Text: {text}")
        except Exception as e:
            print(f"[DEBUG] JSON parse error: {e}")
    else:
        print(f"[DEBUG] Unknown content type: {content_type}")
    
    if file:
        print(f"[DEBUG] File filename: {file.filename}")
        print(f"[DEBUG] File content_type: {file.content_type}")
        print(f"[DEBUG] File size: {file.size if hasattr(file, 'size') else 'unknown'}")
    
    if file:
        # Validation file size (max 50MB)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File quá lớn. Kích thước tối đa cho phép: {MAX_FILE_SIZE // (1024*1024)}MB. File hiện tại: {len(file_content) // (1024*1024)}MB"
            )
        
        # Validation content type - chỉ hỗ trợ file hợp đồng
        allowed_content_types = [
            'application/pdf',  # .pdf
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
            'application/msword',  # .doc
            'text/plain',  # .txt
            'text/html'  # .html
        ]
        
        if file.content_type and file.content_type not in allowed_content_types:
            print(f"[DEBUG] Invalid content type: {file.content_type}")
            # Không reject ngay, có thể filename extension sẽ override
        
        temp_path = os.path.join(RESULTS_DIR, file.filename)
        with open(temp_path, "wb") as f:
            f.write(file_content)

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
            elif filename_lower.endswith(".doc"):
                try:
                    import textract
                    bytes_text = textract.process(temp_path)
                    content = bytes_text.decode('utf-8', errors='ignore')
                except Exception as e:
                    raise HTTPException(status_code=422, detail=f"Không thể đọc file .doc: {str(e)}. Vui lòng cài antiword/catdoc trong môi trường hoặc chuyển sang .docx/.pdf")
            elif filename_lower.endswith(".pdf"):
                content = read_pdf(temp_path)
            else:
                raise HTTPException(status_code=400, detail="Định dạng file không được hỗ trợ cho hợp đồng. Chỉ hỗ trợ: PDF, DOCX, DOC, TXT, HTML")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    elif text:
        content = text
    else:
        # Debug thông tin chi tiết về request
        print(f"[DEBUG] No file or text provided. File: {file}, Text: {text}")
        print(f"[DEBUG] Request headers: {dict(request.headers)}")
        print(f"[DEBUG] Request content type: {request.headers.get('content-type', 'unknown')}")
        
        # Cải thiện error message với thông tin debug
        error_detail = "Cần cung cấp file hợp đồng (pdf, docx, doc, txt, html) hoặc nội dung hợp đồng dạng text."
        if file is None and text is None:
            error_detail += " Không có file hoặc text nào được cung cấp."
        elif file is not None:
            error_detail += f" File được cung cấp nhưng có vấn đề: {file.filename if file.filename else 'no filename'}"
        elif text is not None:
            error_detail += f" Text được cung cấp nhưng có vấn đề: {len(text) if text else 0} characters"
            
        raise HTTPException(status_code=400, detail=error_detail)
    
    if not content or not content.strip():
        raise HTTPException(status_code=204, detail="Không có nội dung để gửi cho AI.")
    api_key = gemini_api_key or Config.get_gemini_api_key()
    try:
        prompt = (
            "Luôn trả lời HOÀN TOÀN bằng TIẾNG VIỆT.\n"
            "Hãy phân tích và tóm tắt hợp đồng dưới đây thành một JSON với cấu trúc như sau:\n"
            "QUAN TRỌNG: Nếu không tìm thấy thông tin cụ thể, hãy trả về null thay vì \"Chưa xác định\".\n"
            "CÁC MẢNG favorableClauses, unfavorableClauses, reminders, riskAssessment.riskDetails phải được TRÍCH XUẤT TỪ NỘI DUNG CÓ THẬT, KHÔNG bịa đặt. Mỗi mảng nên có 2-5 mục nếu văn bản có; nếu KHÔNG CÓ, để mảng rỗng.\n"
            "Đảm bảo mỗi điều khoản trong keyClauses, favorableClauses, unfavorableClauses là một object riêng biệt\n"
            "riskFactors và mitigationMeasures phải là danh sách chi tiết từng yếu tố\n\n"
            '{\n'
            '  "contractNumber": "string",\n'
            '  "status": null,\n'
            '  "contractType": "string",\n'
            '  "title": "string",\n'
            '  "tags": ["string"],\n'
            '  "parties": [\n'
            '    {"role": "vai trò thực tế từ hợp đồng", "name": "string", "representative": "string", "taxCode": "string", "contact": "string", "address": "string", "businessLicense": null}\n'
            '  ],\n'
            '  "object": "string",\n'
            '  "effectiveDate": "string (ISO 8601)",\n'
            '  "term": "string",\n'
            '  "paymentDetails": {"totalValue": "string", "schedule": "string", "currency": "string", "paymentMethod": "string"},\n'
            '  "keyClauses": [\n'
            '    {"name": "điều khoản quan trọng", "description": "mô tả nội dung quan trọng ảnh hưởng lớn (quyền/nghĩa vụ/giá/tiến độ/bảo hành/điều kiện thanh toán/chấm dứt)", "source": "điều/số mục trong văn bản"}, ...\n'
            '  ],\n'
            '  "favorableClauses": [\n'
            '    {"clauseName": "string", "description": "string", "benefitTo": "string"}, ...\n'
            '  ],\n'
            '  "unfavorableClauses": [\n'
            '    {"clauseName": "string", "description": "string", "riskTo": "string"}, ...\n'
            '  ],\n'
            '  "reminders": [\n'
            '    {"type": "string", "date": "string (ISO 8601) hoặc null nếu không ghi rõ trong văn bản", "content": "string trích từ văn bản"}, ...\n'
            '  ],\n'
            '  "terminationConditions": "string",\n'
            '  "riskAssessment": {\n'
            '    "riskLevel": "LOW|MEDIUM|HIGH",\n'
            '      "riskFactors": ["string"],\n'
            '      "mitigationMeasures": ["string"],\n'
            
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
        
        # Use shared AI service instead of creating new Gemini configuration
        ai_service = AutomationService()
        try:
            answer = ai_service.generate_contract_summary(content, file.filename if file else "text_input")
        except Exception as e:
            # Bổ sung chi tiết lỗi từ exception vào description
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description=f"AI không thể tóm tắt thông tin từ tài liệu này. Có thể do định dạng không hỗ trợ hoặc nội dung không phù hợp. | Chi tiết: {str(e)}",
                data=None,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
        # Handle AI service response
        if answer is None:
            # AI service failed to generate summary (không có exception)
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description="AI không thể tóm tắt thông tin từ tài liệu này. Có thể do định dạng không hỗ trợ hoặc nội dung không phù hợp. | Chi tiết: Không nhận được phản hồi hợp lệ từ AI.",
                data=None,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
        # Check for API key error
        if isinstance(answer, dict) and answer.get("error") == "API_KEY_INVALID":
            # Get API key info for debugging
            api_key_info = "Thiếu api key"
            if gemini_api_key:
                api_key_info = f"+ {gemini_api_key[:10]}..."
            else:
                try:
                    env_api_key = Config.get_gemini_api_key()
                    if env_api_key:
                        api_key_info = f"+ {env_api_key[:10]}..."
                except:
                    api_key_info = "Thiếu api key"
            
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description=f"API key không hợp lệ. Vui lòng kiểm tra lại API key. {api_key_info}",
                data=None,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
        # Convert dict result back to string for compatibility
        if isinstance(answer, dict):
            answer = json.dumps(answer, ensure_ascii=False, indent=2)
        
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
                data=None,
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
        # Giữ nguyên ký tự escape để không làm hỏng JSON; chỉ bỏ fence markdown
        
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
                    # Giữ lại reminders ngay cả khi date=None để client có thể xử lý tiếp
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
        
        # Tạo preview nội dung an toàn để debug nếu có
        preview = None
        try:
            if isinstance(content, str):
                preview = content[:200]
                if len(content) > 200:
                    preview += "..."
        except Exception:
            preview = None

        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description="Lỗi xảy ra khi gọi AI service. Vui lòng thử lại sau.",
            data={"error": error_message, "rawContent": preview},
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


# API Test: Lấy cấu hình Gemini
@router.get("/gemini/get-config", summary="Lấy cấu hình Gemini", tags=["⚙️ APIs Kiểm tra Hệ thống"])
async def get_gemini_config(request: Request):
    try:
        # Lấy cấu hình Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        
        # Lấy cấu hình service
        service_name = os.getenv("SERVICE_NAME", "automation-service")
        host = os.getenv("HOST", "0.0.0.0")
        port = os.getenv("PORT", "8003")
        debug = os.getenv("DEBUG", "false")
        
        # Lấy cấu hình Kafka
        kafka_servers = Config.KAFKA_BOOTSTRAP_SERVERS
        kafka_group_id = os.getenv("KAFKA_GROUP_ID", "automation-service")
        
        # Lấy cấu hình Redis
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = os.getenv("REDIS_PORT", "6379")
        redis_db = os.getenv("REDIS_DB", "0")
        
        # Tạo response data
        config_data = {
            "gemini": {
                "api_key": {
                    "exists": api_key is not None,
                    "length": len(api_key) if api_key else 0,
                    "masked": f"{api_key[:8]}...{api_key[-4:]}" if api_key and len(api_key) > 12 else "N/A" if not api_key else api_key,
                    "status": "CONFIGURED" if api_key else "NOT_CONFIGURED"
                },
                "model": model,
                "status": "READY" if api_key else "NOT_CONFIGURED"
            },
            "service": {
                "name": service_name,
                "host": host,
                "port": port,
                "debug": debug.lower() == "true",
                "version": "2.0.0"
            },
            "kafka": {
                "bootstrap_servers": kafka_servers,
                "group_id": kafka_group_id,
                "status": "CONFIGURED"
            },
            "redis": {
                "host": redis_host,
                "port": redis_port,
                "database": redis_db,
                "status": "CONFIGURED"
            },
            "system": {
                "python_path": os.getcwd(),
                "environment": os.getenv("NODE_ENV", "development"),
                "env_files": {
                    "dotenv_loaded": True,
                    "env_exists": os.path.exists("env/.env"),
                    "env_example_exists": os.path.exists("env/.env.example")
                }
            }
        }
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            description="Đã lấy cấu hình Gemini thành công",
            data=config_data,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )
        
    except Exception as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi lấy cấu hình Gemini: {str(e)}",
            data=None,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )


# ==================== NOTIFICATION APIs ====================
# TEMPORARILY DISABLED - Missing twilio dependency

# Initialize services (will be initialized in main.py)
# notification_service = NotificationService()
batch_service = BatchService()
event_service = EventService()

# @router.post("/notifications/send", summary="Gửi notification", tags=["📧 API Thông báo"])
# async def send_notification_api(
#     request: Request,
#     notification_request: NotificationRequest
# ):
#     try:
#         await notification_service.initialize()
#         result = await notification_service.send_notification(notification_request)
#         
#         return RestResponse(
#             statusCode=200,
#             shortMessage="Success",
#             description="Gửi notification thành công",
#             data=result.model_dump(),
#             path=request.url.path,
#             timestamp=datetime.now(timezone.utc),
#             requestId=str(uuid.uuid4())
#         )
#         
#     except Exception as e:
#         return RestResponse(
#             statusCode=500,
#             shortMessage="Internal Server Error",
#             description=f"Lỗi khi gửi notification: {str(e)}",
#             data=None,
#             path=request.url.path,
#             timestamp=datetime.now(timezone.utc),
#             requestId=str(uuid.uuid4())
#         )

# @router.get("/notifications/history", summary="Lịch sử notification", tags=["📧 API Thông báo"])
# async def get_notification_history_api(
#     request: Request,
#     page: int = Query(1, ge=1, description="Số trang"),
#     limit: int = Query(10, ge=1, le=100, description="Số lượng mỗi trang"),
#     notification_type: str = Query(None, description="Loại notification"),
#     status: str = Query(None, description="Trạng thái notification"),
#     start_date: str = Query(None, description="Ngày bắt đầu (ISO format)"),
#     end_date: str = Query(None, description="Ngày kết thúc (ISO format)")
# ):
#     try:
#         await notification_service.initialize()
#         
#         # Parse dates if provided
#         start_dt = None
#         end_dt = None
#         if start_date:
#             start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
#         if end_date:
#             end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
#         
#         result = await notification_service.get_notification_history(
#             page=page,
#             limit=limit,
#             notification_type=notification_type,
#             status=status,
#             start_date=start_dt,
#             end_date=end_dt
#         )
#         
#         return RestResponse(
#             statusCode=200,
#             shortMessage="Success",
#             description="Lấy lịch sử notification thành công",
#             data=result,
#             path=request.url.path,
#             timestamp=datetime.now(timezone.utc),
#             requestId=str(uuid.uuid4())
#         )
#         
#     except Exception as e:
#         return RestResponse(
#             statusCode=500,
#             shortMessage="Internal Server Error",
#             description=f"Lỗi khi lấy lịch sử notification: {str(e)}",
#             data=None,
#             path=request.url.path,
#             timestamp=datetime.now(timezone.utc),
#             requestId=str(uuid.uuid4())
#         )

# @router.post("/notifications/templates", summary="Tạo notification template", tags=["📧 API Thông báo"])
# async def create_notification_template_api(
#     request: Request,
#     template: NotificationTemplate
# ):
#     try:
#         await notification_service.initialize()
#         result = await notification_service.create_notification_template(template)
#         
#         return RestResponse(
#             statusCode=201,
#             shortMessage="Created",
#             description="Tạo notification template thành công",
#             data=result.model_dump(),
#             path=request.url.path,
#             timestamp=datetime.now(timezone.utc),
#             requestId=str(uuid.uuid4())
#         )
#         
#     except Exception as e:
#         return RestResponse(
#             statusCode=500,
#             shortMessage="Internal Server Error",
#             description=f"Lỗi khi tạo notification template: {str(e)}",
#             data=None,
#             path=request.url.path,
#             timestamp=datetime.now(timezone.utc),
#             requestId=str(uuid.uuid4())
#         )

# ==================== BATCH PROCESSING APIs ====================

@router.post("/batch/process", summary="Xử lý batch", tags=["📦 APIs Xử lý Batch"])
async def process_batch_api(
    request: Request,
    batch_request: BatchProcessingRequest
):
    try:
        await batch_service.initialize()
        
        # Tạo batch job
        job_request = BatchJobRequest(
            type="ai_processing",
            name=f"Batch processing {len(batch_request.files)} files",
            description=f"Xử lý {batch_request.processing_type} cho {len(batch_request.files)} files",
            data={
                "files": batch_request.files,
                "processing_type": batch_request.processing_type,
                "options": batch_request.options or {},
                "callback_url": batch_request.callback_url
            }
        )
        
        job = await batch_service.create_batch_job(job_request)
        
        # Bắt đầu xử lý job
        asyncio.create_task(batch_service.process_batch_job(job.id))
        
        result = BatchProcessingResponse(
            job_id=job.id,
            total_files=len(batch_request.files),
            estimated_time=len(batch_request.files) * 30,  # 30 seconds per file
            status_url=f"/api/v1/automation-service/batch/status/{job.id}"
        )
        
        return RestResponse(
            statusCode=201,
            shortMessage="Created",
            description="Tạo batch job thành công",
            data=result.model_dump(),
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )
        
    except Exception as e:
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi tạo batch job: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )

@router.get("/batch/status/{job_id}", summary="Trạng thái job", tags=["📦 APIs Xử lý Batch"])
async def get_batch_job_status_api(
    request: Request,
    job_id: str
):
    try:
        await batch_service.initialize()
        result = await batch_service.get_batch_job_status(job_id)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Lấy trạng thái batch job thành công",
            data=result.model_dump(),
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )
        
    except ValueError as e:
        return RestResponse(
            statusCode=404,
            shortMessage="Not Found",
            description=str(e),
            data=None,
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )
    except Exception as e:
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi lấy trạng thái batch job: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(timezone.utc),
            requestId=str(uuid.uuid4())
        )

@router.get("/batch/jobs", summary="Danh sách jobs với projection", tags=["📦 APIs Xử lý Batch"])
async def get_batch_jobs_api(
    request: Request,
    view: ViewType = Query(ViewType.TABLE),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    job_type: str = Query(None),
    status: str = Query(None),
    priority: str = Query(None)
):
    try:
        logger.info(f"Retry OCR request for document: {document_id}")
        
        result = await document_processor.retry_ocr(document_id)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Retry OCR thành công",
            data=result,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
        
    except Exception as e:
        logger.error(f"Retry OCR failed: {str(e)}")
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi retry OCR: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )


@router.get("/health", summary="Health check", tags=["🏥 APIs Kiểm tra Hệ thống"])
async def health_check():
    return RestResponse(
        statusCode=200,
        shortMessage="Success",
        description="Service đang hoạt động bình thường",
        data={
            "status": "healthy",
            "service": "Automation Service",
            "version": "2.0.0",
            "ai_model": "Gemini 2.0 Flash",
            "supported_formats": ["docx", "pdf", "txt"],
            "timestamp": datetime.now().isoformat()
        },
        path="/api/v1/automation-service/health"
    )


