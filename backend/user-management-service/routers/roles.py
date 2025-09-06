from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from schemas.role import RoleEnum, PermissionEnum, RoleDetail
from schemas.response import RestResponse
from services.role_service import RoleService
from services.user_service import UserService
from schemas.user import UserProfileResponse

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])

@router.get("/", response_model=RestResponse[List[RoleDetail]])
async def get_all_roles():
    """
    🔹 Đầu vào
    Không có tham số đầu vào.

    🔹 Đầu ra
    📝 data
    Loại: List[RoleDetail]
    Mô tả: Danh sách tất cả các vai trò và quyền hạn của chúng.
    """
    roles = RoleService.get_all_roles_details()
    return RestResponse[List[RoleDetail]](
        statusCode=200,
        shortMessage="Success",
        description="Danh sách vai trò đã được lấy thành công.",
        data=roles,
        path="/api/v1/user-management-service/roles/"
    )

@router.get("/{role_name}", response_model=RestResponse[RoleDetail])
async def get_role_details(
    role_name: RoleEnum = Path(..., description="Tên vai trò")
):
    """
    🔹 Đầu vào
    📄 role_name (bắt buộc, path)
    Loại: RoleEnum
    Mô tả: Tên vai trò cần lấy thông tin chi tiết.

    🔹 Đầu ra
    📝 data
    Loại: RoleDetail
    Mô tả: Thông tin chi tiết về vai trò và các quyền hạn của nó.
    """
    role_detail = RoleService.get_role_details(role_name)
    if not role_detail:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return RestResponse[RoleDetail](
        statusCode=200,
        shortMessage="Success",
        description=f"Thông tin chi tiết vai trò '{role_name.value}' đã được lấy thành công.",
        data=role_detail,
        path=f"/api/v1/user-management-service/roles/{role_name.value}"
    )

@router.put("/users/{user_id}/role", response_model=RestResponse[UserProfileResponse])
async def update_user_role(
    user_id: int,
    new_role: RoleEnum,
    db: Session = Depends(get_db)
):
    """
    🔹 Đầu vào
    🆔 user_id (bắt buộc, path)
    Loại: integer
    Mô tả: ID của người dùng cần cập nhật vai trò.

    📄 new_role (bắt buộc, body)
    Loại: RoleEnum
    Mô tả: Vai trò mới cho người dùng.

    🔹 Đầu ra
    📝 data
    Loại: UserProfileResponse
    Mô tả: Thông tin người dùng đã được cập nhật vai trò.
    """
    updated_user = UserService.update_user_role(db, user_id, new_role)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return RestResponse[UserProfileResponse](
        statusCode=200,
        shortMessage="Success",
        description=f"Vai trò của người dùng {user_id} đã được cập nhật thành '{new_role.value}'.",
        data=updated_user,
        path=f"/api/v1/user-management-service/roles/users/{user_id}/role"
    )

@router.get("/users/{user_id}/role", response_model=RestResponse[RoleEnum])
async def get_user_role(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    🔹 Đầu vào
    🆔 user_id (bắt buộc, path)
    Loại: integer
    Mô tả: ID của người dùng cần lấy vai trò.

    🔹 Đầu ra
    📝 data
    Loại: RoleEnum
    Mô tả: Vai trò hiện tại của người dùng.
    """
    user_profile = UserService.get_user_profile_by_id(db, user_id)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    return RestResponse[RoleEnum](
        statusCode=200,
        shortMessage="Success",
        description=f"Vai trò của người dùng {user_id} đã được lấy thành công.",
        data=user_profile.role,
        path=f"/api/v1/user-management-service/roles/users/{user_id}/role"
    )

@router.get("/users/{user_id}/permissions", response_model=RestResponse[List[PermissionEnum]])
async def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    🔹 Đầu vào
    🆔 user_id (bắt buộc, path)
    Loại: integer
    Mô tả: ID của người dùng cần lấy quyền hạn.

    🔹 Đầu ra
    📝 data
    Loại: List[PermissionEnum]
    Mô tả: Danh sách các quyền hạn của người dùng.
    """
    user_profile = UserService.get_user_profile_by_id(db, user_id)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    permissions = RoleService.get_permissions_for_role(user_profile.role)
    
    return RestResponse[List[PermissionEnum]](
        statusCode=200,
        shortMessage="Success",
        description=f"Quyền hạn của người dùng {user_id} đã được lấy thành công.",
        data=permissions,
        path=f"/api/v1/user-management-service/roles/users/{user_id}/permissions"
    )
