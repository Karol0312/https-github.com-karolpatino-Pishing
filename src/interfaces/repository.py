
from abc import ABC, abstractmethod
from src.models.validation_result import ValidationResult


class RepositoryInterface(ABC):
    @abstractmethod
    async def save_validation_result(self, result: ValidationResult) -> int:
        pass

    @abstractmethod
    async def get_validation_by_id(self, email_id: str) -> ValidationResult:
        pass

    @abstractmethod
    async def del_validation_by_id(self, email_id: str) -> ValidationResult:
        pass

    @abstractmethod
    async def get_all_validation(self) -> list[ValidationResult]:
        pass