from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "ocr-document-extraction-service"
    service_port: int = 8011

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


