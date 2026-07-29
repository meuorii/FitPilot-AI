from app.providers.qwen_provider import qwen_client
from app.prompts.workout_prompts import WORKOUT_PARSER_PROMPT
from app.schemas.workout import WorkoutParseResponse

class WorkoutService:
    def parse_workout(self, text: str) -> WorkoutParseResponse:
        data = qwen_client.extract_structured_json(WORKOUT_PARSER_PROMPT, text)
        return WorkoutParseResponse(**data)

workout_service = WorkoutService()