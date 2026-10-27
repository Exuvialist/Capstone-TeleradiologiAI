from pydantic import BaseModel, EmailStr
from app.models.enums import UserRole

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: UserRole

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole

    class Config:
        from_attributes = True
