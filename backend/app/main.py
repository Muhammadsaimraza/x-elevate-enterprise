import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base, dispose_engine
from app.routers import auth, users, agents, websockets
# Imported with an alias because the module-level `settings` (Settings
# instance) below would otherwise shadow the router module.
from app.routers import settings as settings_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings = get_settings()
    # Import models so they are registered with Base.metadata
    from app.models.user import User  # noqa: F401

    # Shared httpx client for all third-party API services (X / LinkedIn).
    # Services accept it via their optional ``http_client`` parameter so a
    # single pooled client (with connection reuse) serves every request.
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0),
        follow_redirects=True,
    )
    logger.info("Shared httpx client created for third-party API services.")

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created / verified.")
        logger.info("Database backend: %s", engine.dialect.name)
    except Exception as exc:
        logger.error("Could not connect to the database — tables were NOT created: %s", exc)

    logger.info(
        "X/Twitter API: %s", "Configured" if settings.x_configured else "Demo mode"
    )
    logger.info(
        "LinkedIn API: %s", "Configured" if settings.linkedin_configured else "Demo mode"
    )
    logger.info(
        "Gemini AI: %s", "Configured" if settings.gemini_configured else "Demo mode"
    )
    yield
    # Shutdown
    if getattr(app.state, "http_client", None) is not None:
        try:
            await app.state.http_client.aclose()
            logger.info("Shared httpx client closed.")
        except Exception as exc:
            logger.warning("Error while closing the shared httpx client: %s", exc)
    await dispose_engine()
    logger.info("Database engine disposed.")


settings = get_settings()

app = FastAPI(
    title="X-Elevate API",
    description="Backend API for the X-Elevate multi-platform social media agent swarm.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow origins from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth")
app.include_router(users.router, prefix="/api/users")
app.include_router(agents.router, prefix="/api/agents")
app.include_router(websockets.router, prefix="/api/ws")
app.include_router(settings_router.router, prefix="/api/settings")


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "X-Elevate API"}


@app.get("/api/health", tags=["health"])
async def health():
    """Return the configuration status of all external services."""
    settings = get_settings()
    return {
        "status": "ok",
        "services": {
            "x_api": "configured" if settings.x_configured else "demo",
            "linkedin_api": "configured" if settings.linkedin_configured else "demo",
            "gemini_ai": "configured" if settings.gemini_configured else "demo",
        },
    }
