# src/interfaces/ai_service.py
from abc import ABC, abstractmethod
from src.models.email_request import EmailRequest


class AIServiceInterface(ABC):



    @abstractmethod
    async def validate_email(self, email: EmailRequest) -> dict[str, str]:
        """
        Returns: (is_spam, confidence_score, reasoning)
        """
        pass
