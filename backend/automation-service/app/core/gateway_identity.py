from fastapi import Header, HTTPException
from typing import Optional, List

class CurrentUser:
    def __init__(self, user_id: str, username: Optional[str], email: Optional[str], roles: List[str]):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.roles = roles

async def get_current_user(
    x_user_id: Optional[str] = Header(None, convert_underscores=False),
    x_username: Optional[str] = Header(None, convert_underscores=False),
    x_user_email: Optional[str] = Header(None, convert_underscores=False),
    x_user_roles: Optional[str] = Header(None, convert_underscores=False),
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id")
    roles = [r.strip() for r in (x_user_roles or "").split(",") if r.strip()]
    return CurrentUser(user_id=x_user_id, username=x_username, email=x_user_email, roles=roles)
