import json
from dataclasses import asdict

from fastapi import FastAPI, Request
import uvicorn
from src.container import container
from src.models.email_request import EmailRequest
from src.utils.constantes import cte

app = FastAPI()

@app.get("/api/HttpTrigger")
async def get_email(request: Request):
    result = await container.get("repository").get_all_validation()
    return {"result": result}

@app.post("/api/HttpTrigger")
async def validate_email(request: Request):
    req_body = await request.json()

    email = EmailRequest(**req_body)

    # Process
    result = await container.get("email_validator").validate_email(email)

    # Save to database
    saved = await container.get("repository").save_validation_result(result)

    result = result.to_dict()

    result["saved"] = "Success" if saved == cte.SUCCESS else "Failure"

    # prueba para azure func
    data = json.dumps(result)

    return result



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=7071, log_level="info")

