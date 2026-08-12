from pydantic import BaseModel, Field, field_validator
from typing import List

class MealItem(BaseModel):
    name: str = Field(description="Name of the food item")
    quantity: float = Field(description="Portion size quantity")
    unit: str = Field(description="Unit of measurement (e.g. g, oz, serving, piece)")
    calories: int = Field(description="Estimated calories in kcal")
    protein: float = Field(description="Protein in grams")
    carbs: float = Field(description="Carbohydrates in grams")
    fat: float = Field(description="Fat in grams")

    @field_validator("calories", mode="before")
    @classmethod
    def round_calories(cls, v):
        if isinstance(v, (float, int)):
            return round(v)
        return v

class MealParseRequest(BaseModel):
    text: str = Field(..., example="I ate 180g rice, chicken adobo, and one boiled egg")

class MealParseResponse(BaseModel):
    foods: List[MealItem]
    totalCalories: int
    protein: float
    carbs: float
    fat: float

    @field_validator("totalCalories", mode="before")
    @classmethod
    def round_total_calories(cls, v):
        if isinstance(v, (float, int)):
            return round(v)
        return v