from fastapi import APIRouter, Depends
from app.schemas.coach import CoachChatRequest, CoachChatResponse
from app.services.coach_services import coach_service
from app.core.security import verify_internal_key

router = APIRouter(prefix="/api/v1/ai", tags=["AI Coach"], dependencies=[Depends(verify_internal_key)])

@router.post("/coach-chat", response_model=CoachChatResponse)
async def coach_chat(payload: CoachChatRequest):
    return coach_service.chat(payload)