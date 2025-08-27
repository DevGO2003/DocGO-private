import os
import hashlib
import uuid
import base64
import unicodedata
from datetime import datetime, timedelta
from typing import Optional, List, BinaryIO
import boto3
from botocore.exceptions import ClientError
import filetype
import aiofiles
from fastapi import HTTPException, UploadFile

from schemas.file import FileStatus, FileType, FileInfo, FileVersion, MalwareScanResult
from services.malware_scanner import MalwareScanner
from config import get_s3_client, get_bucket_name, is_s3_enabled, UPLOAD_DIR, S3_KEY_STYLE, is_s3_metadata_minimal, is_s3_sanitize_keys

class FileStorageService:
    def __init__(self):
        self.s3_client = get_s3_client()
        self.bucket_name = get_bucket_name()
        self.malware_scanner = MalwareScanner()
        
    def _generate_file_id(self) -> str:
        """Tạo ID duy nhất cho file"""
        return str(uuid.uuid4())
    
    def _get_file_type(self, filename: str, content: bytes) -> FileType:
        """Xác định loại file dựa trên extension và magic bytes"""
        # Kiểm tra extension trước
        ext = filename.lower().split('.')[-1] if '.' in filename else ''
        
        if ext == 'pdf':
            return FileType.PDF
        elif ext in ['docx', 'doc']:
            return FileType.DOCX
        elif ext == 'txt':
            return FileType.TXT
        elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp']:
            return FileType.IMAGE
        
        # Sử dụng filetype để kiểm tra content
        try:
            file_info = filetype.guess(content)
            if file_info:
                mime_type = file_info.mime
                if 'pdf' in mime_type:
                    return FileType.PDF
                elif 'word' in mime_type or 'document' in mime_type:
                    return FileType.DOCX
                elif 'text' in mime_type:
                    return FileType.TXT
                elif 'image' in mime_type:
                    return FileType.IMAGE
        except:
            pass
            
        return FileType.OTHER
    
    def _calculate_checksum(self, content: bytes) -> str:
        """Tính MD5 checksum của file"""
        return hashlib.md5(content).hexdigest()
    
    async def upload_file(self, file: UploadFile, user_id: Optional[str], folder: Optional[str] = None) -> FileInfo:
        """Upload file lên S3 với malware scan và versioning"""
        try:
            # Đọc nội dung file
            content = await file.read()
            original_name = file.filename or "unknown"
            if is_s3_sanitize_keys():
                # Chuẩn hóa tên file: thay khoảng trắng bằng _ và bỏ ký tự không an toàn
                import re
                name, ext = os.path.splitext(original_name)
                safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._-")
                original_name = (safe_name or "file") + ext
            folder_prefix = (folder.strip('/') + '/') if folder else ''
            
            # Tạo file ID và thông tin cơ bản
            file_id = self._generate_file_id()
            file_type = self._get_file_type(original_name, content)
            checksum = self._calculate_checksum(content)
            user_id_str = user_id or "public"
            
            # Kiểm tra xem file đã tồn tại chưa (dựa trên checksum)
            existing_file = await self._find_file_by_checksum(checksum, user_id_str)
            if existing_file:
                # Tạo version mới
                version = existing_file.version + 1
                if S3_KEY_STYLE == "simple":
                    file_key = f"{folder_prefix}{original_name}"
                else:
                    file_key = f"{folder_prefix}users/{user_id_str}/files/{existing_file.file_id}/v{version}/{original_name}"
            else:
                version = 1
                if S3_KEY_STYLE == "simple":
                    file_key = f"{folder_prefix}{original_name}"
                else:
                    file_key = f"{folder_prefix}users/{user_id_str}/files/{file_id}/v{version}/{original_name}"
            
            if is_s3_enabled():
                # Upload lên S3/Filebase
                safe_content_type = file.content_type or "application/octet-stream"
                # original_name đã chuẩn hóa bên trên
                # Chuẩn hóa metadata về ASCII để phù hợp yêu cầu của S3
                ascii_name = (
                    unicodedata.normalize('NFKD', original_name)
                    .encode('ascii', 'ignore')
                    .decode('ascii')
                ) or "unknown"
                b64_name = base64.b64encode(original_name.encode('utf-8')).decode('ascii')
                try:
                    put_kwargs = {
                        'Bucket': self.bucket_name,
                        'Key': file_key,
                        'Body': content,
                        'ContentType': safe_content_type,
                    }
                    if not is_s3_metadata_minimal():
                        put_kwargs['Metadata'] = {
                            'user_id': user_id_str,
                            'original_filename': ascii_name,
                            'original_filename_b64': b64_name,
                            'file_type': str(file_type.value),
                            'checksum': str(checksum),
                            'version': str(version),
                            'upload_time': datetime.utcnow().isoformat()
                        }
                    self.s3_client.put_object(**put_kwargs)
                except ClientError as e:
                    err = e.response.get('Error', {}) if hasattr(e, 'response') else {}
                    code = err.get('Code')
                    message = err.get('Message')
                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"S3 PutObject failed: code={code}, message={message}, "
                            f"bucket={self.bucket_name}, key={file_key}"
                        )
                    )
            else:
                # Lưu local để test offline
                if S3_KEY_STYLE == "simple":
                    local_dir = os.path.join(UPLOAD_DIR, *(folder_prefix[:-1].split('/') if folder_prefix else []))
                else:
                    local_dir = os.path.join(UPLOAD_DIR, *(folder_prefix[:-1].split('/') if folder_prefix else []), 'users', user_id_str, 'files', file_id, f'v{version}')
                os.makedirs(local_dir, exist_ok=True)
                local_path = os.path.join(local_dir, original_name)
                async with aiofiles.open(local_path, 'wb') as f:
                    await f.write(content)
                # Với lưu local, vẫn trả về s3_key tương tự để dùng chung
                file_key = os.path.relpath(local_path, start=UPLOAD_DIR).replace('\\', '/')
            
            # Quét malware (bất đồng bộ)
            malware_result = await self.malware_scanner.scan_file(content)
            
            # Tạo file info
            file_info = FileInfo(
                file_id=file_id if version == 1 else existing_file.file_id,
                filename=original_name,
                file_size=len(content),
                file_type=file_type,
                status=FileStatus.CLEAN if malware_result.is_clean else FileStatus.INFECTED,
                version=version,
                upload_time=datetime.utcnow(),
                last_modified=datetime.utcnow(),
                checksum=checksum,
                malware_scan_result=malware_result.scan_details,
                s3_key=file_key
            )
            
            # Lưu metadata vào database (cần implement)
            await self._save_file_metadata(file_info, user_id_str)
            
            return file_info
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi upload file: {str(e)}")
    
    async def download_file(self, file_id: str, user_id: str, version: int = 1) -> bytes:
        """Download file từ S3"""
        try:
            # Lấy thông tin file từ database
            file_info = await self._get_file_info(file_id, user_id)
            if not file_info:
                raise HTTPException(status_code=404, detail="Không tìm thấy file")
            
            # Tạo key để download
            file_key = f"users/{user_id}/files/{file_id}/v{version}/{file_info.filename}"
            
            # Download từ S3
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=file_key)
            return response['Body'].read()
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise HTTPException(status_code=404, detail="Không tìm thấy file")
            raise HTTPException(status_code=500, detail=f"Lỗi download file: {str(e)}")
    
    def generate_signed_url(self, file_id: str, user_id: str, expiration_minutes: int = 60) -> str:
        """Tạo signed URL để download file"""
        try:
            # Lấy thông tin file
            file_info = self._get_file_info(file_id, user_id)
            if not file_info:
                raise HTTPException(status_code=404, detail="Không tìm thấy file")
            
            # Tạo key
            file_key = f"users/{user_id}/files/{file_id}/v{file_info.version}/{file_info.filename}"
            
            # Tạo signed URL
            signed_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key
                },
                ExpiresIn=expiration_minutes * 60
            )
            
            return signed_url
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi tạo signed URL: {str(e)}")
    
    async def get_file_versions(self, file_id: str, user_id: str) -> List[FileVersion]:
        """Lấy danh sách phiên bản của file"""
        try:
            # Lấy từ database (cần implement)
            versions = await self._get_file_versions_from_db(file_id, user_id)
            return versions
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi lấy phiên bản file: {str(e)}")
    
    async def delete_file(self, file_id: str, user_id: str, version: Optional[int] = None) -> bool:
        """Xóa file hoặc phiên bản cụ thể"""
        try:
            if version:
                # Xóa phiên bản cụ thể
                file_key = f"users/{user_id}/files/{file_id}/v{version}/"
            else:
                # Xóa toàn bộ file và các phiên bản
                file_key = f"users/{user_id}/files/{file_id}/"
            
            # Xóa từ S3
            objects = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix=file_key)
            if 'Contents' in objects:
                for obj in objects['Contents']:
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=obj['Key'])
            
            # Xóa metadata từ database
            await self._delete_file_metadata(file_id, user_id, version)
            
            return True
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi xóa file: {str(e)}")
    
    # Các method helper (cần implement database)
    async def _find_file_by_checksum(self, checksum: str, user_id: str) -> Optional[FileInfo]:
        """Tìm file dựa trên checksum"""
        # TODO: Implement database query
        return None
    
    async def _save_file_metadata(self, file_info: FileInfo, user_id: str):
        """Lưu metadata file vào database"""
        # TODO: Implement database save
        pass
    
    async def _get_file_info(self, file_id: str, user_id: str) -> Optional[FileInfo]:
        """Lấy thông tin file từ database"""
        # TODO: Implement database query
        return None
    
    async def _get_file_versions_from_db(self, file_id: str, user_id: str) -> List[FileVersion]:
        """Lấy phiên bản file từ database"""
        # TODO: Implement database query
        return []
    
    async def _delete_file_metadata(self, file_id: str, user_id: str, version: Optional[int] = None):
        """Xóa metadata file từ database"""
        # TODO: Implement database delete
        pass
