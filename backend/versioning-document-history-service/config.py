import os
from dotenv import load_dotenv


load_dotenv()


class Settings:
    environment: str = os.getenv("ENVIRONMENT", "development")
    service_name: str = "versioning-document-history-service"


settings = Settings()


