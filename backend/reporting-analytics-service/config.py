from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "reporting-analytics-service"
    service_port: int = 8010

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


