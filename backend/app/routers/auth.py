import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth_utils
from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter(tags=["auth"])

logger = logging.getLogger(__name__)

# Exceptions raised when the database itself is unreachable (e.g. PostgreSQL
# is not running). asyncpg surfaces connect failures as builtin OSError
# subclasses — asyncio aggregates multi-address failures ("::1" + "127.0.0.1")
# into a plain OSError — while SQLAlchemy wraps most other DBAPI-level
# failures in InterfaceError / OperationalError.
DB_CONNECTION_ERRORS = (OSError, InterfaceError, OperationalError)

SERVICE_UNAVAILABLE_DETAIL = "Service temporarily unavailable. Please try again later."


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(User.email == data.email))
        existing_user = result.scalar_one_or_none()
    except DB_CONNECTION_ERRORS as exc:
        logger.error("Database unavailable during registration: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SERVICE_UNAVAILABLE_DETAIL,
        ) from exc

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=auth_utils.hash_password(data.password),
    )
    db.add(user)
    try:
        # flush() emits the INSERT, surfacing UNIQUE-constraint violations —
        # including races where a concurrent request registered the same
        # email after our SELECT pre-check above — as IntegrityError.
        await db.flush()
        await db.refresh(user)
        # Commit inside the route (inside error handling) so connection
        # failures at commit time map to a friendly 503 here instead of
        # escaping as an unhandled error from the get_db dependency's
        # cleanup commit.
        await db.commit()
    except IntegrityError as exc:
        # Roll back explicitly so the session is clean before the exception
        # propagates (the get_db dependency would otherwise receive a session
        # stuck in a failed transaction), then report the duplicate email.
        logger.warning("Duplicate email registration for %s: %s", data.email, exc)
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered") from exc
    except DB_CONNECTION_ERRORS as exc:
        logger.error("Database unavailable while creating user: %s", exc)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SERVICE_UNAVAILABLE_DETAIL,
        ) from exc
    return user


@router.post("/login", response_model=dict)
async def login(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(select(User).where(User.email == credentials.email))
        user = result.scalar_one_or_none()
    except DB_CONNECTION_ERRORS as exc:
        logger.error("Database unavailable during login: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SERVICE_UNAVAILABLE_DETAIL,
        ) from exc

    if not user or not auth_utils.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    settings = get_settings()
    token = auth_utils.create_access_token(
        {"sub": str(user.id), "email": user.email}, settings.SECRET_KEY
    )
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=86400,
    )
    return {
        "message": "Login successful",
        "user": UserResponse.model_validate(user).model_dump(mode="json"),
    }


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(auth_utils.get_current_user)):
    return current_user


@router.post("/logout")
async def logout(response: Response):
    settings = get_settings()
    # Mirror the attributes used by login's set_cookie so browsers reliably
    # match and expire the right cookie (including the Secure flag when the
    # deployment is HTTPS-only).
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return {"message": "Logged out"}
