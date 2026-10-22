from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.chat import Chat
from schemas.chat import ChatCreate, ChatResponse


router = APIRouter(
    prefix="/chats",
    tags=["Chats"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================
# CREATE CHAT
# ==========================================

@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreate,
    request: Request,
    db: Session = Depends(get_db)
):

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User is not authenticated"
        )

    chat = Chat(
        title=chat_data.title,
        user_id=user_id
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat


# ==========================================
# GET ALL CHATS
# ==========================================

@router.get("/", response_model=list[ChatResponse])
async def get_chats(
    request: Request,
    db: Session = Depends(get_db)
):

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User is not authenticated"
        )

    chats = db.query(Chat).filter(
        Chat.user_id == user_id
    ).order_by(
        Chat.created_at.desc()
    ).all()

    return chats


# ==========================================
# RENAME CHAT
# ==========================================

@router.patch("/{chat_id}", response_model=ChatResponse)
async def rename_chat(
    chat_id: int,
    chat_data: ChatCreate,
    request: Request,
    db: Session = Depends(get_db)
):

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User is not authenticated"
        )

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    chat.title = chat_data.title

    db.commit()
    db.refresh(chat)

    return chat


# ==========================================
# DELETE CHAT
# ==========================================

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User is not authenticated"
        )

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted successfully"
    }