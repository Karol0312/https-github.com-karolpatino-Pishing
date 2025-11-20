import uuid
from datetime import datetime

from pydantic import BaseModel, Field
from enum import Enum

from src.models.email_request import EmailRequest


class ValidationStatus(Enum):
    ERROR = "error"
    VALID = "valid"
    PHISHING = "phishing"
    SUSPICIOUS = "suspicious"


class ValidationResult(BaseModel):

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    classification: ValidationStatus
    confidence_score: float
    #reasoning: str
    red_flags: list[str]
    #recommendations: list[str]
    metadata: EmailRequest
    # campo particion
    period: str = Field(default_factory=lambda: datetime.now().strftime("%Y%m"))

    def to_dict(self):
        # serializar campos para el guardado en cosmos
        vr = self.model_dump()
        vr["classification"] = vr["classification"].value
        vr["id"] = str(vr["id"])
        vr["metadata"]["date"] = vr["metadata"]["date"].isoformat()
        return vr