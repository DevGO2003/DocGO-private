import httpx
import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import logging
from datetime import datetime

load_dotenv()

logger = logging.getLogger(__name__)

class IdentityService:
    """Service to interact with Identity Service for role synchronization"""
    
    def __init__(self):
        self.base_url = os.getenv('IDENTITY_SERVICE_URL', 'http://localhost:8080')
        self.api_key = os.getenv('IDENTITY_SERVICE_API_KEY', '')
        self.timeout = 30.0
    
    async def get_user_roles(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user roles from Identity Service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                response = await client.get(
                    f"{self.base_url}/api/v1/users/{user_id}/roles",
                    headers=headers
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(f"User {user_id} not found in Identity Service")
                    return []
                else:
                    logger.error(f"Error getting user roles: {response.status_code} - {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error calling Identity Service: {e}")
            return []
    
    async def update_user_roles(self, user_id: int, roles: List[str]) -> bool:
        """Update user roles in Identity Service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                payload = {
                    'user_id': user_id,
                    'roles': roles
                }
                
                response = await client.put(
                    f"{self.base_url}/api/v1/users/{user_id}/roles",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    logger.info(f"Updated roles for user {user_id}: {roles}")
                    return True
                else:
                    logger.error(f"Error updating user roles: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error calling Identity Service: {e}")
            return False
    
    async def sync_user_approval_status(self, user_id: int, status: str, system_id: str) -> bool:
        """Sync user approval status with Identity Service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                payload = {
                    'user_id': user_id,
                    'approval_status': status,
                    'system_id': system_id,
                    'timestamp': str(datetime.utcnow())
                }
                
                response = await client.post(
                    f"{self.base_url}/api/v1/users/{user_id}/approval-status",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    logger.info(f"Synced approval status for user {user_id}: {status}")
                    return True
                else:
                    logger.error(f"Error syncing approval status: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error calling Identity Service: {e}")
            return False
    
    async def get_system_roles(self, system_id: str) -> List[Dict[str, Any]]:
        """Get available roles for a system from Identity Service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                response = await client.get(
                    f"{self.base_url}/api/v1/systems/{system_id}/roles",
                    headers=headers
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Error getting system roles: {response.status_code} - {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error calling Identity Service: {e}")
            return []
    
    async def validate_user_permission(self, user_id: int, permission: str, system_id: str) -> bool:
        """Validate if user has specific permission in a system"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                params = {
                    'permission': permission,
                    'system_id': system_id
                }
                
                response = await client.get(
                    f"{self.base_url}/api/v1/users/{user_id}/permissions/validate",
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get('has_permission', False)
                else:
                    logger.error(f"Error validating user permission: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error calling Identity Service: {e}")
            return False

# Create global identity service instance
identity_service = IdentityService()
