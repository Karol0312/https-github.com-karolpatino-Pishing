import asyncio
from azure.cosmos import CosmosClient, PartitionKey
from src.interfaces.repository import RepositoryInterface
from src.models.validation_result import ValidationResult
from src.utils.constantes import cte


class CosmosRepository(RepositoryInterface):
    def __init__(self, endpoint: str, key: str):
        # Crear el cliente Cosmos DB
        self._client = CosmosClient(endpoint, key)

        # Crear o conectar a la base de datos
        database = self._client.create_database_if_not_exists(id=cte.DATABASE_NAME)

        # Crear o conectar al contenedor (se recomienda definir una clave de partición)
        self._container = database.create_container_if_not_exists(
            id=cte.CONTAINER_NAME,
            partition_key=PartitionKey(path="/period")
        )

    async def save_validation_result(self, result: ValidationResult) -> int:
        result_dict = result.to_dict()
        # Ejecuta la operación síncrona en un hilo para no bloquear el loop async
        await asyncio.to_thread(self._container.create_item, result_dict)
        return cte.SUCCESS

    async def get_validation_by_id(self, email_id: str) -> ValidationResult:
        # Implementar según esquema (usar partition_key si aplica)
        item = await asyncio.to_thread(self._container.read_item, item=email_id, partition_key=email_id)
        return ValidationResult.model_validate(item)

    async def del_validation_by_id(self, email_id: str) -> int:
        await asyncio.to_thread(self._container.delete_item, id=email_id)
        return cte.SUCCESS

    async def get_all_validation(self) -> list[ValidationResult]:
        items = await asyncio.to_thread(lambda: list(self._container.read_all_items()))
        rest: list[ValidationResult] = [ValidationResult.model_validate(item) for item in items]
        return rest