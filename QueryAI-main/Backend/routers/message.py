
from fastapi import (
    APIRouter,
    Depends,
    Request,
    HTTPException,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.chat import Chat
from models.message import Message
from schemas.message import MessageResponse

from services.llm_service import (
    generate_response,
    generate_image_response,
)

from services.cloudinary_service import upload_image


router = APIRouter(
    prefix="/chats",
    tags=["Messages"]
)


# ==================================================
# DATABASE DEPENDENCY
# ==================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# CREATE MESSAGE + GENERATE AI RESPONSE
# ==================================================

@router.post(
    "/{chat_id}/messages",
    response_model=MessageResponse
)
async def create_message(
    chat_id: int,
    request: Request,
    role: str = Form(...),
    content: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):

    # ==================================================
    # 1. GET LOGGED-IN USER
    # ==================================================

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User is not authenticated"
        )


    # ==================================================
    # 2. FIND CHAT
    # ==================================================

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )


    # ==================================================
    # 3. FILE VARIABLES
    # ==================================================

    attachment_name = None
    attachment_type = None
    attachment_url = None

    image_bytes = None
    content_type = None


    # ==================================================
    # 4. HANDLE UPLOADED FILE
    # ==================================================

    if file is not None:

        # ----------------------------------------------
        # Currently only images are supported
        # ----------------------------------------------

        if (
            not file.content_type
            or not file.content_type.startswith("image/")
        ):
            raise HTTPException(
                status_code=400,
                detail="Only image files are supported right now"
            )


        # ----------------------------------------------
        # Read image
        # ----------------------------------------------

        image_bytes = await file.read()

        content_type = file.content_type


        # ----------------------------------------------
        # Upload image to Cloudinary
        # ----------------------------------------------

        try:

            attachment_url = upload_image(
                image_bytes=image_bytes,
                filename=file.filename,
            )

        except Exception as e:

            print(
                "CLOUDINARY ERROR:",
                repr(e)
            )

            raise HTTPException(
                status_code=500,
                detail=f"Image upload failed: {str(e)}"
            )


        # ----------------------------------------------
        # Save attachment information
        # ----------------------------------------------

        attachment_name = file.filename
        attachment_type = "image"


    # ==================================================
    # 5. SAVE USER MESSAGE
    # ==================================================

    user_message = Message(
        chat_id=chat_id,
        role="user",

        content=(
            content
            if content
            else "[Image uploaded]"
        ),

        attachment_name=attachment_name,
        attachment_type=attachment_type,
        attachment_url=attachment_url,
    )


    db.add(user_message)

    db.commit()

    db.refresh(user_message)


    # ==================================================
    # 6. GET CONVERSATION HISTORY
    # ==================================================

    previous_messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(
        Message.created_at.asc()
    ).all()


    # ==================================================
    # 7. CONVERT DATABASE MESSAGES → LLM FORMAT
    # ==================================================

    conversation_history = []

    for msg in previous_messages:

        # Ignore empty messages
        if not msg.content:
            continue


        # --------------------------------------------------
        # Convert database role to LLM role
        # --------------------------------------------------

        message_role = (
            "assistant"
            if msg.role == "assistant"
            else "user"
        )


        # --------------------------------------------------
        # Add message to conversation history
        # --------------------------------------------------

        conversation_history.append(
            {
                "role": message_role,
                "content": msg.content
            }
        )


    # ==================================================
    # 8. GENERATE AI RESPONSE
    # ==================================================

    try:

        # ==================================================
        # IMAGE MESSAGE
        # ==================================================

        if file is not None:

            ai_response = generate_image_response(
                user_message=(
                    content
                    if content
                    else "Describe and explain this image."
                ),

                image_bytes=image_bytes,

                content_type=content_type,

                conversation_history=conversation_history,
            )


        # ==================================================
        # TEXT MESSAGE
        # ==================================================

        else:

            ai_response = generate_response(
                user_message=content,

                conversation_history=conversation_history,
            )


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"LLM error: {str(e)}"
        )


    # ==================================================
    # 9. SAVE AI RESPONSE
    # ==================================================

    assistant_message = Message(
        chat_id=chat_id,
        role="assistant",
        content=ai_response
    )


    db.add(assistant_message)

    db.commit()

    db.refresh(assistant_message)


    # ==================================================
    # 10. RETURN AI RESPONSE
    # ==================================================

    return assistant_message


# ==================================================
# GET ALL MESSAGES
# ==================================================

@router.get(
    "/{chat_id}/messages",
    response_model=list[MessageResponse]
)
async def get_messages(
    chat_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    # ==================================================
    # 1. GET LOGGED-IN USER
    # ==================================================

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User is not authenticated"
        )


    # ==================================================
    # 2. FIND CHAT
    # ==================================================

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )


    # ==================================================
    # 3. GET MESSAGES
    # ==================================================

    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(
        Message.created_at.asc()
    ).all()


    # ==================================================
    # 4. RETURN MESSAGES
    # ==================================================

    return messages
