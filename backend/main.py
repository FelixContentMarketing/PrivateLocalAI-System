import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Init database
    from backend import user_db
    await user_db.init_db()

    # Load persistent settings
    from backend.api.routes_settings import load_persistent_settings
    load_persistent_settings()

    # Auto-create admin user from env vars
    if settings.admin_email and settings.admin_password:
        from backend.auth import hash_password
        pw_hash = hash_password(settings.admin_password)
        await user_db.upsert_user(
            email=settings.admin_email,
            password_hash=pw_hash,
            name="Administrator",
            role="admin",
            is_active=True,
        )
        logger.info("Admin-User angelegt/aktualisiert: %s", settings.admin_email)

    yield


app = FastAPI(
    title="Kanzlei Kissling KI-Assistent",
    description="KI-Dokumentenverarbeitung -- Hybrid: Lokal (Ollama) + Cloud (OpenRouter)",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Cookie"],
)


# Security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "connect-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "script-src 'self'; "
        "img-src 'self' data:; "
        "font-src 'self' https://fonts.gstatic.com"
    )
    return response


# Routers
from backend.api.routes_health import router as health_router
from backend.api.routes_models import router as models_router
from backend.api.routes_hardware import router as hardware_router
from backend.api.routes_generate import router as generate_router
from backend.api.routes_export import router as export_router
from backend.api.routes_auth import router as auth_router
from backend.api.routes_settings import router as settings_router

app.include_router(health_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(hardware_router, prefix="/api")
app.include_router(generate_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(settings_router, prefix="/api")

# Serve frontend static files in production (SPA fallback)
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    # Static assets (JS, CSS, images) served directly
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    # SPA fallback: all non-API routes serve index.html
    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        # Serve actual static files if they exist (favicon.png, etc.)
        file_path = frontend_dist / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
