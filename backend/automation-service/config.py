import os
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Dict, Any

# Load .env file
_service_dir = Path(__file__).resolve().parent
_env_file = _service_dir / ".env"

# Load .env if exists
if _env_file.exists():
    load_dotenv(dotenv_path=_env_file, override=False)
    print(f"Loaded .env from {_env_file}")
# Finally fallback to default lookup (CWD)
else:
    load_dotenv()  # fallback to default lookup (CWD)
    print("Loaded .env from CWD")


class Config:
    """
    Centralized configuration management for Automation Service
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
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8003"))
    NODE_ENV: str = os.getenv("NODE_ENV", "development")
    
    # ==========================================
    # INFRASTRUCTURE SERVICES (Shared from root .env)
    # ==========================================
    # Kafka Configuration - DISABLED
    KAFKA_ENABLED: bool = os.getenv("KAFKA_ENABLED", "false").lower() == "true"
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
    KAFKA_CLIENT_ID: str = os.getenv("KAFKA_CLIENT_ID", f"{os.getenv('KAFKA_CLIENT_ID_PREFIX', 'docgo')}-automation")
    KAFKA_GROUP_ID: str = os.getenv("KAFKA_GROUP_ID", f"{os.getenv('KAFKA_GROUP_ID_PREFIX', 'docgo-group')}-automation")
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_DATABASE: int = int(os.getenv("REDIS_DATABASE", "0"))
    
    # ==========================================
    # EXTERNAL APIS (Required - No fallback)
    # ==========================================
    @classmethod
    def get_gemini_api_key(cls) -> str:
        """Lấy Gemini API Key - BẮT BUỘC"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("Biến môi trường GEMINI_API_KEY chưa được thiết lập.")
        return api_key

    # ==========================================
    # S3 CONFIGURATION (Required - No fallback)
    # ==========================================
    S3_ENABLED: bool = os.getenv("S3_ENABLED", "true").lower() == "true"
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "")
    S3_REGION: str = os.getenv("S3_REGION", "")
    S3_ACCESS_KEY_ID: str = os.getenv("S3_ACCESS_KEY_ID", "")
    S3_SECRET_ACCESS_KEY: str = os.getenv("S3_SECRET_ACCESS_KEY", "")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")
    
    # ==========================================
    # MINIO CONFIGURATION (Local Development)
    # ==========================================
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "docgo-files")
    
    # ==========================================
    # FILE STORAGE CONFIGURATION
    # ==========================================
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    TEMP_DIR: str = os.getenv("TEMP_DIR", "temp")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "104857600"))  # 100MB
    # Ngưỡng xử lý đồng bộ (≤ MAX_SYNC_SIZE) vs bất đồng bộ (> MAX_SYNC_SIZE)
    MAX_SYNC_SIZE: int = int(os.getenv("MAX_SYNC_SIZE", "2097152"))  # 2MB mặc định
    ALLOWED_FILE_TYPES: List[str] = os.getenv("ALLOWED_FILE_TYPES", "pdf,docx,txt,jpg,jpeg,png,gif").split(",")
    
    # ==========================================
    # KAFKA TOPICS (Service-specific)
    # ==========================================
    KAFKA_FILE_UPLOADED_TOPIC: str = os.getenv("KAFKA_FILE_UPLOADED_TOPIC", "file.uploaded")
    KAFKA_TEXT_EXTRACTED_TOPIC: str = os.getenv("KAFKA_TEXT_EXTRACTED_TOPIC", "ai.text.extracted")
    KAFKA_DOCUMENT_CLASSIFIED_TOPIC: str = os.getenv("KAFKA_DOCUMENT_CLASSIFIED_TOPIC", "ai.document.classified")
    KAFKA_CONTRACT_SUMMARY_TOPIC: str = os.getenv("KAFKA_CONTRACT_SUMMARY_TOPIC", "contract.summary.updated")
    
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
    def get_document_service_url(cls) -> str:
        """Get Document Management Service URL with smart fallback"""
        return os.getenv("DOCUMENT_MANAGEMENT_SERVICE_URL", 
                        "http://document-management-service:8002" if cls.is_docker() 
                        else "http://localhost:8002")
    
    @classmethod
    def get_base_url(cls) -> str:
        """Get base URL for this service with smart fallback"""
        return os.getenv("BASE_URL", 
                        f"http://automation-service:{cls.PORT}" if cls.is_docker() 
                        else f"http://localhost:{cls.PORT}")
    
    # ==========================================
    # CORS CONFIGURATION
    # ==========================================
    @classmethod
    def get_cors_origins(cls) -> List[str]:
        """Get CORS origins with smart fallback"""
        origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
        return [origin.strip() for origin in origins.split(",")]
    
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
    def get_redis_password(cls) -> str:
        """Get Redis password"""
        return cls.REDIS_PASSWORD
    
    @classmethod
    def get_redis_db(cls) -> int:
        """Get Redis database number"""
        return cls.REDIS_DATABASE
    
    @classmethod
    def get_batch_config(cls) -> dict:
        """Get batch processing configuration"""
        return {
            "max_workers": int(os.getenv("BATCH_MAX_WORKERS", "4")),
            "batch_size": int(os.getenv("BATCH_SIZE", "10")),
            "timeout": int(os.getenv("BATCH_TIMEOUT", "300")),  # 5 minutes
            "retry_attempts": int(os.getenv("BATCH_RETRY_ATTEMPTS", "3")),
            "retry_delay": int(os.getenv("BATCH_RETRY_DELAY", "5"))  # seconds
        }
    
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
        required_vars = [
            ("GEMINI_API_KEY", cls.get_gemini_api_key),
        ]
        
        if cls.S3_ENABLED:
            required_vars.extend([
                ("S3_ENDPOINT", lambda: cls.S3_ENDPOINT),
                ("S3_ACCESS_KEY_ID", lambda: cls.S3_ACCESS_KEY_ID),
                ("S3_SECRET_ACCESS_KEY", lambda: cls.S3_SECRET_ACCESS_KEY),
                ("S3_BUCKET", lambda: cls.S3_BUCKET),
            ])
        
        missing_vars = []
        for var_name, getter in required_vars:
            try:
                value = getter()
                if not value:
                    missing_vars.append(var_name)
            except (ValueError, AttributeError):
                missing_vars.append(var_name)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    # ==========================================
    # NOTIFICATION CONFIGURATION
    # ==========================================
    @classmethod
    def get_smtp_config(cls) -> dict:
        """Get SMTP configuration for email notifications"""
        return {
            "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
            "port": int(os.getenv("SMTP_PORT", "587")),
            "username": os.getenv("SMTP_USERNAME", ""),
            "password": os.getenv("SMTP_PASSWORD", ""),
            "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        }

    @classmethod
    def get_twilio_config(cls) -> dict:
        """Get Twilio configuration for SMS notifications"""
        return {
            "account_sid": os.getenv("TWILIO_ACCOUNT_SID", ""),
            "auth_token": os.getenv("TWILIO_AUTH_TOKEN", ""),
            "phone_number": os.getenv("TWILIO_PHONE_NUMBER", "")
        }

    @classmethod
    def get_websocket_config(cls) -> dict:
        """Get WebSocket configuration for real-time notifications"""
        return {
            "enabled": os.getenv("WEBSOCKET_ENABLED", "false").lower() == "true",
            "host": os.getenv("WEBSOCKET_HOST", "localhost"),
            "port": int(os.getenv("WEBSOCKET_PORT", "8080")),
            "path": os.getenv("WEBSOCKET_PATH", "/ws")
        }

    @classmethod
    def get_event_config(cls) -> dict:
        """Get event processing configuration"""
        return {
            "enabled": os.getenv("EVENT_PROCESSING_ENABLED", "true").lower() == "true",
            "max_retries": int(os.getenv("EVENT_MAX_RETRIES", "3")),
            "retry_delay": int(os.getenv("EVENT_RETRY_DELAY", "5")),  # seconds
            "batch_size": int(os.getenv("EVENT_BATCH_SIZE", "100")),
            "timeout": int(os.getenv("EVENT_TIMEOUT", "30"))  # seconds
        }


# Legacy function wrappers for backward compatibility
def get_gemini_api_key():
    """Legacy function - use Config.get_gemini_api_key() instead"""
    return Config.get_gemini_api_key()

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

def get_kafka_file_uploaded_topic():
    """Legacy function - use Config.KAFKA_FILE_UPLOADED_TOPIC instead"""
    return Config.KAFKA_FILE_UPLOADED_TOPIC

def get_kafka_text_extracted_topic():
    """Legacy function - use Config.KAFKA_TEXT_EXTRACTED_TOPIC instead"""
    return Config.KAFKA_TEXT_EXTRACTED_TOPIC

def get_kafka_document_classified_topic():
    """Legacy function - use Config.KAFKA_DOCUMENT_CLASSIFIED_TOPIC instead"""
    return Config.KAFKA_DOCUMENT_CLASSIFIED_TOPIC

def get_kafka_contract_summary_topic():
    """Legacy function - use Config.KAFKA_CONTRACT_SUMMARY_TOPIC instead"""
    return Config.KAFKA_CONTRACT_SUMMARY_TOPIC

def get_kafka_client_id():
    """Legacy function - use Config.KAFKA_CLIENT_ID instead"""
    return Config.KAFKA_CLIENT_ID

def get_smtp_config():
    """Legacy function - use Config.get_smtp_config() instead"""
    return Config.get_smtp_config()

def get_twilio_config():
    """Legacy function - use Config.get_twilio_config() instead"""
    return Config.get_twilio_config()

def get_websocket_config():
    """Legacy function - use Config.get_websocket_config() instead"""
    return Config.get_websocket_config()

def get_event_config():
    """Legacy function - use Config.get_event_config() instead"""
    return Config.get_event_config()
