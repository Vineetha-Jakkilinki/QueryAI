from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    profile_picture: str | None = None

    class Config:
        from_attributes = True