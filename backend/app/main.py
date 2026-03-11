import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app.models import Base
from app.config import get_settings
from app.routers import auth, projects, files, chat, whiteboard, gallery, oauth

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and upload directories
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.upload_dir, exist_ok=True)
    print(f"✅ CollabMind AI backend running — DB: {settings.database_url}")
    yield
    # Shutdown
    print("🛑 Backend shutting down")


app = FastAPI(
    title="CollabMind AI API",
    description="AI-powered collaborative knowledge workspace backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (for serving uploaded files directly)
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.upload_dir), name="static")

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(whiteboard.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")
app.include_router(oauth.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "CollabMind AI Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
