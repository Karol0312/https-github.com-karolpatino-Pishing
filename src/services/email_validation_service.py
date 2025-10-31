# src/services/email_validation_service.py
import json

from src.interfaces.email_validator import EmailValidatorInterface
from src.services.openai_service import OpenAIService
from src.utils.constantes import cte
# from src.interfaces.repository import RepositoryInterface
from src.models.email_request import EmailRequest
from src.models.validation_result import ValidationResult, ValidationStatus


class EmailValidationService(EmailValidatorInterface):
    def __init__(self, ai_service: OpenAIService):
        self._ai_service = ai_service
        # self._repository = repository

    async def validate_email(self, email: EmailRequest) -> ValidationResult:
        # Generate unique ID

        # AI Analysis
        cod, text = await self._ai_service.validate_email(email)

        if cod == cte.SUCCESS:
            try:
                response = json.loads(text)
                return ValidationResult(metadata=email, **response)
            except json.decoder.JSONDecodeError as e:
                print(e)
                print(text)
                text = "La respuesta de GenAI no corresponde al formato esperado"
            except Exception as e:
                print(e)
                text = str(e)

        return ValidationResult(
            classification=ValidationStatus.ERROR,
            confidence_score=0,
            reasoning=f"Error interno {text}",
            red_flags=[],
            recommendations=["Revisar manualmente el correo"],
            metadata=email
        )
