import os
import hashlib
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import UploadFile, HTTPException
import aiofiles
from schemas.file import (
    FileInfo, FileUploadResponse, FileSearchRequest, 
    FileSearchResponse, FileCategory, FileMetadata,
    FileStatus, FileType
)
from config import settings

class FileManagementService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        self.max_file_size = settings.max_file_size
        self.allowed_file_types = settings.allowed_file_types
    
    async def upload_file(
        self, 
        file: UploadFile, 
        category: Optional[str] = None,
        tags: List[str] = [],
        description: Optional[str] = None
    ) -> FileUploadResponse:
        """Upload file và lưu metadata"""
        try:
            # Validate file
            if file.size > self.max_file_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File quá lớn. Kích thước tối đa: {self.max_file_size // (1024*1024)}MB"
                )
            
            # Validate file type
            file_extension = file.filename.split('.')[-1].lower()
            if file_extension not in self.allowed_file_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"Loại file không được hỗ trợ. Loại được hỗ trợ: {', '.join(self.allowed_file_types)}"
                )
            
            # Generate file ID và path
            file_id = str(uuid.uuid4())
            timestamp = datetime.now().strftime("%Y%m%d")
            file_path = os.path.join(self.upload_dir, timestamp, f"{file_id}_{file.filename}")
            
            # Create directory if not exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Calculate checksum
            checksum = hashlib.md5(content).hexdigest()
            
            # Create file info
            file_info = FileInfo(
                file_id=file_id,
                filename=file.filename,
                file_size=file.size,
                file_type=self._get_file_type(file_extension),
                mime_type=file.content_type or "application/octet-stream",
                status=FileStatus.ACTIVE,
                metadata=FileMetadata(
                    title=file.filename,
                    description=description,
                    tags=tags,
                    category=category
                ),
                file_path=file_path,
                checksum=checksum,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                created_by="system",  # TODO: Get from auth context
                system_id="docgo",
                version=1
            )
            
            # TODO: Save to database
            # await self._save_file_to_db(file_info)
            
            return FileUploadResponse(
                file_id=file_id,
                filename=file.filename,
                file_size=file.size,
                status=FileStatus.ACTIVE,
                upload_time=datetime.utcnow(),
                message="File đã được upload thành công"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi upload file: {str(e)}"
            )
    
    async def get_files(
        self,
        page_number: int = 0,
        page_size: int = 10,
        category: Optional[str] = None,
        search_term: Optional[str] = None,
        sort_by: str = "created_at",
        sort_direction: str = "desc"
    ) -> List[FileInfo]:
        """Lấy danh sách file với phân trang và lọc"""
        try:
            # TODO: Implement database query with pagination
            # For now, return mock data
            mock_files = [
                FileInfo(
                    file_id="mock-1",
                    filename="sample.pdf",
                    file_size=1024000,
                    file_type=FileType.PDF,
                    mime_type="application/pdf",
                    status=FileStatus.ACTIVE,
                    metadata=FileMetadata(
                        title="Sample PDF",
                        description="A sample PDF file",
                        tags=["sample", "pdf"],
                        category="documents"
                    ),
                    file_path="/uploads/20241201/mock-1_sample.pdf",
                    checksum="mock-checksum",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    created_by="system",
                    system_id="docgo",
                    version=1
                )
            ]
            
            return mock_files
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi lấy danh sách file: {str(e)}"
            )
    
    async def get_file_info(self, file_id: str) -> Optional[FileInfo]:
        """Lấy thông tin chi tiết file"""
        try:
            # TODO: Implement database query
            # For now, return mock data
            if file_id == "mock-1":
                return FileInfo(
                    file_id="mock-1",
                    filename="sample.pdf",
                    file_size=1024000,
                    file_type=FileType.PDF,
                    mime_type="application/pdf",
                    status=FileStatus.ACTIVE,
                    metadata=FileMetadata(
                        title="Sample PDF",
                        description="A sample PDF file",
                        tags=["sample", "pdf"],
                        category="documents"
                    ),
                    file_path="/uploads/20241201/mock-1_sample.pdf",
                    checksum="mock-checksum",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    created_by="system",
                    system_id="docgo",
                    version=1
                )
            return None
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi lấy thông tin file: {str(e)}"
            )
    
    async def update_file_metadata(self, file_id: str, metadata: FileMetadata) -> bool:
        """Cập nhật metadata của file"""
        try:
            # TODO: Implement database update
            # For now, return True
            return True
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi cập nhật metadata: {str(e)}"
            )
    
    async def delete_file(self, file_id: str) -> bool:
        """Xóa file (soft delete)"""
        try:
            # TODO: Implement soft delete in database
            # For now, return True
            return True
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi xóa file: {str(e)}"
            )
    
    async def get_categories(self) -> List[FileCategory]:
        """Lấy danh sách danh mục file"""
        try:
            # TODO: Implement database query
            # For now, return mock data
            return [
                FileCategory(
                    id="cat-1",
                    name="Documents",
                    description="Tài liệu văn bản",
                    parent_id=None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                FileCategory(
                    id="cat-2",
                    name="Images",
                    description="Hình ảnh",
                    parent_id=None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
            ]
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi lấy danh sách danh mục: {str(e)}"
            )
    
    async def search_files(self, search_request: FileSearchRequest) -> FileSearchResponse:
        """Tìm kiếm file"""
        try:
            # TODO: Implement search logic
            # For now, return mock data
            mock_files = [
                FileInfo(
                    file_id="search-1",
                    filename="search_result.pdf",
                    file_size=512000,
                    file_type=FileType.PDF,
                    mime_type="application/pdf",
                    status=FileStatus.ACTIVE,
                    metadata=FileMetadata(
                        title="Search Result",
                        description="A search result file",
                        tags=["search", "result"],
                        category="documents"
                    ),
                    file_path="/uploads/20241201/search-1_search_result.pdf",
                    checksum="search-checksum",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    created_by="system",
                    system_id="docgo",
                    version=1
                )
            ]
            
            return FileSearchResponse(
                files=mock_files,
                total_count=1,
                page_number=search_request.page_number,
                page_size=search_request.page_size,
                total_pages=1,
                search_time_ms=50.0,
                suggestions=["pdf", "document", "file"]
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Lỗi khi tìm kiếm file: {str(e)}"
            )
    
    def _get_file_type(self, extension: str) -> FileType:
        """Xác định loại file từ extension"""
        extension_map = {
            'pdf': FileType.PDF,
            'docx': FileType.DOCX,
            'txt': FileType.TXT,
            'jpg': FileType.IMAGE,
            'jpeg': FileType.IMAGE,
            'png': FileType.IMAGE,
            'gif': FileType.IMAGE,
            'xlsx': FileType.SPREADSHEET,
            'xls': FileType.SPREADSHEET,
            'pptx': FileType.PRESENTATION,
            'ppt': FileType.PRESENTATION
        }
        return extension_map.get(extension, FileType.OTHER)
