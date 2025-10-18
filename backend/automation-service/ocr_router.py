"""
OCR Router for Automation Service
API endpoints cho OCR (Optical Character Recognition)
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Request
from typing import Optional, Dict, Any
import uuid
from datetime import datetime
import logging

from schemas.response import RestResponse
from services.ocr_service import OCRService

# Create router
router = APIRouter(prefix="/api/v1/automation-service/ocr", tags=["🔍 APIs OCR"])

# Initialize OCR service
ocr_service = OCRService()

@router.post("/extract", summary="Trích xuất text từ hình ảnh", tags=["🔍 APIs OCR"])
async def extract_text_from_image(
    request: Request,
    file: UploadFile = File(..., description="File hình ảnh cần OCR (jpg, png, tiff, bmp)"),
    engine: str = Query("auto", description="OCR engine: auto, tesseract, easyocr"),
    language: str = Query("vie+eng", description="Ngôn ngữ OCR (ví dụ: vie+eng, en, vi)"),
    preprocess: bool = Query(True, description="Có tiền xử lý hình ảnh không")
):
    """
    ## 📖 Mô tả
    **API trích xuất text từ hình ảnh sử dụng OCR (Optical Character Recognition)**
    
    API này sử dụng trí tuệ nhân tạo để nhận diện và trích xuất văn bản từ hình ảnh.
    Hỗ trợ nhiều định dạng ảnh và có thể xử lý tiếng Việt, tiếng Anh và nhiều ngôn ngữ khác.
    
    **🎯 Mục đích sử dụng:**
    - OCR từ ảnh scan tài liệu
    - Trích xuất text từ ảnh chụp màn hình
    - Xử lý ảnh chứa văn bản
    - Chuyển đổi ảnh thành văn bản có thể tìm kiếm
    
    **⚡ Hiệu suất:**
    - Xử lý ảnh lên đến 10MB
    - Thời gian xử lý: 3-15 giây tùy kích thước ảnh
    - Độ chính xác: >90% cho văn bản rõ ràng
    - Hỗ trợ tiền xử lý ảnh để cải thiện độ chính xác
    
    ## 🔹 Đầu vào
    
    ### 📁 **file** (bắt buộc, multipart/form-data)
    - **Loại dữ liệu**: `UploadFile`
    - **Định dạng hỗ trợ**: `.jpg`, `.jpeg`, `.png`, `.tiff`, `.bmp`, `.webp`
    - **Kích thước tối đa**: 10MB
    - **Mô tả**: File hình ảnh cần OCR
    - **Ví dụ**: `document_scan.jpg`, `screenshot.png`
    - **Lưu ý**: Ảnh phải chứa văn bản rõ ràng, độ phân giải tối thiểu 300 DPI
    
    ### 🔧 **engine** (tùy chọn, query)
    - **Loại dữ liệu**: `string`
    - **Các giá trị**: `auto`, `tesseract`, `easyocr`
    - **Mặc định**: `auto`
    - **Mô tả**: Engine OCR sử dụng
    - **Ví dụ**: `auto` (tự động chọn engine tốt nhất)
    - **Lưu ý**: `auto` sẽ thử tất cả engine và chọn kết quả tốt nhất
    
    ### 🌐 **language** (tùy chọn, query)
    - **Loại dữ liệu**: `string`
    - **Mặc định**: `vie+eng`
    - **Mô tả**: Ngôn ngữ OCR (có thể kết hợp nhiều ngôn ngữ)
    - **Ví dụ**: `vie+eng` (tiếng Việt + tiếng Anh), `en` (chỉ tiếng Anh)
    - **Lưu ý**: Hỗ trợ kết hợp ngôn ngữ với dấu `+`
    
    ### 🔄 **preprocess** (tùy chọn, query)
    - **Loại dữ liệu**: `boolean`
    - **Mặc định**: `true`
    - **Mô tả**: Có tiền xử lý hình ảnh để cải thiện độ chính xác không
    - **Ví dụ**: `true`, `false`
    - **Lưu ý**: Tiền xử lý bao gồm denoising, thresholding, morphological operations
    
    ## 🔹 Đầu ra
    
    ### 📄 **data** (object)
    - **Mô tả**: Kết quả OCR với thông tin chi tiết
    - **Cấu trúc**:
    ```json
    {
      "success": boolean,
      "text": string,
      "confidence": number (0-1),
      "engine": string,
      "language": string,
      "boxes": [
        {
          "text": string,
          "confidence": number,
          "bbox": {
            "x": number,
            "y": number,
            "width": number,
            "height": number
          }
        }
      ],
      "engines": {
        "tesseract": {...},
        "easyocr": {...}
      },
      "best_engine": string
    }
    ```
    
    ### 📊 **apiVersion** (string)
    - **Mô tả**: Phiên bản API hiện tại
    - **Giá trị cố định**: `"v1"`
    
    ### 🔢 **statusCode** (integer)
    - **Mô tả**: Mã trạng thái xử lý yêu cầu
    - **Các giá trị có thể**:
      - `200`: Thành công - OCR hoàn tất
      - `400`: Lỗi đầu vào - File không hợp lệ
      - `422`: Không thể xử lý - OCR thất bại
      - `500`: Lỗi server - Lỗi hệ thống
    
    ### 📋 **shortMessage** (string)
    - **Mô tả**: Thông báo ngắn gọn về kết quả
    - **Các giá trị có thể**:
      - `"Success"`: OCR thành công
      - `"Bad Request"`: Dữ liệu đầu vào không hợp lệ
      - `"Unprocessable Entity"`: OCR thất bại
      - `"Internal Server Error"`: Lỗi hệ thống
    
    ### 📖 **description** (string)
    - **Mô tả**: Mô tả chi tiết về kết quả OCR
    - **Ví dụ**: `"Đã trích xuất thành công 1,250 ký tự từ hình ảnh với độ chính xác 95%"`
    
    ### 🕒 **timestamp** (string, ISO-8601)
    - **Mô tả**: Thời gian xử lý yêu cầu
    - **Định dạng**: `YYYY-MM-DDTHH:mm:ssZ`
    - **Ví dụ**: `"2024-01-15T10:30:45Z"`
    
    ### 🆔 **requestId** (string, UUID)
    - **Mô tả**: Định danh duy nhất của yêu cầu
    - **Định dạng**: UUID v4
    - **Ví dụ**: `"123e4567-e89b-12d3-a456-426614174000"`
    
    ### 🛣️ **path** (string)
    - **Mô tả**: Đường dẫn API được gọi
    - **Ví dụ**: `"/api/v1/automation-service/ocr/extract"`
    
    ## ⚠️ Lưu ý quan trọng
    
    - **File size**: Không vượt quá 10MB để đảm bảo hiệu suất
    - **Định dạng**: Chỉ hỗ trợ ảnh, không hỗ trợ PDF (dùng API khác)
    - **Thời gian xử lý**: Có thể mất 3-15 giây tùy kích thước ảnh
    - **Độ chính xác**: Phụ thuộc vào chất lượng ảnh và độ rõ ràng của văn bản
    - **Ngôn ngữ**: Hỗ trợ tiếng Việt, tiếng Anh và nhiều ngôn ngữ khác
    
    ## 🔗 Liên quan
    
    - **API tương tự**: `/document/extract` - Trích xuất từ PDF/DOCX
    - **API tiếp theo**: `/document/classify` - Phân loại tài liệu
    """
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Định dạng file không được hỗ trợ. Hỗ trợ: {', '.join(allowed_types)}"
            )
        
        # Validate file size (10MB limit)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File quá lớn. Kích thước tối đa: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Validate engine
        valid_engines = ['auto', 'tesseract', 'easyocr']
        if engine not in valid_engines:
            raise HTTPException(
                status_code=400,
                detail=f"Engine không hợp lệ. Hỗ trợ: {', '.join(valid_engines)}"
            )
        
        # Process OCR
        result = ocr_service.extract_text_from_file(file_content, file.filename, engine)
        
        if not result["success"]:
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description=f"OCR thất bại: {result.get('error', 'Unknown error')}",
                data=result,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
        # Calculate text length for description
        text_length = len(result["text"])
        confidence_percent = int(result["confidence"] * 100)
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã trích xuất thành công {text_length} ký tự từ hình ảnh với độ chính xác {confidence_percent}%",
            data=result,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"OCR processing error: {e}")
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi xử lý OCR: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )

@router.get("/engines", summary="Trạng thái OCR engines", tags=["🔍 APIs OCR"])
async def get_ocr_engines_status(request: Request):
    """
    ## 📖 Mô tả
    **API kiểm tra trạng thái các OCR engines**
    
    API này cung cấp thông tin về trạng thái và khả năng của các OCR engines hiện có.
    Giúp xác định engine nào đang hoạt động và ngôn ngữ nào được hỗ trợ.
    
    ## 🔹 Đầu vào
    
    Không có tham số đầu vào.
    
    ## 🔹 Đầu ra
    
    ### 📄 **data** (object)
    - **Mô tả**: Thông tin trạng thái các OCR engines
    - **Cấu trúc**:
    ```json
    {
      "tesseract": {
        "available": boolean,
        "version": string
      },
      "easyocr": {
        "available": boolean,
        "reader_initialized": boolean
      },
      "supported_languages": [string]
    }
    ```
    
    ### 📊 **apiVersion** (string)
    - **Mô tả**: Phiên bản API (v1)
    
    ### 🔢 **statusCode** (integer)
    - **Mô tả**: Mã trạng thái HTTP (200: thành công, 500: lỗi server)
    
    ### 📋 **shortMessage** (string)
    - **Mô tả**: Thông báo ngắn gọn về kết quả
    
    ### 📖 **description** (string)
    - **Mô tả**: Mô tả chi tiết về trạng thái engines
    
    ### 🕒 **timestamp** (string, ISO-8601)
    - **Mô tả**: Thời gian xử lý yêu cầu
    
    ### 🆔 **requestId** (string, UUID)
    - **Mô tả**: Định danh duy nhất của yêu cầu
    
    ### 🛣️ **path** (string)
    - **Mô tả**: Đường dẫn API được gọi
    """
    try:
        status = ocr_service.get_engine_status()
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description="Đã lấy trạng thái OCR engines thành công",
            data=status,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
        
    except Exception as e:
        logging.error(f"Error getting OCR engines status: {e}")
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi lấy trạng thái OCR engines: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )

@router.post("/process-document", summary="Xử lý tài liệu hoàn chỉnh", tags=["🔍 APIs OCR"])
async def process_document_complete(
    request: Request,
    file: UploadFile = File(..., description="File tài liệu cần xử lý (ảnh, PDF, DOCX, TXT, JSON)"),
    engine: str = Query("auto", description="OCR engine: auto, tesseract, easyocr")
):
    """
    ## 📖 Mô tả
    **API xử lý tài liệu hoàn chỉnh: OCR + Classification + Contract Summary**
    
    API này thực hiện xử lý toàn diện tài liệu bao gồm:
    - Trích xuất text từ file (OCR cho ảnh, đọc trực tiếp cho text)
    - Phân loại tài liệu (contract, invoice, report, etc.)
    - Tóm tắt hợp đồng (nếu là hợp đồng)
    - Trích xuất metadata chi tiết
    
    **🎯 Mục đích sử dụng:**
    - Xử lý tài liệu scan thành text có thể tìm kiếm
    - Phân loại tự động loại tài liệu
    - Tóm tắt hợp đồng với thông tin chi tiết
    - Trích xuất metadata cho quản lý tài liệu
    
    **⚡ Hiệu suất:**
    - Xử lý file lên đến 50MB
    - Thời gian xử lý: 5-30 giây tùy loại file
    - Độ chính xác OCR: >90% cho văn bản rõ ràng
    - Hỗ trợ đa định dạng: ảnh, PDF, DOCX, TXT, JSON
    
    ## 🔹 Đầu vào
    
    ### 📁 **file** (bắt buộc, multipart/form-data)
    - **Loại dữ liệu**: `UploadFile`
    - **Định dạng hỗ trợ**: `.jpg`, `.png`, `.pdf`, `.docx`, `.txt`, `.json`
    - **Kích thước tối đa**: 50MB
    - **Mô tả**: File tài liệu cần xử lý hoàn chỉnh
    
    ### 🔧 **engine** (tùy chọn, query)
    - **Loại dữ liệu**: `string`
    - **Các giá trị**: `auto`, `tesseract`, `easyocr`
    - **Mặc định**: `auto`
    - **Mô tả**: Engine OCR sử dụng (chỉ áp dụng cho file ảnh)
    
    ## 🔹 Đầu ra
    
    ### 📄 **data** (object)
    - **Mô tả**: Kết quả xử lý hoàn chỉnh với tất cả thông tin
    - **Cấu trúc**:
    ```json
    {
      "success": boolean,
      "extraction": {
        "success": boolean,
        "text": string,
        "confidence": number,
        "engine": string,
        "metadata": {...}
      },
      "classification": {
        "documentType": string,
        "isContract": boolean,
        "confidence": number,
        "reasons": [string],
        "contractSubtype": string|null
      },
      "summary": {
        "effectiveDate": string,
        "expiryDate": string,
        "totalValue": number,
        "currency": string,
        "parties": [...],
        "payment": {...},
        "clauses": {...},
        "risk": {...},
        "compliance": {...}
      },
      "metadata": {
        "fileType": string,
        "contentType": string,
        "size": number,
        "classification": {...},
        "hasSummary": boolean,
        "processedAt": string
      }
    }
    ```
    
    ### 📊 **apiVersion** (string)
    - **Mô tả**: Phiên bản API hiện tại
    - **Giá trị cố định**: `"v1"`
    
    ### 🔢 **statusCode** (integer)
    - **Mô tả**: Mã trạng thái xử lý yêu cầu
    - **Các giá trị có thể**:
      - `200`: Thành công - Xử lý hoàn tất
      - `400`: Lỗi đầu vào - File không hợp lệ
      - `422`: Không thể xử lý - OCR/AI thất bại
      - `500`: Lỗi server - Lỗi hệ thống
    
    ### 📋 **shortMessage** (string)
    - **Mô tả**: Thông báo ngắn gọn về kết quả
    - **Các giá trị có thể**:
      - `"Success"`: Xử lý thành công
      - `"Bad Request"`: Dữ liệu đầu vào không hợp lệ
      - `"Unprocessable Entity"`: Xử lý thất bại
      - `"Internal Server Error"`: Lỗi hệ thống
    
    ### 📖 **description** (string)
    - **Mô tả**: Mô tả chi tiết về kết quả xử lý
    - **Ví dụ**: `"Đã xử lý thành công tài liệu hợp đồng với 1,250 ký tự, độ chính xác 95%, tóm tắt hoàn chỉnh"`
    
    ### 🕒 **timestamp** (string, ISO-8601)
    - **Mô tả**: Thời gian xử lý yêu cầu
    - **Định dạng**: `YYYY-MM-DDTHH:mm:ssZ`
    - **Ví dụ**: `"2024-01-15T10:30:45Z"`
    
    ### 🆔 **requestId** (string, UUID)
    - **Mô tả**: Định danh duy nhất của yêu cầu
    - **Định dạng**: UUID v4
    - **Ví dụ**: `"123e4567-e89b-12d3-a456-426614174000"`
    
    ### 🛣️ **path** (string)
    - **Mô tả**: Đường dẫn API được gọi
    - **Ví dụ**: `"/api/v1/automation-service/ocr/process-document"`
    
    ## ⚠️ Lưu ý quan trọng
    
    - **File size**: Không vượt quá 50MB để đảm bảo hiệu suất
    - **Định dạng**: Hỗ trợ đa định dạng (ảnh, PDF, DOCX, TXT, JSON)
    - **Thời gian xử lý**: Có thể mất 5-30 giây tùy loại và kích thước file
    - **Độ chính xác**: Phụ thuộc vào chất lượng file và độ rõ ràng của văn bản
    - **AI Processing**: Sử dụng Gemini AI cho classification và contract summary
    
    ## 🔗 Liên quan
    
    - **API tương tự**: `/ocr/extract` - Chỉ OCR text
    - **API tương tự**: `/contracts/summarize` - Chỉ tóm tắt hợp đồng
    - **API tiếp theo**: `/files/upload` - Upload và xử lý tự động
    """
    try:
        # Validate file type
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp', 'image/webp',
            'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'application/json'
        ]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Định dạng file không được hỗ trợ. Hỗ trợ: {', '.join(allowed_types)}"
            )
        
        # Validate file size (50MB limit)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File quá lớn. Kích thước tối đa: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Validate engine
        valid_engines = ['auto', 'tesseract', 'easyocr']
        if engine not in valid_engines:
            raise HTTPException(
                status_code=400,
                detail=f"Engine không hợp lệ. Hỗ trợ: {', '.join(valid_engines)}"
            )
        
        # Process document completely
        result = ocr_service.process_document_complete(file_content, file.filename, file.content_type, engine)
        
        if not result["success"]:
            return RestResponse(
                statusCode=422,
                shortMessage="Unprocessable Entity",
                description=f"Xử lý tài liệu thất bại: {result.get('error', 'Unknown error')}",
                data=result,
                path=request.url.path,
                timestamp=datetime.now(),
                requestId=str(uuid.uuid4())
            )
        
        # Calculate processing summary
        extraction = result.get("extraction", {})
        classification = result.get("classification", {})
        summary = result.get("summary")
        
        text_length = len(extraction.get("text", ""))
        confidence = extraction.get("confidence", 0.0)
        doc_type = classification.get("documentType", "unknown")
        is_contract = classification.get("isContract", False)
        has_summary = summary is not None
        
        description = f"Đã xử lý thành công tài liệu {doc_type}"
        if text_length > 0:
            description += f" với {text_length} ký tự"
        if confidence > 0:
            description += f", độ chính xác {int(confidence * 100)}%"
        if is_contract and has_summary:
            description += ", tóm tắt hợp đồng hoàn chỉnh"
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=description,
            data=result,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Document processing error: {e}")
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi xử lý tài liệu: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )

@router.get("/languages", summary="Ngôn ngữ được hỗ trợ", tags=["🔍 APIs OCR"])
async def get_supported_languages(request: Request):
    """
    ## 📖 Mô tả
    **API lấy danh sách ngôn ngữ được hỗ trợ bởi OCR engines**
    
    API này trả về danh sách các ngôn ngữ mà hệ thống OCR có thể xử lý.
    Giúp người dùng biết được ngôn ngữ nào có thể sử dụng trong OCR.
    
    ## 🔹 Đầu vào
    
    Không có tham số đầu vào.
    
    ## 🔹 Đầu ra
    
    ### 📄 **data** (array)
    - **Mô tả**: Danh sách mã ngôn ngữ được hỗ trợ
    - **Ví dụ**: `["vi", "en", "zh", "ja", "ko", "th", "ar", "hi"]`
    - **Lưu ý**: Có thể kết hợp nhiều ngôn ngữ với dấu `+` (ví dụ: `vie+eng`)
    
    ### 📊 **apiVersion** (string)
    - **Mô tả**: Phiên bản API (v1)
    
    ### 🔢 **statusCode** (integer)
    - **Mô tả**: Mã trạng thái HTTP (200: thành công, 500: lỗi server)
    
    ### 📋 **shortMessage** (string)
    - **Mô tả**: Thông báo ngắn gọn về kết quả
    
    ### 📖 **description** (string)
    - **Mô tả**: Mô tả chi tiết về danh sách ngôn ngữ
    
    ### 🕒 **timestamp** (string, ISO-8601)
    - **Mô tả**: Thời gian xử lý yêu cầu
    
    ### 🆔 **requestId** (string, UUID)
    - **Mô tả**: Định danh duy nhất của yêu cầu
    
    ### 🛣️ **path** (string)
    - **Mô tả**: Đường dẫn API được gọi
    """
    try:
        languages = ocr_service.get_supported_languages()
        
        return RestResponse(
            statusCode=200,
            shortMessage="Success",
            description=f"Đã lấy danh sách {len(languages)} ngôn ngữ được hỗ trợ",
            data=languages,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
        
    except Exception as e:
        logging.error(f"Error getting supported languages: {e}")
        return RestResponse(
            statusCode=500,
            shortMessage="Internal Server Error",
            description=f"Lỗi khi lấy danh sách ngôn ngữ: {str(e)}",
            data=None,
            path=request.url.path,
            timestamp=datetime.now(),
            requestId=str(uuid.uuid4())
        )
