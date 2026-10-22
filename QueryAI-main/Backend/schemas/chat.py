from pydantic import BaseModel
from datetime import datetime


class ChatCreate(BaseModel):
    title: str = "New Chat"


class ChatResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True