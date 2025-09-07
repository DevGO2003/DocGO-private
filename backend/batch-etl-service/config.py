from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "batch-etl-service"
    service_port: int = 8015

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


