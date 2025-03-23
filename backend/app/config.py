from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./app.db"
    BOT_TOKEN: str = ""
    
    class Config:
        env_file = ".env"
        
settings = Settings() 