from app.schemas.auth import LoginRequest, TokenResponse, UserOut
from app.schemas.ai import AIPredictionOut
from app.schemas.verification import VerificationCreate, VerificationOut
from app.schemas.examination import ExaminationAssignRequest, ExaminationListItem, ExaminationDetailOut
from app.schemas.dashboard import StatsResponse, DoctorWorkload

__all__ = [
    "LoginRequest",
    "TokenResponse",
    "UserOut",
    "AIPredictionOut",
    "VerificationCreate",
    "VerificationOut",
    "ExaminationAssignRequest",
    "ExaminationListItem",
    "ExaminationDetailOut",
    "StatsResponse",
    "DoctorWorkload",
]
