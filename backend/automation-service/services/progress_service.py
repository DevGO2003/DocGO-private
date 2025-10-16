import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any

import redis.asyncio as redis

from config import Config


class ProgressService:
    def __init__(self) -> None:
        self.redis_url = Config.get_redis_url()
        self.redis_password = Config.get_redis_password()
        self.redis_db = Config.get_redis_db()
        self._client: Optional[redis.Redis] = None

    async def initialize(self) -> None:
        params = {"url": self.redis_url, "db": self.redis_db}
        if self.redis_password:
            params["password"] = self.redis_password
        self._client = redis.from_url(**params)

    async def close(self) -> None:
        if self._client:
            await self._client.close()

    def _key(self, job_id: str) -> str:
        return f"event:{job_id}"

    async def init_job(self, job_id: str, total: int) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        value = {
            "total": int(total),
            "completed": 0,
            "failed": 0,
            "percent": 0,
            "step": "queued",
            "updatedAt": now
        }
        await self._client.set(self._key(job_id), json.dumps(value))
        return value

    async def update_progress(
        self,
        job_id: str,
        *,
        completed_delta: int = 0,
        failed_delta: int = 0,
        step: Optional[str] = None,
        percent: Optional[int] = None,
    ) -> Dict[str, Any]:
        raw = await self._client.get(self._key(job_id))
        current = json.loads(raw) if raw else {}
        if completed_delta:
            current["completed"] = int(current.get("completed", 0)) + int(completed_delta)
        if failed_delta:
            current["failed"] = int(current.get("failed", 0)) + int(failed_delta)
        if step is not None:
            current["step"] = step
        if percent is None and current.get("total"):
            total = int(current.get("total", 1))
            current["percent"] = int(round((int(current.get("completed", 0)) * 100) / total))
        else:
            if percent is not None:
                current["percent"] = int(percent)
        current["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await self._client.set(self._key(job_id), json.dumps(current))
        return current

    async def get_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        raw = await self._client.get(self._key(job_id))
        return json.loads(raw) if raw else None


