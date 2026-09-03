from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

# Backend project directory (the folder containing app/), independent of the
# working directory the server process happens to be started from.
_BACKEND_DIR = Path(__file__).resolve().parent.parent


def _resolve_sqlite_path(url):
    """Anchor relative SQLite database paths to the backend directory.

    A relative SQLite path such as ``sqlite+aiosqlite:///./xelevate.db`` is
    interpreted relative to the process working directory (the SQLite
    dialect applies ``os.path.abspath`` at connect time), so the database
    file location changes depending on where uvicorn is launched from.
    Resolving it against the backend directory keeps the local file location
    stable without changing the configured DATABASE_URL itself.

    Absolute paths, in-memory databases and ``file:`` URIs are returned
    unchanged. Only the URL's ``database`` component is replaced via
    ``URL.set()`` — no re-parsing or re-rendering of the URL string is
    involved, and the resolved path uses forward slashes (accepted by
    sqlite3/aiosqlite on Windows) — so the URL cannot be corrupted.
    """
    if url.get_backend_name() != "sqlite":
        # Only SQLite file paths are working-directory dependent.
        return url
    database = url.database
    if (
        not database
        or database.startswith(":memory:")
        or database.startswith("file:")
        or database.startswith("/")
        or Path(database).is_absolute()
    ):
        return url
    resolved = (_BACKEND_DIR / database).resolve()
    return url.set(database=resolved.as_posix())


# Inspect the configured URL so backend-specific engine options can be applied.
# PostgreSQL keeps the pooling behaviour; SQLite (aiosqlite) uses NullPool by
# default and rejects pool sizing arguments, so none are passed for it.
db_url = make_url(settings.DATABASE_URL)
if db_url.get_backend_name() == "sqlite":
    db_url = _resolve_sqlite_path(db_url)
_is_sqlite = db_url.get_backend_name() == "sqlite"


def _build_engine_kwargs(url) -> dict:
    """Return engine kwargs appropriate for the configured database backend."""
    if url.get_backend_name() == "sqlite":
        # SQLite + aiosqlite does not support pool_size / max_overflow
        # (it uses NullPool for file databases). A connect timeout keeps
        # concurrent dev writes from failing instantly on lock contention.
        return {
            "echo": False,
            "connect_args": {"timeout": 15},
        }
    return {
        "echo": False,
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
    }


engine = create_async_engine(db_url, **_build_engine_kwargs(db_url))


if _is_sqlite:

    @event.listens_for(engine.sync_engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
        """SQLite disables foreign key enforcement per connection; enable it."""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            # Routes that already committed explicitly (e.g. registration,
            # so its commit failures can be mapped to proper HTTP errors)
            # leave no open transaction — skip the redundant second commit
            # for them. Routes that leave work pending (SELECT-only routes
            # or any route without an explicit commit) still commit here,
            # exactly as before.
            if session.in_transaction():
                await session.commit()
        except Exception:
            await session.rollback()
            raise


async def dispose_engine():
    await engine.dispose()
