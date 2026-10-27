from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import LoginRequest, TokenResponse, UserOut
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Autentikasi"])

@router.post(
    "/login",
    response_model=TokenResponse,
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": LoginRequest.model_json_schema()
                },
                "application/x-www-form-urlencoded": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "username": {"type": "string", "description": "Email akun"},
                            "password": {"type": "string", "description": "Password akun"}
                        },
                        "required": ["username", "password"]
                    }
                }
            }
        }
    }
)
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login pengguna (Faskes atau Dokter Radiologi).
    Mendukung:
    - Popup Authorize Swagger UI (form-urlencoded: username & password)
    - Request Frontend / Postman (JSON: email & password)
    """
    content_type = request.headers.get("content-type", "")
    email = None
    password = None

    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")
    else:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format request login tidak valid"
            )

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username dan password wajib diisi"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )

    token = create_access_token(subject=user.id, role=user.role.value)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role
    )

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Mengambil profil akun yang sedang login."""
    return current_user

@router.get("/radiologists", response_model=List[UserOut])
def list_available_radiologists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mengambil daftar seluruh dokter radiologi.
    Digunakan oleh pihak Faskes pada saat memilih dokter di Manual Assignment.
    """
    radiologists = db.query(User).filter(
        User.role == UserRole.radiologist
    ).order_by(User.name.asc()).all()
    return radiologists
