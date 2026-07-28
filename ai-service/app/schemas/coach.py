from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserContext(BaseModel):
    dailyCalorieGoal: Optional[int] = None
    dailyProteinGoal: Optional[float] = None
    consumedCaloriesToday: Optional[int] = None
    consumedProteinToday: Optional[float] = None
    recentWorkoutsSummary: Optional[str] = None
    fitnessGoal: Optional[str] = None

class CoachChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class CoachChatRequest(BaseModel):
    message: str
    history: List[CoachChatMessage] = []
    context: Optional[UserContext] = None

class CoachChatResponse(BaseModel):
    reply: str