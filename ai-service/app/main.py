from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import meal, workout, coach

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Endpoints
app.include_router(meal.router)
app.include_router(workout.router)
app.include_router(coach.router)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "online", "model": settings.QWEN_MODEL_NAME}