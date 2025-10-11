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
    MONGODB_DATABASE: str = os.getenv("MONGODB_DOCUMENT_DATABASE", "docgo_document_service")
    
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
    MAX_FILE_SIZE: str = os.getenv("MAX_FILE_SIZE", "50MB")
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "uploads")
    
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
        """Get MongoDB URI for Spring configuration"""
        if cls.MONGODB_ATLAS_URI:
            return f"{cls.MONGODB_ATLAS_URI}/{cls.MONGODB_DATABASE}?retryWrites=true&w=majority&appName=devgo-docgo-cluster0"
        return f"mongodb://localhost:27017/{cls.MONGODB_DATABASE}"
    
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