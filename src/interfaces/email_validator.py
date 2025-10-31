# src/interfaces/email_validator.py
from abc import ABC, abstractmethod
from src.models.email_request import EmailRequest
from src.models.validation_result import ValidationResult


class EmailValidatorInterface(ABC):
    @abstractmethod
    async def validate_email(self, email: EmailRequest) -> ValidationResult:
        pass

