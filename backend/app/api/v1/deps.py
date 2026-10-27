from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import oauth2_scheme, decode_access_token
from app.models.user import User
from app.models.enums import UserRole

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Mengambil entitas user yang sedang login dari JWT token."""
    payload = decode_access_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak memiliki klaim pengguna (sub)"
        )
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format ID pengguna tidak valid"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengguna tidak ditemukan"
        )
    return user

def require_role(allowed_role: UserRole):
    """Dependency pembuat hak akses berbasis peran (faskes / radiologist)."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != allowed_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Endpoint ini memerlukan peran '{allowed_role.value}'"
            )
        return current_user
    return role_checker
