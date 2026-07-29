from fastapi import APIRouter, Depends
from app.schemas.meal import MealParseRequest, MealParseResponse
from app.services.meal_services import meal_service
from app.core.security import verify_internal_key

router = APIRouter(prefix="/api/v1/ai", tags=["AI Meal Logger"], dependencies=[Depends(verify_internal_key)])

@router.post("/parse-meal", response_model=MealParseResponse)
async def parse_meal(payload: MealParseRequest):
    return meal_service.parse_meal(payload.text)