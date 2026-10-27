import enum

class UserRole(str, enum.Enum):
    faskes = "faskes"
    radiologist = "radiologist"

class DiseaseType(str, enum.Enum):
    pneumonia = "pneumonia"
    bone_cancer = "bone_cancer"
    brain_tumor = "brain_tumor"

class ExaminationStatus(str, enum.Enum):
    uploaded = "uploaded"
    analyzed = "analyzed"
    verified = "verified"
    finalized = "finalized"

class PredictionResult(str, enum.Enum):
    positive = "positive"
    negative = "negative"

class VerificationDecision(str, enum.Enum):
    accept = "accept"
    reject = "reject"
    modify = "modify"
