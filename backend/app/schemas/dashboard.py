from typing import List, Dict
from pydantic import BaseModel

class DoctorWorkload(BaseModel):
    doctor_id: int
    doctor_name: str
    pending_queue_count: int
    verified_cases_count: int

class StatsResponse(BaseModel):
    total_examinations: int
    total_uploaded: int
    total_analyzed: int
    total_verified: int
    total_finalized: int
    examinations_today: int
    examinations_this_month: int
    active_radiologists_count: int
    examinations_by_disease: Dict[str, int]
    doctor_workloads: List[DoctorWorkload]
