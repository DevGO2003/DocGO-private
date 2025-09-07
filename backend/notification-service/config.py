from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "notification-service"
    service_port: int = 8009

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


