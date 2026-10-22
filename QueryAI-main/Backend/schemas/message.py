from datetime import datetime

from pydantic import BaseModel


class MessageCreate(BaseModel):

    role: str

    content: str


class MessageResponse(BaseModel):

    id: int

    chat_id: int

    role: str

    content: str

    attachment_name: str | None = None

    attachment_type: str | None = None

    attachment_url: str | None = None

    document_id: str | None = None

    created_at: datetime

    class Config:

        from_attributes = True