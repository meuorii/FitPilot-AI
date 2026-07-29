from app.providers.qwen_provider import qwen_client
from app.prompts.meal_prompts import MEAL_PARSER_PROMPT
from app.schemas.meal import MealParseResponse

class MealService:
    def parse_meal(self, text: str) -> MealParseResponse:
        data = qwen_client.extract_structured_json(MEAL_PARSER_PROMPT, text)
        return MealParseResponse(**data)

meal_service = MealService()