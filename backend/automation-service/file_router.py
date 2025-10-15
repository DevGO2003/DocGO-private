

from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Response
from fastapi.responses import StreamingResponse
from typing import List, Optional
import io
import uuid
from datetime import datetime

from schemas.file_schemas import FileUploadResponse, FileDownloadResponse, FileListResponse, FileDetailsResponse
from schemas.response import RestResponse
from schemas.view_schemas import ViewType, ViewMapper, PaginatedViewResponse
from services.file_service import FileStorageService

# Create router
router = APIRouter(prefix="/api/v1/automation-service/files", tags=["APIs Quản lý File"])

# Initialize file service
file_service = FileStorageService()


@router.post("", summary="Upload file", response_model=RestResponse[FileUploadResponse])
async def upload_file(
    file: UploadFile = File(...),
    folder: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None)
):
    try:
        response = file_service.upload_file(file, folder, user_id)
        return RestResponse(
            apiVersion="v1",
            statusCode=201,
            shortMessage="Created",
            data=response,
            timestamp=response.upload_time.isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files"
        )


@router.get("/{file_id}/download", summary="Download file")
async def download_file(
    file_id: str,
    user_id: Optional[str] = Query(None),
    version: Optional[int] = Query(None)
):
    
    try:
        response = file_service.download_file(file_id, user_id, version)
        
        # Create streaming response
        file_stream = io.BytesIO(response.file_content)
        
        return StreamingResponse(
            io.BytesIO(response.file_content),
            media_type=response.content_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{response.filename}\"",
                "Content-Length": str(response.file_size)
            }
        )
    except HTTPException as e:
        raise e


@router.get("", summary="Danh sách files với projection", response_model=RestResponse[PaginatedViewResponse])
async def get_all_files(
    view: str = Query("table"),
    page_number: int = Query(0),
    page_size: int = Query(10),
    sort_by: Optional[List[str]] = Query(None),
    sort_direction: Optional[List[str]] = Query(None),
    include_deleted: bool = Query(False)
):
    
    try:
        # Validate view type
        try:
            view_type = ViewType(view.lower())
        except ValueError:
            view_type = ViewType.TABLE
        
        # Get files from service
        response = file_service.get_all_files(page_number, page_size, sort_by, sort_direction, include_deleted)
        
        # Map files to view
        view_items = []
        for file_data in response.files:
            # Convert file data to dict if needed
            if hasattr(file_data, 'dict'):
                file_dict = file_data.dict()
            else:
                file_dict = file_data
            
            # Map to view
            view_item = ViewMapper.map_file_to_view(file_dict, view_type)
            view_items.append(view_item)
        
        # Create paginated view response
        paginated_response = PaginatedViewResponse(
            view=view_type.value,
            items=view_items,
            pagination={
                "page": response.current_page,
                "size": response.page_size,
                "totalElements": response.total_elements,
                "totalPages": response.total_pages
            }
        )
        
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data=paginated_response,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files"
        )


@router.get("/{file_id}", summary="Chi tiết file", response_model=RestResponse[dict])
async def get_file_details(
    file_id: str
):
    
    try:
        response = file_service.get_file_details(file_id)
        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data=response,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )


@router.delete("/{file_id}", summary="Xóa file", response_model=RestResponse[dict])
async def delete_file(
    file_id: str,
    user_id: Optional[str] = Query(None),
    version: Optional[int] = Query(None)
):
    
    try:
        result = file_service.delete_file(file_id, user_id, version)
        response = {"success": result}
        statusCode=200,
            shortMessage="Success",
            data=response,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )
    except HTTPException as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=e.status_code,
            shortMessage="Error",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path=f"/api/v1/automation-service/files/{file_id}"
        )


@router.get("/check-version", summary="Kiểm tra version conflict", response_model=RestResponse[dict])
async def check_file_version(
    filename: str = Query(...),
    file_size: int = Query(...),
    last_modified: Optional[str] = Query(None)
):
    
    try:
        existing_files = await file_service.get_files_by_name(filename)
        if not existing_files:
            return RestResponse[dict](
                apiVersion="v1",
                statusCode=200,
                shortMessage="Success", co the upload an toan",
                data={
                    "hasConflict": False,
                    "existingFile": None,
                    "currentFile": {
                        "filename": filename,
                        "size": file_size,
                        "lastModified": last_modified
                    },
                    "conflictType": "none",
                    "message": "File moi, khong co xung dot version"
                },
                timestamp=datetime.now().isoformat(),
                requestId=str(uuid.uuid4()),
                path="/api/v1/automation-service/files/check-version"
            )
        latest_file = max(existing_files, key=lambda x: x.get('created_at', ''))
        size_conflict = latest_file.get('size', 0) != file_size
        timestamp_conflict = False
        if last_modified and latest_file.get('last_modified'):
            try:
                from datetime import datetime as _dt
                current_time = _dt.fromisoformat(last_modified.replace('Z', '+00:00'))
                existing_time = _dt.fromisoformat(latest_file['last_modified'].replace('Z', '+00:00'))
                timestamp_conflict = current_time < existing_time
            except:
                timestamp_conflict = False
        conflict_type = "none"
        if size_conflict and timestamp_conflict:
            conflict_type = "both"
        elif size_conflict:
            conflict_type = "size"
        elif timestamp_conflict:
            conflict_type = "timestamp"
        has_conflict = conflict_type != "none"
        if has_conflict:
            if conflict_type == "size":
                message = f"File '{filename}' da ton tai voi kich thuoc khac ({latest_file.get('size', 0)} bytes vs {file_size} bytes)"
            elif conflict_type == "timestamp":
                message = f"File '{filename}' da ton tai voi thoi gian sua doi moi hon"
            else:
                message = f"File '{filename}' da ton tai voi ca kich thuoc va thoi gian sua doi khac"
        else:
            message = f"File '{filename}' da ton tai nhung khong co xung dot version"
        return RestResponse[dict](
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data={
                "hasConflict": has_conflict,
                "existingFile": {
                    "id": latest_file.get('id', ''),
                    "filename": latest_file.get('filename', ''),
                    "size": latest_file.get('size', 0),
                    "lastModified": latest_file.get('last_modified', ''),
                    "version": latest_file.get('version', '1.0')
                },
                "currentFile": {
                    "filename": filename,
                    "size": file_size,
                    "lastModified": last_modified
                },
                "conflictType": conflict_type,
                "message": message
            },
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/check-version"
        )
    except Exception as e:
        return RestResponse[dict](
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error")}",
            data=None,
            timestamp=datetime.now().isoformat(),
            requestId=str(uuid.uuid4()),
            path="/api/v1/automation-service/files/check-version"
        )


