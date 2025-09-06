from enum import Enum
from pydantic import BaseModel, Field
from typing import List

class RoleEnum(str, Enum):
    """
    Vai trò người dùng trong hệ thống DocGO
    Đồng bộ với frontend và Java backend
    """
    ADMIN = "admin"
    DIRECTOR = "director"
    MANAGER = "manager"
    LEGAL = "legal"
    FINANCE = "finance"
    EMPLOYEE = "employee"

class PermissionEnum(str, Enum):
    """
    Các quyền hạn cụ thể của người dùng
    Đồng bộ với frontend permission system
    """
    CAN_UPLOAD = "canUpload"
    CAN_APPROVE = "canApprove"
    CAN_MANAGE_USERS = "canManageUsers"
    CAN_VIEW_ANALYTICS = "canViewAnalytics"
    CAN_SIGN = "canSign"
    CAN_APPROVE_USERS = "canApproveUsers"

class RoleDetail(BaseModel):
    """
    Chi tiết về vai trò và quyền hạn
    """
    id: RoleEnum
    name: str
    description: str
    permissions: List[PermissionEnum]
    approval_level: int
    max_contract_value: int  # in VND
