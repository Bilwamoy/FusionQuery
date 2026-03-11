from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    secret_key: str = "collabmind-dev-secret-key-change-in-production-minimum-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    database_url: str = "sqlite:///./collabmind.db"
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 50
    openai_api_key: str = "mock"
    ai_mode: str = "mock"
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
