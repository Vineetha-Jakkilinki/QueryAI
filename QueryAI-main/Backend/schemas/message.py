from pydantic import BaseModel
from datetime import datetime


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

    created_at: datetime

    class Config:
        from_attributes = True