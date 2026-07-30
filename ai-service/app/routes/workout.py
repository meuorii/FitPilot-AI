from fastapi import APIRouter, Depends
from app.schemas.workout import WorkoutParseRequest, WorkoutParseResponse
from app.services.workout_services import workout_service
from app.core.security import verify_internal_key

router = APIRouter(prefix="/api/v1/ai", tags=["AI Workout Logger"], dependencies=[Depends(verify_internal_key)])

@router.post("/parse-workout", response_model=WorkoutParseResponse)
async def parse_workout(payload: WorkoutParseRequest):
    return workout_service.parse_workout(payload.text)