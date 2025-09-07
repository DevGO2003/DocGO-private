from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "health-monitoring-agent"
    service_port: int = 8016

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


