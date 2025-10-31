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
        # try:
            result_dict = result.to_dict()
            self._container.create_item(body=result_dict)
            return cte.SUCCESS

        # except Exception as e:
        #     print(f"Database error: {e}")
        #     return cte.ERROR

    async def get_validation_by_id(self, email_id: str) -> ValidationResult:
        pass

    async def del_validation_by_id(self, email_id: str) -> int:
        return self._container.delete_item(id=email_id)

    async def get_all_validation(self) -> list[ValidationResult]:

        items_iterator = self._container.read_all_items()

        # for item in items_iterator:
        #     self._container.delete_item(item=item['id'], partition_key=item['partitionKey'])

        rest: list[ValidationResult] = [ValidationResult.model_validate(item) for item in items_iterator]

        return rest