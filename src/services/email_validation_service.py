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
        def _normalize_red_flags(red_flags):
            if not red_flags:
                return []
            normalized: list[str] = []
            for item in red_flags:
                # convierte listas/tuplas anidadas a strings individuales
                if isinstance(item, (list, tuple)):
                    for sub in item:
                        normalized.append(str(sub))
                else:
                    normalized.append(str(item))
            return normalized

        # Asegurar red_flags_raw definido en todos los caminos
        try:
            cod, text = await self._ai_service.validate_email(email)
        except Exception as e:
            cod = cte.FAIL
            text = str(e)

        if cod == cte.SUCCESS:
            try:
                response = json.loads(text)
                return ValidationResult(metadata=email, **response)
            except json.JSONDecodeError:
                red_flags_raw = [f"La respuesta de GenAI no corresponde al formato esperado: {text}"]
            except Exception as e:
                red_flags_raw = [str(e)]
        else:
            red_flags_raw = [f"AI_service_error_code_{cod}: {text}"]

        red_flags = _normalize_red_flags(red_flags_raw)

        return ValidationResult(
            classification=ValidationStatus.ERROR,
            confidence_score=0.0,
            red_flags=red_flags,
            metadata=email
        )
