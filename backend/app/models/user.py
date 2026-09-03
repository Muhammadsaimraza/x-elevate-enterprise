from sqlalchemy import Column, DateTime, String, Uuid, func
import uuid

from app.database import Base


class User(Base):
    __tablename__ = "users"

    # Generic Uuid type: native UUID on PostgreSQL, CHAR(32) on SQLite.
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Per-user linked social-account credentials, managed via the settings
    # API (PUT /api/settings/linked-accounts). All columns are nullable so
    # existing users (and fresh registrations) are unaffected until they
    # connect an account.
    x_auth_token = Column(String(2000), nullable=True)
    x_handle = Column(String(255), nullable=True)
    linkedin_li_at = Column(String(2000), nullable=True)
    linkedin_profile_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
