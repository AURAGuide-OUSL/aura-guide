from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgres://aura_user:1234@localhost:5432/aura?sslmode=disable"
    jwt_secret: str = "aura_secret_key_2026"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2:1b"
    host: str = "0.0.0.0"
    port: int = 8001
    cors_origins: str = "http://localhost:8081,http://localhost:8082,http://127.0.0.1:8081"


settings = Settings()
