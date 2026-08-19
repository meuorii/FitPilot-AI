from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class UserContext(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: Optional[str] = Field(None, alias="fullName")
    primary_goal: Optional[str] = Field("maintenance", alias="fitnessGoal")
    fitness_experience: Optional[str] = Field("beginner", alias="fitnessExperience")
    current_weight_kg: Optional[float] = Field(None, alias="currentWeightKg")
    target_weight_kg: Optional[float] = Field(None, alias="targetWeightKg")

    # Goals & Targets
    target_calories: Optional[int] = Field(2000, alias="dailyCalorieGoal")
    target_protein: Optional[float] = Field(150.0, alias="dailyProteinGoal")
    target_carbs: Optional[float] = Field(200.0, alias="dailyCarbsGoal")
    target_fat: Optional[float] = Field(65.0, alias="dailyFatGoal")

    # Today's Progress
    calories_consumed: Optional[int] = Field(0, alias="consumedCaloriesToday")
    protein_consumed: Optional[float] = Field(0.0, alias="consumedProteinToday")
    carbs_consumed: Optional[float] = Field(0.0, alias="consumedCarbsToday")
    fat_consumed: Optional[float] = Field(0.0, alias="consumedFatToday")

    # Today's Workouts
    todays_workouts: Optional[List[Dict[str, Any]]] = Field(default_factory=list, alias="todaysWorkouts")


class CoachChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class CoachChatRequest(BaseModel):
    user_id: Optional[str] = Field(None, alias="userId")
    message: str
    history: List[CoachChatMessage] = []
    context: Optional[UserContext] = None


class CoachChatResponse(BaseModel):
    reply: str