from pydantic import BaseModel, Field
from typing import List

class ExerciseSet(BaseModel):
    reps: int = Field(description="Reps completed")
    weightKg: float = Field(description="Weight in kilograms")

class ExerciseItem(BaseModel):
    exerciseName: str = Field(description="Standardized name of the exercise")
    sets: List[ExerciseSet]

class WorkoutParseRequest(BaseModel):
    text: str = Field(..., example="Bench press 80kg for 3 sets of 8, then incline dumbbell press 24kg 3x10")

class WorkoutParseResponse(BaseModel):
    exercises: List[ExerciseItem]
    estimatedDurationMinutes: int