from typing import Dict, Any
from app.providers.qwen_provider import qwen_client
from app.prompts.coach_prompts import build_coach_system_prompt
from app.schemas.coach import CoachChatRequest, CoachChatResponse

class CoachService:
    def chat(self, request: CoachChatRequest) -> CoachChatResponse:
        context_dict: Dict[str, Any] = {}
        if request.context:
            context_dict = request.context.model_dump(by_alias=False, exclude_none=True)
        system_prompt = build_coach_system_prompt(context_dict)
        messages = [{"role": msg.role, "content": msg.content} for msg in request.history]
        messages.append({"role": "user", "content": request.message})
        reply_text = qwen_client.chat_completion(system_prompt, messages)

        return CoachChatResponse(reply=reply_text)

coach_service = CoachService()