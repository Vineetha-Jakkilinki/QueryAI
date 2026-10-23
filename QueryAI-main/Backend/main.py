from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine
from models.user import User
from models.chat import Chat
from models.message import Message

from routers.auth import router as auth_router
from routers.message import router as message_router
from routers.chat import router as chat_router

from core.config import settings


# ==================================================
# CREATE FASTAPI APP
# ==================================================

app = FastAPI(
    title="QueryAI API"
)


# ==================================================
# CORS
# ==================================================

# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://queryai-frontend.onrender.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# SESSION
# ==================================================

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret_key,
    https_only=True,
    same_site="none",
)


# ==================================================
# DATABASE
# ==================================================

Base.metadata.create_all(
    bind=engine
)


# ==================================================
# ROUTERS
# ==================================================

app.include_router(
    auth_router
)

app.include_router(
    chat_router
)

app.include_router(
    message_router
)


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():
    return {
        "message": "QueryAI backend is running!",
        "google_configured": bool(
            settings.google_client_id
        )
    }