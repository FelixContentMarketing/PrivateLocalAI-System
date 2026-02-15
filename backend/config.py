from pydantic import BaseModel


class Settings(BaseModel):
    ollama_base_url: str = "http://localhost:11434"
    host: str = "127.0.0.1"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    default_temperature: float = 0.3
    default_max_tokens: int = 4096


settings = Settings()
