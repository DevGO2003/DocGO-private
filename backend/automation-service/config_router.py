from fastapi import APIRouter, Request
import os
from datetime import datetime, timezone
import uuid
from config import Config
from schemas.response import RestResponse

router = APIRouter(prefix="/api/v1/automation-service/config", tags=["APIs Kiểm tra Hệ thống"])


@router.get("", summary="Lấy cấu hình hệ thống (Gemini + S3)")
async def get_system_config(request: Request):
    try:
        # Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

        # S3
        s3_enabled = os.getenv("S3_ENABLED", "false").lower() == "true"
        s3_bucket = os.getenv("S3_BUCKET", "devgo2003-docgo-bucket")
        s3_endpoint = os.getenv("S3_ENDPOINT", "https://s3.filebase.com")
        s3_region = os.getenv("S3_REGION", "us-east-1")
        s3_access_key = os.getenv("S3_ACCESS_KEY_ID", "")
        s3_secret_key = os.getenv("S3_SECRET_ACCESS_KEY", "")

        # Services
        service_name = os.getenv("SERVICE_NAME", "automation-service")
        host = os.getenv("HOST", "0.0.0.0")
        port = os.getenv("PORT", "8003")
        debug = os.getenv("DEBUG", "false")

        # Kafka / Redis
        kafka_servers = Config.KAFKA_BOOTSTRAP_SERVERS
        kafka_group_id = os.getenv("KAFKA_GROUP_ID", "automation-service")
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = os.getenv("REDIS_PORT", "6379")
        redis_db = os.getenv("REDIS_DB", "0")

        # File storage
        base_url = Config.get_base_url()
        upload_directory = os.getenv("UPLOAD_DIR", "uploads")
        max_file_size = os.getenv("MAX_FILE_SIZE", "104857600")

        data = {
            "gemini": {
                "api_key": {
                    "exists": api_key is not None,
                    "length": len(api_key) if api_key else 0,
                    "masked": f"{api_key[:8]}...{api_key[-4:]}" if api_key and len(api_key) > 12 else ("N/A" if not api_key else api_key),
                    "status": "CONFIGURED" if api_key else "NOT_CONFIGURED"
                },
                "model": model,
                "status": "READY" if api_key else "NOT_CONFIGURED"
            },
            "s3": {
                "enabled": s3_enabled,
                "bucket": s3_bucket,
                "endpoint": s3_endpoint,
                "region": s3_region,
                "credentials": {
                    "access_key": {
                        "exists": bool(s3_access_key),
                        "length": len(s3_access_key) if s3_access_key else 0,
                        "masked": f"{s3_access_key[:8]}...{s3_access_key[-4:]}" if s3_access_key and len(s3_access_key) > 12 else ("N/A" if not s3_access_key else s3_access_key),
                        "status": "CONFIGURED" if s3_access_key else "NOT_CONFIGURED"
                    },
                    "secret_key": {
                        "exists": bool(s3_secret_key),
                        "length": len(s3_secret_key) if s3_secret_key else 0,
                        "masked": f"{s3_secret_key[:8]}...{s3_secret_key[-4:]}" if s3_secret_key and len(s3_secret_key) > 12 else ("N/A" if not s3_secret_key else s3_secret_key),
                        "status": "CONFIGURED" if s3_secret_key else "NOT_CONFIGURED"
                    }
                },
                "status": "READY" if s3_enabled and s3_access_key and s3_secret_key else "NOT_CONFIGURED"
            },
            "service": {
                "name": service_name,
                "host": host,
                "port": port,
                "debug": debug.lower() == "true",
                "version": "2.0.0"
            },
            "kafka": {
                "bootstrap_servers": kafka_servers,
                "group_id": kafka_group_id,
                "status": "CONFIGURED"
            },
            "redis": {
                "host": redis_host,
                "port": redis_port,
                "database": redis_db,
                "status": "CONFIGURED"
            },
            "file_storage": {
                "base_url": base_url,
                "upload_directory": upload_directory,
                "max_file_size": max_file_size,
                "s3_enabled": s3_enabled,
                "status": "CONFIGURED"
            },
            "system": {
                "python_path": os.getcwd(),
                "environment": os.getenv("NODE_ENV", "development"),
                "env_files": {
                    "dotenv_loaded": True,
                    "env_exists": os.path.exists("env/.env"),
                    "env_example_exists": os.path.exists("env/.env.example")
                }
            }
        }

        return RestResponse(
            apiVersion="v1",
            statusCode=200,
            shortMessage="Success",
            data=data,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )
    except Exception as e:
        return RestResponse(
            apiVersion="v1",
            statusCode=500,
            shortMessage="Internal Server Error",
            data=None,
            timestamp=datetime.now(timezone.utc).isoformat(),
            requestId=str(uuid.uuid4()),
            path=str(request.url)
        )





