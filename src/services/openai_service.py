# src/services/openai_service.py

from openai import OpenAI

from src.interfaces.ai_service import AIServiceInterface
from src.models.email_request import EmailRequest
from src.utils.constantes import cte


# from openai import AsyncAzureOpenAI


class OpenAIService(AIServiceInterface):
    def __init__(self, api_key: str, endpoint: str, model: str):
        # self._client = AsyncAzureOpenAI(
        #     api_key=api_key,
        #     azure_endpoint=endpoint,
        #     api_version="2024-02-15-preview"
        # )

        self._model = model  # Optimus Alpha

        self._client = OpenAI(base_url=endpoint, api_key=api_key)

        # completion = client.chat.completions.create(
        # extra_headers={
        #     "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
        #     "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
        # },
        # messages=[
        #     {
        #     "role": "user",
        #     "content": "What is the meaning of life?"
        #     }
        # ]
        # )

        # self._model = "gpt-4"

    async def validate_email(self, email: EmailRequest) -> tuple[int, str]:
        """Usa GPT para análisis inteligente de phishing"""

        prompt = cte.PROMT.format(
            sender=email.sender, subject=email.subject, email_content=email.body
        )

        temperature = cte.PROMT_TEMPERATURE

        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": cte.PROMT_SYSTEM},
                    {"role": "user", "content": prompt},
                ],
                temperature= float (temperature), 
            )

            return cte.SUCCESS, response.choices[0].message.content

        except Exception as e:

            return cte.ERROR, str(e)