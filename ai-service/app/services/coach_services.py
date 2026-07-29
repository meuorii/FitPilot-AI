from app.providers.qwen_provider import qwen_client
from app.prompts.coach_prompts import COACH_SYSTEM_PROMPT
from app.schemas.coach import CoachChatRequest, CoachChatResponse

class CoachService:
    def chat(self, request: CoachChatRequest) -> CoachChatResponse:
        context_str = ""
        if request.context:
            c = request.context
            context_str = (
                f"\n[User Fitness Context]: Goal: {c.fitnessGoal or 'General Fitness'}, "
                f"Calorie Target: {c.dailyCalorieGoal or 'N/A'}, Consumed Today: {c.consumedCaloriesToday or 0} kcal, "
                f"Protein Consumed: {c.consumedProteinToday or 0}g / {c.dailyProteinGoal or 'N/A'}g."
            )

        system_prompt = COACH_SYSTEM_PROMPT + context_str
        messages = [{"role": msg.role, "content": msg.content} for msg in request.history]
        messages.append({"role": "user", "content": request.message})
        reply_text = qwen_client.chat_completion(system_prompt, messages)
        return CoachChatResponse(reply=reply_text)

coach_service = CoachService()