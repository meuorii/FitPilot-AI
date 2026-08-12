import json
import re
from openai import OpenAI
from app.core.config import settings

class QwenProvider:
    def __init__(self):
        self.client = OpenAI(
            base_url=settings.INFERENCE_SERVER_URL,
            api_key=settings.INFERENCE_API_KEY
        )
        self.model = settings.QWEN_MODEL_NAME

    def extract_structured_json(self, system_prompt: str, user_input: str) -> dict:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            temperature=0.1, 
            top_p=settings.TOP_P,
            max_tokens=settings.MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        raw_content = response.choices[0].message.content.strip()
        if raw_content.startswith("```"):
            raw_content = re.sub(r"^```(?:json)?\n?", "", raw_content)
            raw_content = re.sub(r"\n?```$", "", raw_content).strip()

        return json.loads(raw_content)

    def chat_completion(self, system_prompt: str, messages: list) -> str:
        formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=formatted_messages,
            temperature=settings.TEMPERATURE,
            top_p=settings.TOP_P,
            max_tokens=settings.MAX_TOKENS
        )
        return response.choices[0].message.content.strip()

qwen_client = QwenProvider()