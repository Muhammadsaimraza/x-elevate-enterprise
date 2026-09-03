from typing import Optional

from pydantic_settings import BaseSettings
from functools import lru_cache


def _is_real_value(value: Optional[str]) -> bool:
    """Return True if the value is a non-empty, non-placeholder string."""
    if not value:
        return False
    if value.startswith("your-"):
        return False
    return True


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/xelevate"
    SECRET_KEY: str = "change-me-in-production"

    # X/Twitter API — optional for local dev
    X_API_KEY: Optional[str] = None
    X_API_SECRET: Optional[str] = None
    X_ACCESS_TOKEN: Optional[str] = None
    X_ACCESS_TOKEN_SECRET: Optional[str] = None

    # LinkedIn API — optional for local dev
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Auth cookie transport security. Set to True when the API is served over
    # HTTPS (production) so the browser only sends the cookie over TLS. Keep
    # False for local plain-HTTP development (http://localhost).
    COOKIE_SECURE: bool = False

    # Gemini AI — optional, enables AI features when provided
    GEMINI_API_KEY: Optional[str] = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

    @property
    def x_configured(self) -> bool:
        """Check if X/Twitter credentials are fully provided."""
        return all([
            _is_real_value(self.X_API_KEY),
            _is_real_value(self.X_API_SECRET),
            _is_real_value(self.X_ACCESS_TOKEN),
            _is_real_value(self.X_ACCESS_TOKEN_SECRET),
        ])

    @property
    def linkedin_configured(self) -> bool:
        """Check if LinkedIn credentials are provided."""
        return all([
            _is_real_value(self.LINKEDIN_CLIENT_ID),
            _is_real_value(self.LINKEDIN_CLIENT_SECRET),
        ])

    @property
    def gemini_configured(self) -> bool:
        """Check if Gemini API key is provided."""
        return _is_real_value(self.GEMINI_API_KEY)


@lru_cache
def get_settings() -> Settings:
    return Settings()
