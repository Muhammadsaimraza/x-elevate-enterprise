from pydantic import BaseModel, EmailStr, model_validator
from datetime import datetime
from typing import Optional
from uuid import UUID


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LinkedAccountsUpdate(BaseModel):
    """Partial update payload for a user's linked X/LinkedIn credentials.

    Only fields present in the request body are applied — omitted fields
    keep their stored values. An empty string clears a value (disconnects
    that account).
    """

    x_auth_token: Optional[str] = None
    x_handle: Optional[str] = None
    linkedin_li_at: Optional[str] = None
    linkedin_profile_url: Optional[str] = None


class LinkedAccountsResponse(BaseModel):
    """Public view of a user's linked accounts — never exposes raw tokens."""

    x_handle: Optional[str] = None
    linkedin_profile_url: Optional[str] = None
    x_connected: bool
    linkedin_connected: bool
