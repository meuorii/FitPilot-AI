# FitPilot AI ⭐

> Your AI-powered fitness companion for effortless workout and nutrition tracking.

FitPilot AI is an AI-first web application designed to eliminate the manual friction of calorie counting and workout logging. Instead of searching through dropdowns and manually entering nutrition facts, users simply describe what they ate or how they trained in natural language. Powered by **Qwen3-4B-Instruct-2507**, FitPilot AI parses conversational inputs into structured fitness metrics, tracks long-term analytics, and delivers tailored AI coaching.

---

## 🚀 Key Features

* **🥗 Natural Language Meal Logging:** Simply type *"I ate 180g cooked rice, chicken adobo, and one boiled egg"* to automatically extract food items, portion sizes, calories, and macros (protein, carbs, fat).
* **🏋️ Natural Language Workout Logging:** Type *"Bench pressed 80kg 3x8 and did dumbbell flies 12kg 3x12"* to extract exercises, sets, reps, and volume.
* **🧠 AI Coach & Daily Recommendations:** Conversational AI coach leveraging user history to provide personalized nutritional advice, workout suggestions, and progress insights.
* **📊 Comprehensive Analytics Dashboard:** Interactive data visualizations for macro distribution, calorie deficit/surplus, weekly workout volume, and weight progress.
* **⚙️ Manual Logging & Fallbacks:** Flexible UI controls for users who prefer structured forms, buttons, and precise adjustment controls.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 18 with TypeScript
* **Styling & Motion:** Tailwind CSS, Framer Motion
* **State & Query Management:** Zustand, TanStack Query (React Query)
* **Forms & Validation:** React Hook Form, Zod
* **Charts & Routing:** Recharts, React Router v6

### **Backend (Core API)**
* **Runtime & Framework:** Node.js, Express.js (TypeScript)
* **Database & ORM:** PostgreSQL (Supabase), Prisma ORM
* **Authentication:** JWT (JSON Web Tokens) with Refresh Tokens

### **AI Microservice**
* **Framework:** FastAPI (Python)
* **LLM Engine:** `Qwen/Qwen3-4B-Instruct-2507` (served via vLLM / SGLang / HF Inference API)
* **Data Validation:** Pydantic v2

---

## 📐 System Architecture

```text
                  ┌────────────────────────┐
                  │   React + TypeScript   │
                  │    (Tailwind + Zod)    │
                  └───────────┬────────────┘
                              │ REST API
                              ▼
                  ┌────────────────────────┐
                  │    Express.js (Node)   │
                  │      (Auth & Logic)    │
                  └─────┬────────────┬─────┘
                        │            │
            Prisma ORM  │            │ Internal REST (X-Internal-API-Key)
                        ▼            ▼
         ┌───────────────────┐  ┌────────────────────────┐
         │ PostgreSQL DB     │  │ FastAPI AI Service     │
         │ (Supabase)        │  │ (Qwen3-4B-Instruct)    │
         └───────────────────┘  └────────────────────────┘