from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FitPilot AI Service"
    PORT: int = 8000
    INTERNAL_API_KEY: str = "fitpilot-secret-internal-key-2026"
    
    # Qwen Model Configuration
    QWEN_MODEL_NAME: str = "Qwen/Qwen3-4B-Instruct-2507"
    INFERENCE_SERVER_URL: str = "http://localhost:8000/v1"
    INFERENCE_API_KEY: str = "EMPTY"

    # Recommended Qwen3 Sampling Parameters
    TEMPERATURE: float = 0.7
    TOP_P: float = 0.8
    TOP_K: int = 20
    MIN_P: float = 0.0
    MAX_TOKENS: int = 16384

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()