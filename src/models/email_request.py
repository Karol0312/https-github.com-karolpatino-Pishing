from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# @dataclass(frozen=True)
class EmailRequest(BaseModel):
    sender: str
    to: str
    subject: str
    body: str
    date: datetime = Field(default_factory=datetime.now)
    attachments: Optional[str] = None
    receivedTime: Optional[str] = None
