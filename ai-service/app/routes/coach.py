import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.coach import CoachChatRequest, CoachChatResponse
from app.services.coach_services import coach_service
from app.core.security import verify_internal_key

router = APIRouter(
    prefix="/api/v1/ai", 
    tags=["AI Coach"], 
    dependencies=[Depends(verify_internal_key)]
)

@router.post("/coach-chat", response_model=CoachChatResponse)
async def coach_chat(payload: CoachChatRequest):
    try:
        response = await asyncio.to_thread(coach_service.chat, payload)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Coach service error: {str(e)}"
        )