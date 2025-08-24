import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Service configuration
    service_name: str = "general-file-management-service"
    service_port: int = 8018
    
    # Database configuration
    database_url: str = "mysql+pymysql://root:password@localhost:3306/docgo_general_file_service"
    database_host: str = "localhost"
    database_port: int = 3306
    database_name: str = "docgo_general_file_service"
    database_user: str = "root"
    database_password: str = "password"
    
    # Redis configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    
    # File storage configuration
    upload_dir: str = "./uploads"
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_file_types: list = ["pdf", "docx", "txt", "jpg", "png", "xlsx"]
    
    # Search configuration
    elasticsearch_url: str = "http://localhost:9200"
    search_index_prefix: str = "docgo_files"
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Load settings
settings = Settings()

# Create upload directory if not exists
os.makedirs(settings.upload_dir, exist_ok=True)
