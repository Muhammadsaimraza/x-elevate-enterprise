import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth_utils
from app.database import get_db
from app.models.user import User
from app.schemas.user import LinkedAccountsResponse, LinkedAccountsUpdate

router = APIRouter(tags=["settings"])

logger = logging.getLogger(__name__)

# Same DB-unreachable mapping as the auth router (see notes there): asyncpg
# surfaces connect failures as OSError subclasses, while SQLAlchemy wraps
# most other DBAPI-level failures in InterfaceError / OperationalError.
DB_CONNECTION_ERRORS = (OSError, InterfaceError, OperationalError)

SERVICE_UNAVAILABLE_DETAIL = "Service temporarily unavailable. Please try again later."


def _linked_accounts_response(user: User) -> LinkedAccountsResponse:
    """Build the token-free view of a user's linked accounts."""
    return LinkedAccountsResponse(
        x_handle=user.x_handle,
        linkedin_profile_url=user.linkedin_profile_url,
        x_connected=bool(user.x_auth_token),
        linkedin_connected=bool(user.linkedin_li_at),
    )


@router.get("/linked-accounts", response_model=LinkedAccountsResponse)
async def get_linked_accounts(
    current_user: User = Depends(auth_utils.get_current_user),
):
    """Return the current user's linked X/LinkedIn account status (no tokens)."""
    return _linked_accounts_response(current_user)


@router.put("/linked-accounts", response_model=LinkedAccountsResponse)
async def update_linked_accounts(
    data: LinkedAccountsUpdate,
    current_user: User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's linked X/LinkedIn credentials.

    Only fields explicitly present in the request body are applied; omitted
    fields keep their stored values. An empty string clears a value, which is
    how a client disconnects an account. Raw tokens are persisted to the
    user's record but never returned in the response.
    """
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        # Empty string normalises to NULL — clearing the stored credential.
        setattr(current_user, field, value or None)

    try:
        # Commit inside the route (inside error handling) so connection
        # failures at commit time map to a friendly 503 here instead of
        # escaping as an unhandled error from the get_db dependency's
        # cleanup commit.
        await db.commit()
    except DB_CONNECTION_ERRORS as exc:
        logger.error("Database unavailable while updating linked accounts: %s", exc)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SERVICE_UNAVAILABLE_DETAIL,
        ) from exc

    # expire_on_commit=False keeps attributes loaded after the commit.
    return _linked_accounts_response(current_user)
