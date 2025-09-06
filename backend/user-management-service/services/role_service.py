from typing import List, Dict, Any, Optional
from schemas.role import RoleEnum, PermissionEnum, RoleDetail

class RoleService:
    """
    Service để quản lý logic role và permission
    Đồng bộ với frontend role system
    """
    
    _roles_config: Dict[RoleEnum, Dict[str, Any]] = {
        RoleEnum.ADMIN: {
            "name": "Quản trị viên",
            "description": "Có toàn quyền trong hệ thống",
            "permissions": [
                PermissionEnum.CAN_UPLOAD,
                PermissionEnum.CAN_APPROVE,
                PermissionEnum.CAN_MANAGE_USERS,
                PermissionEnum.CAN_VIEW_ANALYTICS,
                PermissionEnum.CAN_SIGN,
                PermissionEnum.CAN_APPROVE_USERS
            ],
            "approval_level": 4,
            "max_contract_value": 999999999999999  # Long.MAX_VALUE equivalent
        },
        RoleEnum.DIRECTOR: {
            "name": "Giám đốc",
            "description": "Lãnh đạo cấp cao phê duyệt hợp đồng giá trị lớn",
            "permissions": [
                PermissionEnum.CAN_UPLOAD,
                PermissionEnum.CAN_APPROVE,
                PermissionEnum.CAN_VIEW_ANALYTICS,
                PermissionEnum.CAN_SIGN,
                PermissionEnum.CAN_APPROVE_USERS
            ],
            "approval_level": 3,
            "max_contract_value": 1_000_000_000  # 1 tỷ VNĐ
        },
        RoleEnum.MANAGER: {
            "name": "Quản lý",
            "description": "Quản lý và phê duyệt hợp đồng",
            "permissions": [
                PermissionEnum.CAN_UPLOAD,
                PermissionEnum.CAN_APPROVE,
                PermissionEnum.CAN_VIEW_ANALYTICS,
                PermissionEnum.CAN_SIGN
            ],
            "approval_level": 2,
            "max_contract_value": 1_000_000_000  # 1 tỷ VNĐ
        },
        RoleEnum.LEGAL: {
            "name": "Pháp chế",
            "description": "Chuyên gia pháp lý kiểm tra hợp đồng",
            "permissions": [
                PermissionEnum.CAN_UPLOAD,
                PermissionEnum.CAN_APPROVE,
                PermissionEnum.CAN_VIEW_ANALYTICS,
                PermissionEnum.CAN_SIGN
            ],
            "approval_level": 2,
            "max_contract_value": 1_000_000_000  # 1 tỷ VNĐ
        },
        RoleEnum.FINANCE: {
            "name": "Tài chính",
            "description": "Chuyên gia tài chính kiểm tra hợp đồng",
            "permissions": [
                PermissionEnum.CAN_UPLOAD,
                PermissionEnum.CAN_APPROVE,
                PermissionEnum.CAN_VIEW_ANALYTICS,
                PermissionEnum.CAN_SIGN
            ],
            "approval_level": 2,
            "max_contract_value": 1_000_000_000  # 1 tỷ VNĐ
        },
        RoleEnum.EMPLOYEE: {
            "name": "Nhân viên",
            "description": "Người dùng cơ bản tải lên hợp đồng",
            "permissions": [
                PermissionEnum.CAN_UPLOAD
            ],
            "approval_level": 1,
            "max_contract_value": 0
        }
    }
    
    @staticmethod
    def get_all_roles_details() -> List[RoleDetail]:
        """
        Lấy tất cả thông tin chi tiết về các role
        """
        return [
            RoleService.get_role_details(role_enum)
            for role_enum in RoleEnum
        ]
    
    @staticmethod
    def get_role_details(role_name: RoleEnum) -> Optional[RoleDetail]:
        """
        Lấy thông tin chi tiết về một role cụ thể
        """
        config = RoleService._roles_config.get(role_name)
        if config:
            return RoleDetail(
                id=role_name,
                name=config["name"],
                description=config["description"],
                permissions=config["permissions"],
                approval_level=config["approval_level"],
                max_contract_value=config["max_contract_value"]
            )
        return None
    
    @staticmethod
    def get_permissions_for_role(role_name: RoleEnum) -> List[PermissionEnum]:
        """
        Lấy danh sách permissions cho một role
        """
        config = RoleService._roles_config.get(role_name)
        return config["permissions"] if config else []
    
    @staticmethod
    def get_approval_level_for_role(role_name: RoleEnum) -> int:
        """
        Lấy approval level cho một role
        """
        config = RoleService._roles_config.get(role_name)
        return config["approval_level"] if config else 1
    
    @staticmethod
    def get_max_contract_value_for_role(role_name: RoleEnum) -> int:
        """
        Lấy max contract value cho một role
        """
        config = RoleService._roles_config.get(role_name)
        return config["max_contract_value"] if config else 0
