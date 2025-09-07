from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "integration-connectors-service"
    service_port: int = 8014

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


