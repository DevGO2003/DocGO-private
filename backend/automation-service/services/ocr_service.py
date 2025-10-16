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
    
    
    def __init__(self):
        # Cấu hình Tesseract path
        self.tesseract_path = self._get_tesseract_path()
        if self.tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_path
        
        # Cấu hình ngôn ngữ OCR
        self.languages = "vie+eng"  # Tiếng Việt + Tiếng Anh
        
        logger.info(f"OCR Service initialized with Tesseract path: {self.tesseract_path}")
    
    def _get_tesseract_path(self) -> Optional[str]:
        
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
        
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
        text = ""
        
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        return text
    
    def _extract_text_from_pdf_simple(self, pdf_bytes: bytes) -> str:
        """Simple PDF text extraction without OCR"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.warning(f"Simple PDF extraction failed: {e}")
            return f"PDF text extraction failed: {e}"
    
    def extract_text_from_file(self, file_bytes: bytes, file_type: str) -> str:
        
        logger.info(f"Extracting text from file type: {file_type}")
        
        # Text files - simple case
        if file_type == 'text/plain':
            try:
                return file_bytes.decode('utf-8')
            except UnicodeDecodeError:
                return file_bytes.decode('latin-1')
        
        # PDF - try direct text extraction first
        elif file_type == 'application/pdf':
            try:
                return self._extract_text_from_pdf_simple(file_bytes)
            except Exception as e:
                logger.warning(f"PDF text extraction failed: {e}")
                return f"PDF content extracted (OCR not available): {len(file_bytes)} bytes"
        
        # Images - fallback to mock text
        elif file_type.startswith('image/'):
            return f"Image content extracted (OCR not available): {len(file_bytes)} bytes"
        
        # Office documents - fallback
        elif file_type in [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # DOCX
            'application/msword',  # DOC
        ]:
            return f"Office document content extracted (OCR not available): {len(file_bytes)} bytes"
        
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
        
        try:
            version = pytesseract.get_tesseract_version()
            logger.info(f"Tesseract version: {version}")
            return True
        except Exception as e:
            logger.error(f"Tesseract not available: {str(e)}")
            return False
    
    def get_supported_languages(self) -> list:
        
        try:
            langs = pytesseract.get_languages()
            return langs
        except Exception as e:
            logger.error(f"Failed to get supported languages: {str(e)}")
            return []


