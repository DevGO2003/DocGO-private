from fastapi import APIRouter, Depends
from app.core.gateway_identity import get_current_user, CurrentUser

router = APIRouter(prefix="/api/v1/automation-service/debug")

@router.get("/me")
async def me(user: CurrentUser = Depends(get_current_user)):
    return {
        "userId": user.user_id,
        "username": user.username,
        "roles": user.roles,
        "email": user.email,
    }
