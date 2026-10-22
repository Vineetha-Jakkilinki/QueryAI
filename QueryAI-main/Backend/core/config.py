from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ==========================================
    # GOOGLE OAUTH
    # ==========================================

    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str


    # ==========================================
    # SESSION
    # ==========================================

    session_secret_key: str


    # ==========================================
    # GROQ
    # ==========================================

    groq_api_key: str


    # ==========================================
    # CLOUDINARY
    # ==========================================

    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str


    # ==========================================
    # ENVIRONMENT CONFIGURATION
    # ==========================================

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()