import os
import logging
import subprocess
import tempfile
from typing import Optional, Union
from PIL import Image
import pytesseract
from pdf2image import convert_from_bytes
import PyPDF2
from io import BytesIO

logger = logging.getLogger(__name__)

class OCRService:
    """
    OCR Service sử dụng Tesseract để trích xuất văn bản từ hình ảnh và PDF
    Hỗ trợ tiếng Việt và tiếng Anh
    """
    
    def __init__(self):
        # Cấu hình Tesseract path
        self.tesseract_path = self._get_tesseract_path()
        if self.tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_path
        
        # Cấu hình ngôn ngữ OCR
        self.languages = "vie+eng"  # Tiếng Việt + Tiếng Anh
        
        logger.info(f"OCR Service initialized with Tesseract path: {self.tesseract_path}")
    
    def _get_tesseract_path(self) -> Optional[str]:
        """Tìm đường dẫn Tesseract executable"""
        possible_paths = [
            "/usr/bin/tesseract",  # Linux
            "/usr/local/bin/tesseract",  # macOS
            "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",  # Windows
            "C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",  # Windows 32-bit
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
        
        # Thử tìm trong PATH
        try:
            result = subprocess.run(['tesseract', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                return 'tesseract'
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        
        logger.warning("Tesseract not found in standard locations")
        return None
    
    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """
        Trích xuất văn bản từ hình ảnh (JPG, PNG, etc.)
        
        Args:
            image_bytes: Dữ liệu hình ảnh dạng bytes
            
        Returns:
            Văn bản được trích xuất
        """
        try:
            logger.info("Starting OCR extraction from image")
            
            # Mở hình ảnh từ bytes
            image = Image.open(BytesIO(image_bytes))
            
            # Chuyển đổi sang RGB nếu cần
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Thực hiện OCR
            text = pytesseract.image_to_string(
                image, 
                lang=self.languages,
                config='--psm 6'  # Uniform block of text
            )
            
            # Làm sạch văn bản
            cleaned_text = self._clean_text(text)
            
            logger.info(f"OCR extraction completed. Extracted {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"OCR extraction from image failed: {str(e)}")
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """
        Trích xuất văn bản từ PDF (cả PDF thông thường và PDF scan)
        
        Args:
            pdf_bytes: Dữ liệu PDF dạng bytes
            
        Returns:
            Văn bản được trích xuất
        """
        try:
            logger.info("Starting PDF text extraction")
            
            # Thử trích xuất văn bản trực tiếp từ PDF trước
            try:
                text = self._extract_text_from_pdf_direct(pdf_bytes)
                if text and len(text.strip()) > 50:  # Nếu có đủ văn bản
                    logger.info("Successfully extracted text from PDF directly")
                    return self._clean_text(text)
            except Exception as e:
                logger.warning(f"Direct PDF text extraction failed: {str(e)}")
            
            # Nếu không thành công, chuyển PDF thành hình ảnh và OCR
            logger.info("Converting PDF to images for OCR")
            images = convert_from_bytes(pdf_bytes, dpi=300)
            
            all_text = []
            for i, image in enumerate(images):
                logger.info(f"Processing page {i+1}/{len(images)}")
                
                # OCR từng trang
                page_text = pytesseract.image_to_string(
                    image, 
                    lang=self.languages,
                    config='--psm 6'
                )
                
                if page_text.strip():
                    all_text.append(f"--- Trang {i+1} ---\n{page_text}")
            
            combined_text = "\n\n".join(all_text)
            cleaned_text = self._clean_text(combined_text)
            
            logger.info(f"PDF OCR extraction completed. Extracted {len(cleaned_text)} characters from {len(images)} pages")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}")
            raise Exception(f"PDF text extraction failed: {str(e)}")
    
    def _extract_text_from_pdf_direct(self, pdf_bytes: bytes) -> str:
        """Trích xuất văn bản trực tiếp từ PDF (không OCR)"""
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
        text = ""
        
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        return text
    
    def extract_text_from_file(self, file_bytes: bytes, file_type: str) -> str:
        """
        Trích xuất văn bản từ file dựa trên loại file - hỗ trợ nhiều loại file
        
        Args:
            file_bytes: Dữ liệu file dạng bytes
            file_type: Loại file (image/jpeg, image/png, application/pdf, etc.)
            
        Returns:
            Văn bản được trích xuất
        """
        logger.info(f"Extracting text from file type: {file_type}")
        
        # Hình ảnh - hỗ trợ nhiều format
        if file_type.startswith('image/'):
            return self.extract_text_from_image(file_bytes)
        
        # PDF
        elif file_type == 'application/pdf':
            return self.extract_text_from_pdf(file_bytes)
        
        # Text files
        elif file_type == 'text/plain':
            try:
                return file_bytes.decode('utf-8')
            except UnicodeDecodeError:
                return file_bytes.decode('latin-1')
        
        # Office documents - thử OCR như hình ảnh
        elif file_type in [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # DOCX
            'application/msword',  # DOC
            'application/vnd.ms-excel',  # XLS
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # XLSX
            'application/vnd.ms-powerpoint',  # PPT
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'  # PPTX
        ]:
            logger.warning(f"Office document OCR not fully implemented: {file_type}")
            return ""
        
        # Archive files
        elif file_type in [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed'
        ]:
            logger.warning(f"Archive file OCR not supported: {file_type}")
            return ""
        
        # Video/Audio files
        elif file_type.startswith('video/') or file_type.startswith('audio/'):
            logger.warning(f"Media file OCR not supported: {file_type}")
            return ""
        
        # Executable files
        elif file_type in [
            'application/x-executable',
            'application/x-msdownload',
            'application/x-msdos-program'
        ]:
            logger.warning(f"Executable file OCR not supported: {file_type}")
            return ""
        
        # Unknown file types - thử OCR như hình ảnh
        else:
            logger.info(f"Unknown file type, attempting OCR as image: {file_type}")
            try:
                return self.extract_text_from_image(file_bytes)
            except Exception as e:
                logger.warning(f"OCR failed for unknown file type {file_type}: {str(e)}")
                return ""
    
    def _clean_text(self, text: str) -> str:
        """Làm sạch văn bản sau OCR"""
        if not text:
            return ""
        
        # Loại bỏ ký tự đặc biệt và khoảng trắng thừa
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Loại bỏ dòng trống và dòng chỉ có ký tự đặc biệt
            cleaned_line = line.strip()
            if cleaned_line and not all(c in ' \t\n\r' for c in cleaned_line):
                cleaned_lines.append(cleaned_line)
        
        return '\n'.join(cleaned_lines)
    
    def is_tesseract_available(self) -> bool:
        """Kiểm tra xem Tesseract có sẵn không"""
        try:
            version = pytesseract.get_tesseract_version()
            logger.info(f"Tesseract version: {version}")
            return True
        except Exception as e:
            logger.error(f"Tesseract not available: {str(e)}")
            return False
    
    def get_supported_languages(self) -> list:
        """Lấy danh sách ngôn ngữ được hỗ trợ"""
        try:
            langs = pytesseract.get_languages()
            return langs
        except Exception as e:
            logger.error(f"Failed to get supported languages: {str(e)}")
            return []


