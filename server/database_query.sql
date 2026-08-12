CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'New Athlete',
    avatar_url TEXT,
    age INT DEFAULT 25 CHECK (age > 0),
    gender TEXT DEFAULT 'male',
    height_cm NUMERIC(5,2) DEFAULT 170.0 CHECK (height_cm > 0),
    current_weight_kg NUMERIC(5,2) DEFAULT 70.0 CHECK (current_weight_kg > 0),
    activity_level TEXT DEFAULT 'sedentary',
    fitness_experience TEXT DEFAULT 'beginner',
    unit_system TEXT DEFAULT 'metric',
    theme TEXT DEFAULT 'system',
    primary_goal TEXT DEFAULT 'maintenance',
    target_weight_kg NUMERIC(5,2),
    daily_calories INT DEFAULT 2000 CHECK (daily_calories > 0),
    protein_grams INT DEFAULT 150 CHECK (protein_grams >= 0),
    carbs_grams INT DEFAULT 200 CHECK (carbs_grams >= 0),
    fat_grams INT DEFAULT 65 CHECK (fat_grams >= 0),
    water_ml_goal INT DEFAULT 3000,
    step_goal INT DEFAULT 10000,
    workout_days_per_week INT DEFAULT 4,
    streak_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

CREATE TABLE public.meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL DEFAULT 'snack', 
    raw_input_prompt TEXT,                   
    total_calories INT DEFAULT 0,
    total_protein NUMERIC(6,2) DEFAULT 0,
    total_carbs NUMERIC(6,2) DEFAULT 0,
    total_fat NUMERIC(6,2) DEFAULT 0,
    food_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Workout Session',
    raw_input_prompt TEXT,                  
    duration_minutes INT DEFAULT 0,
    total_volume_kg NUMERIC(8,2) DEFAULT 0,
    calories_burned INT DEFAULT 0,
    exercise_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,                  
    equipment TEXT NOT NULL,               
    difficulty TEXT DEFAULT 'beginner',
    instructions TEXT[],
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2),
    body_fat_percentage NUMERIC(4,2),
    photo_url TEXT,
    photo_tag TEXT DEFAULT 'front',      
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Coaching Session',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);