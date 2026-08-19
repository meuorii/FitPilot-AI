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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_onboarded BOOLEAN DEFAULT FALSE
);

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

CREATE TABLE public.workout_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.routine_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES public.workout_routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    target_sets INT DEFAULT 3,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    total_volume_kg NUMERIC(8,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    set_number INT NOT NULL,
    weight_kg NUMERIC(6,2) DEFAULT 0 CHECK (weight_kg >= 0),
    reps INT DEFAULT 0 CHECK (reps >= 0),
    set_type TEXT DEFAULT 'working',
    is_completed BOOLEAN DEFAULT TRUE,
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