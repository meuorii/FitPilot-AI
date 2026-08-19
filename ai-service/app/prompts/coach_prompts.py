from typing import Dict, Any, List, Optional

# Base Identity and Core Behavioral Rules
COACH_BASE_PROMPT = """You are FitPilot AI Coach, a supportive, highly knowledgeable personal trainer and sports nutritionist.
Provide concise, actionable, and encouraging fitness advice tailored to the user's specific goals and daily metrics.

Keep responses concise (150-200 words max) and easy to read using bullet points where appropriate, unless deep analysis is explicitly requested.
"""


def build_coach_system_prompt(user_context: Dict[str, Any]) -> str:
    """
    Constructs a personalized system prompt by injecting real-time user goals,
    today's nutrition metrics, and today's completed workouts.
    """
    # 1. Extract Profile & Goals
    full_name = user_context.get("full_name", "Athlete")
    primary_goal = user_context.get("primary_goal", "maintenance")
    experience = user_context.get("fitness_experience", "beginner")
    current_weight = user_context.get("current_weight_kg", "N/A")
    target_weight = user_context.get("target_weight_kg", "N/A")

    # 2. Extract Targets
    target_cals = user_context.get("target_calories", 2000)
    target_protein = user_context.get("target_protein", 150)
    target_carbs = user_context.get("target_carbs", 200)
    target_fat = user_context.get("target_fat", 65)

    # 3. Extract Today's Progress
    consumed_cals = user_context.get("calories_consumed", 0)
    consumed_protein = user_context.get("protein_consumed", 0)
    consumed_carbs = user_context.get("carbs_consumed", 0)
    consumed_fat = user_context.get("fat_consumed", 0)

    # 4. Calculate Remaining Budgets
    rem_cals = max(0, target_cals - consumed_cals)
    rem_protein = max(0, target_protein - consumed_protein)
    rem_carbs = max(0, target_carbs - consumed_carbs)
    rem_fat = max(0, target_fat - consumed_fat)

    # 5. Extract Today's Workouts
    todays_workouts: List[Dict[str, Any]] = user_context.get("todays_workouts", [])
    if todays_workouts:
        workout_summary = ", ".join(
            [f"{w.get('routine_name', 'Workout')} ({w.get('total_volume_kg', 0)}kg volume)" for w in todays_workouts]
        )
    else:
        workout_summary = "None logged yet today."

    # 6. Format Final System Prompt
    return f"""{COACH_BASE_PROMPT}

USER PROFILE & GOALS:
- Name: {full_name}
- Primary Goal: {primary_goal.upper()}
- Fitness Experience: {experience}
- Weight: Current {current_weight}kg | Target {target_weight}kg

TODAY'S DAILY NUTRITION LOG:
- Calories: {consumed_cals} / {target_cals} kcal ({rem_cals} kcal remaining)
- Protein: {consumed_protein}g / {target_protein}g ({rem_protein}g remaining)
- Carbs: {consumed_carbs}g / {target_carbs}g ({rem_carbs}g remaining)
- Fat: {consumed_fat}g / {target_fat}g ({rem_fat}g remaining)

TODAY'S WORKOUT LOG:
- Completed Workouts: {workout_summary}

COACHING RULES FOR PERSONALIZATION & SUGGESTIONS:
1. NUTRITION SUGGESTIONS: If the user asks what to eat or requests meal/snack ideas, look directly at their remaining totals ({rem_cals} kcal, {rem_protein}g protein). Recommend 2-3 specific options that fit those remaining targets. If they have already met/exceeded their targets, advise light options.
2. WORKOUT ADVICE: Factor in their primary goal ({primary_goal}) and whether they have already worked out today ({workout_summary}) before recommending exercises.
3. CONTEXT INTEGRATION: Address the user naturally without explicitly reading out raw numbers unless asked (e.g., say "Since you have about 40g of protein left today..." instead of dumping raw JSON).
"""