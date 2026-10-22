from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session

from core.config import settings
from database.connection import SessionLocal
from models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/google/login")
async def google_login(request: Request):

    redirect_uri = settings.google_redirect_uri

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    token = await oauth.google.authorize_access_token(request)

    user_info = token.get("userinfo")

    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name")
    profile_picture = user_info.get("picture")

    existing_user = db.query(User).filter(
        User.google_id == google_id
    ).first()

    if existing_user:

        user = existing_user

    else:

        user = User(
            google_id=google_id,
            name=name,
            email=email,
            profile_picture=profile_picture
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # Store logged-in user in session
    request.session["user_id"] = user.id

    # DEBUG: check whether session contains user_id
    print("SESSION CREATED:", dict(request.session))
    # Redirect back to React frontend
    
    return RedirectResponse(
        url="http://localhost:5173"
    )

@router.get("/me")
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):

    user_id = request.session.get("user_id")

    if not user_id:
        return {
            "authenticated": False,
            "message": "User is not logged in"
        }

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        request.session.clear()

        return {
            "authenticated": False,
            "message": "User not found"
        }

    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_picture": user.profile_picture
        }
    }

@router.post("/logout")
async def logout(request: Request):

    request.session.clear()

    return {
        "message": "Logged out successfully"
    }