# function_app.py
import azure.functions as func
import json
import logging
from src.container import container
from src.models.email_request import EmailRequest

app = func.FunctionApp()


@app.function_name(name="ValidateEmail")
@app.route(route="HttpTrigger", methods=["POST"], auth_level=func.AuthLevel.FUNCTION)
async def validate_email(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Email validation request received")

    try:
        # Parse request
        req_body = req.get_json()

        email = EmailRequest(**req_body)

        # Process
        result = await container.get("email_validator").validate_email(email)

        # Save to database
        await container.get("repository").save_validation_result(result)

        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            headers={"Content-Type": "application/json"},
        )

    except Exception as e:
        logging.error(f"Validation error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            headers={"Content-Type": "application/json"},
        )
