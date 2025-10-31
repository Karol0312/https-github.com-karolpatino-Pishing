# src/container.py
import os

from src.services.cosmos_repository import CosmosRepository
from src.services.email_validation_service import EmailValidationService
from src.services.openai_service import OpenAIService

# from src.infrastructure.cosmos_repository import CosmosRepository


class Container:
    def __init__(self):
        self._services = {}
        self._configure()

    def _configure(self):
        # Configure AI Service
        ai_service = OpenAIService(
            api_key=os.getenv("OPENAI_API_KEY"),
            endpoint=os.getenv("OPENAI_ENDPOINT"),
            model=os.getenv("OPENAI_MODEL", "gpt-4"),
        )

        # Configure Repository
        repository = CosmosRepository(
            endpoint=os.environ.get("COSMOS_ENDPOINT"),
            key = os.environ.get("COSMOS_PRIMARY_KEY")
        )

        # Configure Main Service
        email_validator = EmailValidationService(ai_service)

        self._services = {
            "email_validator": email_validator,
            "ai_service": ai_service,
            "repository": repository
        }

    def get(self, service_name: str):
        return self._services.get(service_name)


# Global container instance
container = Container()

