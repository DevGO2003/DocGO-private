import os
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Dict, Any
from botocore.config import Config as BotoConfig
import boto3

# Load .env file
_service_dir = Path(__file__).resolve().parent
_env_file = _service_dir / ".env"

# Load .env if exists (fix indent to avoid runtime errors)
if _env_file.exists():
    load_dotenv(dotenv_path=_env_file, override=False)
    print(f"Loaded .env from {_env_file}")
else:
    # Finally fallback to default lookup (CWD)
    load_dotenv()
    print("Loaded .env from CWD")

# Helpers
def _parse_size_bytes(val: str, default: int) -> int:
    try:
        s = (val or "").strip().lower()
        if s.endswith("kb"): return int(float(s[:-2]) * 1024)
        if s.endswith("mb"): return int(float(s[:-2]) * 1024 * 1024)
        if s.endswith("gb"): return int(float(s[:-2]) * 1024 * 1024 * 1024)
        return int(s)
    except Exception:
        return default


class Config:
    """
    Centralized configuration management for Document Management Service
    Tất cả biến môi trường được quản lý tập trung với fallback values chuẩn hóa
    """
    
    # ==========================================
    # ENVIRONMENT DETECTION
    # ==========================================
    @classmethod
    def is_docker(cls) -> bool:
        """Detect if running in Docker environment"""
        return os.getenv("ENVIRONMENT") in ["docker", "production"]
    
    # ==========================================
    # SERVICE CONFIGURATION
    # ==========================================
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SPRING_PROFILES_ACTIVE: str = os.getenv("SPRING_PROFILES_ACTIVE", "dev")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8002"))
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    
    # ==========================================
    # INFRASTRUCTURE SERVICES (Shared from root .env)
    # ==========================================
    # MongoDB Configuration
    MONGODB_ATLAS_URI: str = os.getenv("MONGODB_ATLAS_URI", "")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", os.getenv("MONGODB_DOCUMENT_DATABASE", "docgo"))
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_DATABASE: int = int(os.getenv("REDIS_DATABASE", "0"))
    
    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
    KAFKA_CLIENT_ID: str = os.getenv("KAFKA_CLIENT_ID", f"{os.getenv('KAFKA_CLIENT_ID_PREFIX', 'docgo')}-document-management")
    KAFKA_GROUP_ID: str = os.getenv("KAFKA_GROUP_ID", f"{os.getenv('KAFKA_GROUP_ID_PREFIX', 'docgo-group')}-document-management")
    SPRING_KAFKA_ENABLED: bool = os.getenv("SPRING_KAFKA_ENABLED", "true").lower() == "true"
    KAFKA_ENABLED: bool = os.getenv("KAFKA_ENABLED", "false").lower() == "true"
    # ==========================================
    # KAFKA TOPICS - CHỈ FILE EVENTS
    # ==========================================
    KAFKA_FILE_UPLOADED_TOPIC: str = os.getenv("KAFKA_FILE_UPLOADED_TOPIC", "file.uploaded")
    KAFKA_FILE_PROCESSED_TOPIC: str = os.getenv("KAFKA_FILE_PROCESSED_TOPIC", "file.processed")
    KAFKA_FILE_UPDATED_TOPIC: str = os.getenv("KAFKA_FILE_UPDATED_TOPIC", "file.updated")
    KAFKA_FILE_CLASSIFIED_TOPIC: str = os.getenv("KAFKA_FILE_CLASSIFIED_TOPIC", "file.classified")
    KAFKA_FILE_ANALYZED_TOPIC: str = os.getenv("KAFKA_FILE_ANALYZED_TOPIC", "file.analyzed")
    KAFKA_FILE_DELETED_TOPIC: str = os.getenv("KAFKA_FILE_DELETED_TOPIC", "file.deleted")
    
    # ==========================================
    # SERVICE URLS (Smart URL building)
    # ==========================================
    @classmethod
    def get_user_service_url(cls) -> str:
        """Get User Management Service URL with smart fallback"""
        return os.getenv("USER_MANAGEMENT_SERVICE_URL", 
                        "http://user-management-service:8001" if cls.is_docker() 
                        else "http://localhost:8001")
    
    @classmethod
    def get_automation_service_url(cls) -> str:
        """Get Automation Service URL with smart fallback"""
        return os.getenv("AUTOMATION_SERVICE_URL", 
                        "http://automation-service:8003" if cls.is_docker() 
                        else "http://localhost:8003")
    
    @classmethod
    def get_ai_service_url(cls) -> str:
        """Get AI Service URL with smart fallback"""
        return os.getenv("AI_SERVICE_URL", 
                        "http://ai-processing-service:8000" if cls.is_docker() 
                        else "http://localhost:8000")
    
    @classmethod
    def get_file_service_url(cls) -> str:
        """Get File Service URL with smart fallback"""
        return os.getenv("FILE_SERVICE_URL", 
                        "http://file-storage-service:8000" if cls.is_docker() 
                        else "http://localhost:8000")
    
    # ==========================================
    # FILE UPLOAD CONFIGURATION
    # ==========================================
    # Use numeric bytes to avoid type errors; default 2GB
    MAX_FILE_SIZE_BYTES: int = _parse_size_bytes(os.getenv("MAX_FILE_SIZE", "2GB"), 2 * 1024 * 1024 * 1024)
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "uploads")
    ALLOWED_FILE_TYPES: List[str] = [x.strip().lower() for x in os.getenv("ALLOWED_FILE_TYPES", "pdf,docx,txt,jpg,jpeg,png,gif").split(",")]
    
    # ==========================================
    # REDIS TOPICS (Service-specific)
    # ==========================================
    REDIS_CONTRACT_SUMMARY_UPDATED_TOPIC: str = os.getenv("REDIS_CONTRACT_SUMMARY_UPDATED_TOPIC", "contract.summary.updated")
    REDIS_CONTRACT_UPDATED_TOPIC: str = os.getenv("REDIS_CONTRACT_UPDATED_TOPIC", "contract.updated")
    REDIS_APPROVAL_CREATED_TOPIC: str = os.getenv("REDIS_APPROVAL_CREATED_TOPIC", "approval.created")
    REDIS_VERSION_CREATED_TOPIC: str = os.getenv("REDIS_VERSION_CREATED_TOPIC", "version.created")
    REDIS_COMMENT_CREATED_TOPIC: str = os.getenv("REDIS_COMMENT_CREATED_TOPIC", "comment.created")
    REDIS_ESIGNATURE_CREATED_TOPIC: str = os.getenv("REDIS_ESIGNATURE_CREATED_TOPIC", "esignature.created")
    REDIS_REMINDER_CREATED_TOPIC: str = os.getenv("REDIS_REMINDER_CREATED_TOPIC", "reminder.created")
    REDIS_AUDIT_LOG_CREATED_TOPIC: str = os.getenv("REDIS_AUDIT_LOG_CREATED_TOPIC", "audit.log.created")
    
    # ==========================================
    # REDIS CONNECTION HELPERS
    # ==========================================
    @classmethod
    def get_redis_url(cls) -> str:
        """Get Redis connection URL"""
        if cls.REDIS_PASSWORD:
            return f"redis://:{cls.REDIS_PASSWORD}@{cls.REDIS_HOST}:{cls.REDIS_PORT}"
        return f"redis://{cls.REDIS_HOST}:{cls.REDIS_PORT}"
    
    @classmethod
    def get_spring_redis_host(cls) -> str:
        """Get Redis host for Spring configuration"""
        return cls.REDIS_HOST
    
    @classmethod
    def get_spring_redis_port(cls) -> int:
        """Get Redis port for Spring configuration"""
        return cls.REDIS_PORT
    
    @classmethod
    def get_spring_redis_password(cls) -> str:
        """Get Redis password for Spring configuration"""
        return cls.REDIS_PASSWORD
    
    @classmethod
    def get_spring_redis_database(cls) -> int:
        """Get Redis database for Spring configuration"""
        return cls.REDIS_DATABASE
    
    # ==========================================
    # MONGODB CONNECTION HELPERS
    # ==========================================
    @classmethod
    def get_mongodb_uri(cls) -> str:
        """Get MongoDB URI (Atlas only). Raises if missing."""
        if not cls.MONGODB_ATLAS_URI:
            raise ValueError("MONGODB_ATLAS_URI is required; local MongoDB is not supported in this environment.")
        # Allow full URI with or without database path; if missing db in URI, append it
        if "/" in cls.MONGODB_ATLAS_URI.rsplit("@", 1)[-1]:
            # Assume db already present in URI path
            return cls.MONGODB_ATLAS_URI
        return f"{cls.MONGODB_ATLAS_URI}/{cls.MONGODB_DATABASE}?retryWrites=true&w=majority"
    
    # ==========================================
    # LOGGING CONFIGURATION
    # ==========================================
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # ==========================================
    # VALIDATION
    # ==========================================
    @classmethod
    def validate_required_config(cls) -> None:
        """Validate that all required configuration is present"""
        required_vars = []
        
        if not cls.MONGODB_ATLAS_URI:
            required_vars.append("MONGODB_ATLAS_URI")
        
        if required_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(required_vars)}")


# ==========================================
# MONGODB CLIENT HELPERS
# ==========================================
def get_mongodb_client():
    """Get MongoDB client instance"""
    from motor.motor_asyncio import AsyncIOMotorClient
    return AsyncIOMotorClient(Config.get_mongodb_uri())

def get_mongodb_database():
    """Get MongoDB database instance"""
    client = get_mongodb_client()
    return client[Config.MONGODB_DATABASE]

# ==========================================
# REDIS CLIENT HELPERS
# ==========================================
def get_redis_client():
    """Get Redis client instance"""
    import redis.asyncio as redis
    return redis.from_url(Config.get_redis_url(), db=Config.REDIS_DATABASE)

# ==========================================
# S3 CLIENT HELPERS
# ==========================================
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "https://s3.filebase.com")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID", "")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY", "")
S3_BUCKET = os.getenv("S3_BUCKET", "")
S3_PUBLIC_BUCKET = os.getenv("S3_PUBLIC_BUCKET", "false").lower() == "true"

def get_bucket_name() -> str:
    return S3_BUCKET

def get_s3_endpoint() -> str:
    return S3_ENDPOINT

def is_s3_enabled() -> bool:
    return bool(S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY and S3_BUCKET)

def get_s3_client():
    """Get S3 client instance (Filebase-compatible)"""
    return boto3.client(
        's3',
        endpoint_url=S3_ENDPOINT,
        region_name=S3_REGION,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
        config=BotoConfig(signature_version='s3v4', s3={'addressing_style': 'path'})
    )

def build_public_url(key: str) -> str:
    """Build public URL when bucket is public (no signature)."""
    return f"{S3_ENDPOINT.rstrip('/')}/{S3_BUCKET}/{key}"

def get_presigned_get_url(key: str, expires_in_seconds: int = 3600) -> str:
    """Generate presigned GET URL using SigV4."""
    client = get_s3_client()
    return client.generate_presigned_url(
        'get_object',
        Params={'Bucket': S3_BUCKET, 'Key': key},
        ExpiresIn=expires_in_seconds,
    )

# Legacy function wrappers for backward compatibility
def get_redis_url():
    """Legacy function - use Config.get_redis_url() instead"""
    return Config.get_redis_url()

def get_redis_password():
    """Legacy function"""
    return Config.REDIS_PASSWORD

def get_redis_db():
    """Legacy function"""
    return Config.REDIS_DATABASE

def get_kafka_bootstrap_servers():
    """Legacy function - use Config.KAFKA_BOOTSTRAP_SERVERS instead"""
    return Config.KAFKA_BOOTSTRAP_SERVERS