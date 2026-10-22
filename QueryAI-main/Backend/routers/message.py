import os
import tempfile

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
    summarize_conversation,
)

from services.cloudinary_service import (
    upload_image,
    upload_document,
)

from services.rag_service import (
    generate_document_id,
    process_document,
    create_vector_store,
    get_relevant_context,
)


# ==================================================
# FILE SIZE LIMIT
# ==================================================

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


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

    document_id = None

    image_bytes = None
    content_type = None


    # ==================================================
    # 4. HANDLE UPLOADED FILE
    # ==================================================

    if file is not None:

        # --------------------------------------------------
        # Check file size
        # --------------------------------------------------

        document_bytes = await file.read()

        if len(document_bytes) > MAX_FILE_SIZE:

            raise HTTPException(
                status_code=413,
                detail="File size cannot exceed 20 MB."
            )


        # --------------------------------------------------
        # Basic file information
        # --------------------------------------------------

        content_type = file.content_type or ""

        filename = file.filename or ""

        filename_lower = filename.lower()


        # ==================================================
        # IMAGE
        # ==================================================

        if content_type.startswith("image/"):

            image_bytes = document_bytes


            # --------------------------------------------------
            # Upload image to Cloudinary
            # --------------------------------------------------

            try:

                attachment_url = upload_image(
                    image_bytes=image_bytes,
                    filename=filename,
                )

            except Exception as e:

                print(
                    "CLOUDINARY IMAGE ERROR:",
                    repr(e)
                )

                raise HTTPException(
                    status_code=500,
                    detail=f"Image upload failed: {str(e)}"
                )


            # --------------------------------------------------
            # Attachment information
            # --------------------------------------------------

            attachment_name = filename
            attachment_type = "image"


        # ==================================================
        # PDF
        # ==================================================

        elif (
            content_type == "application/pdf"
            or filename_lower.endswith(".pdf")
        ):

            attachment_type = "pdf"


            # --------------------------------------------------
            # Generate document ID
            # --------------------------------------------------

            document_id = generate_document_id()


            # --------------------------------------------------
            # Upload PDF to Cloudinary
            # --------------------------------------------------

            try:

                attachment_url = upload_document(
                    document_bytes=document_bytes,
                    filename=filename,
                )

                print(
                    "PDF uploaded to Cloudinary:",
                    attachment_url
                )

            except Exception as e:

                print(
                    "CLOUDINARY PDF ERROR:",
                    repr(e)
                )

                raise HTTPException(
                    status_code=500,
                    detail=f"PDF upload failed: {str(e)}"
                )


            # --------------------------------------------------
            # Create temporary PDF
            # --------------------------------------------------

            temp_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".pdf"
            )


            try:

                temp_file.write(
                    document_bytes
                )

                temp_file.close()


                # --------------------------------------------------
                # PDF → chunks
                # --------------------------------------------------

                chunks = process_document(
                    file_path=temp_file.name,
                    file_type="pdf"
                )


                print(
                    f"PDF processed: {len(chunks)} chunks"
                )


                # --------------------------------------------------
                # chunks → PostgreSQL + pgvector
                # --------------------------------------------------

                create_vector_store(
                    chunks=chunks,
                    document_id=document_id
                )


                print(
                    f"Vector store created: {document_id}"
                )


            finally:

                if os.path.exists(
                    temp_file.name
                ):

                    os.remove(
                        temp_file.name
                    )


            attachment_name = filename


        # ==================================================
        # DOCX
        # ==================================================

        elif (
            content_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            or filename_lower.endswith(".docx")
        ):

            attachment_type = "doc"


            # --------------------------------------------------
            # Generate document ID
            # --------------------------------------------------

            document_id = generate_document_id()


            # --------------------------------------------------
            # Upload DOCX to Cloudinary
            # --------------------------------------------------

            try:

                attachment_url = upload_document(
                    document_bytes=document_bytes,
                    filename=filename,
                )

                print(
                    "DOCX uploaded to Cloudinary:",
                    attachment_url
                )

            except Exception as e:

                print(
                    "CLOUDINARY DOCX ERROR:",
                    repr(e)
                )

                raise HTTPException(
                    status_code=500,
                    detail=f"DOCX upload failed: {str(e)}"
                )


            # --------------------------------------------------
            # Create temporary DOCX
            # --------------------------------------------------

            temp_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".docx"
            )


            try:

                temp_file.write(
                    document_bytes
                )

                temp_file.close()


                # --------------------------------------------------
                # DOCX → chunks
                # --------------------------------------------------

                chunks = process_document(
                    file_path=temp_file.name,
                    file_type="docx"
                )


                print(
                    f"DOCX processed: {len(chunks)} chunks"
                )


                # --------------------------------------------------
                # chunks → PostgreSQL + pgvector
                # --------------------------------------------------

                create_vector_store(
                    chunks=chunks,
                    document_id=document_id
                )


                print(
                    f"Vector store created: {document_id}"
                )


            finally:

                if os.path.exists(
                    temp_file.name
                ):

                    os.remove(
                        temp_file.name
                    )


            attachment_name = filename


        # ==================================================
        # PPTX
        # ==================================================

        elif (
            content_type
            == "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            or filename_lower.endswith(".pptx")
        ):

            attachment_type = "ppt"


            # --------------------------------------------------
            # Generate document ID
            # --------------------------------------------------

            document_id = generate_document_id()


            # --------------------------------------------------
            # Upload PPTX to Cloudinary
            # --------------------------------------------------

            try:

                attachment_url = upload_document(
                    document_bytes=document_bytes,
                    filename=filename,
                )

                print(
                    "PPTX uploaded to Cloudinary:",
                    attachment_url
                )

            except Exception as e:

                print(
                    "CLOUDINARY PPTX ERROR:",
                    repr(e)
                )

                raise HTTPException(
                    status_code=500,
                    detail=f"PPTX upload failed: {str(e)}"
                )


            # --------------------------------------------------
            # Create temporary PPTX
            # --------------------------------------------------

            temp_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".pptx"
            )


            try:

                temp_file.write(
                    document_bytes
                )

                temp_file.close()


                # --------------------------------------------------
                # PPTX → chunks
                # --------------------------------------------------

                chunks = process_document(
                    file_path=temp_file.name,
                    file_type="pptx"
                )


                print(
                    f"PPTX processed: {len(chunks)} chunks"
                )


                # --------------------------------------------------
                # chunks → PostgreSQL + pgvector
                # --------------------------------------------------

                create_vector_store(
                    chunks=chunks,
                    document_id=document_id
                )


                print(
                    f"Vector store created: {document_id}"
                )


            finally:

                if os.path.exists(
                    temp_file.name
                ):

                    os.remove(
                        temp_file.name
                    )


            attachment_name = filename


        # ==================================================
        # UNSUPPORTED FILE
        # ==================================================

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported file type. "
                    "Currently supported: "
                    "images, PDF, DOCX and PPTX files."
                )
            )


    # ==================================================
    # 5. SAVE USER MESSAGE
    # ==================================================

    user_message = Message(

        chat_id=chat_id,

        role="user",

        content=(
            content
            if content
            else (
                "[Image uploaded]"
                if attachment_type == "image"
                else (
                    "[PDF uploaded]"
                    if attachment_type == "pdf"
                    else (
                        "[DOCX uploaded]"
                        if attachment_type == "doc"
                        else "[PPTX uploaded]"
                    )
                )
            )
        ),

        attachment_name=attachment_name,

        attachment_type=attachment_type,

        attachment_url=attachment_url,

        document_id=document_id,
    )


    db.add(user_message)

    db.commit()

    db.refresh(user_message)


    # ==================================================
    # 6. GET PREVIOUS CONVERSATION
    # ==================================================

    previous_messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(
        Message.created_at.asc()
    ).all()


    # ==================================================
    # 7. BUILD CONTROLLED CONVERSATION MEMORY
    # ==================================================

    all_conversation = []


    for msg in previous_messages:

        if not msg.content:
            continue


        if msg.role == "summary":
            continue


        message_role = (
            "assistant"
            if msg.role == "assistant"
            else "user"
        )


        all_conversation.append(
            {
                "role": message_role,
                "content": msg.content
            }
        )


    # ==================================================
    # 8. KEEP ONLY RECENT MESSAGES
    # ==================================================

    RECENT_MESSAGE_COUNT = 4

    recent_messages = all_conversation[
        -RECENT_MESSAGE_COUNT:
    ]


    # ==================================================
    # 9. GET OLDER MESSAGES
    # ==================================================

    older_messages = all_conversation[
        :-RECENT_MESSAGE_COUNT
    ]


    # ==================================================
    # 10. CREATE SMALL SUMMARY
    # ==================================================

    conversation_history = []


    if older_messages:

        try:

            summary = summarize_conversation(
                older_messages
            )


            if summary:

                conversation_history.append(
                    {
                        "role": "system",
                        "content": (
                            "Conversation summary:\n"
                            f"{summary}"
                        )
                    }
                )


        except Exception as e:

            print(
                "SUMMARY ERROR:",
                repr(e)
            )


    # ==================================================
    # 11. ADD RECENT MESSAGES
    # ==================================================

    conversation_history.extend(
        recent_messages
    )


    # ==================================================
    # 12. FIND ACTIVE DOCUMENT
    # ==================================================

    active_document_id = document_id


    if not active_document_id:

        latest_document_message = db.query(
            Message
        ).filter(
            Message.chat_id == chat_id,
            Message.document_id.isnot(None)
        ).order_by(
            Message.created_at.desc()
        ).first()


        if latest_document_message:

            active_document_id = (
                latest_document_message.document_id
            )


    # ==================================================
    # 13. GENERATE AI RESPONSE
    # ==================================================

    try:

        # ==================================================
        # IMAGE
        # ==================================================

        if attachment_type == "image":

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
        # DOCUMENT QUESTION
        # ==================================================

        elif active_document_id and content:

            # --------------------------------------------------
            # PostgreSQL + pgvector RAG
            # --------------------------------------------------

            rag_context = get_relevant_context(
                document_id=active_document_id,
                query=content,
                k=3
            )


            # --------------------------------------------------
            # Grounded RAG prompt
            # --------------------------------------------------

            rag_prompt = f"""
You are QueryAI, answering a user's question about
their uploaded document.

The uploaded document may be a PDF, DOCX, or PPTX.

You MUST follow these rules:

1. Answer primarily from the DOCUMENT CONTEXT.
2. Do NOT use outside knowledge to fill missing information.
3. Do NOT guess.
4. Do NOT invent names, dates, locations, salaries,
   companies, policies, or other facts.
5. If the requested information is not supported by
   the DOCUMENT CONTEXT, clearly say that it is not
   specified in the provided document context.
6. If the question refers to something discussed earlier,
   you may use the conversation context to understand
   what the user means.
7. However, conversation context must NOT override
   the uploaded document.
8. Keep the answer clear and directly answer the question.

DOCUMENT CONTEXT:
-------------------------
{rag_context}
-------------------------

USER QUESTION:
{content}
"""


            # --------------------------------------------------
            # Send grounded prompt to LLM
            # --------------------------------------------------

            ai_response = generate_response(

                user_message=rag_prompt,

                conversation_history=conversation_history,
            )


        # ==================================================
        # NORMAL TEXT
        # ==================================================

        else:

            ai_response = generate_response(

                user_message=content,

                conversation_history=conversation_history,
            )


    except Exception as e:

        print(
            "LLM / RAG ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"LLM error: {str(e)}"
        )


    # ==================================================
    # 14. SAVE AI RESPONSE
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
    # 15. RETURN AI RESPONSE
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