from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(tags=["users"])


@router.get("/", response_model=dict)
async def list_users(db: AsyncSession = Depends(get_db)):
    """Placeholder — list all users."""
    return {"users": [], "message": "Users list — not yet implemented"}


@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Placeholder — get a single user by ID."""
    return {"user_id": user_id, "message": "User detail — not yet implemented"}
