from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "esignature-integration-service"
    service_port: int = 8008

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


