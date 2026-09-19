# Eagle Purse

An AI budget coach for university students in Nigeria.

Students often run out of money before the end of the month because it is hard to see where it goes. Eagle Purse tracks spending against an allowance, projects when the money will run out, and uses an AI coach to give advice based on the student's own numbers and on real campus food prices.

<!-- Add 2-3 screenshots here: dashboard, expense logger, coach chat. -->

## Features

- **Accounts**: sign up and log in with JWT authentication and bcrypt-hashed passwords
- **Expense logger**: record spending by category
- **Budget dashboard**: total spent, remaining allowance, daily burn rate, projected "broke day", category breakdown and overspent categories, with a "survival mode" warning when the budget can no longer cover a basic meal
- **Auto-adjust plan**: recalculates a new daily spending limit and suggests what to cut, which the student can apply
- **Campus meal planner**: builds meal combinations that fit a per-meal budget from a catalogue of campus vendors (price, meal type, protein/carbs/veg, location, dietary tags)
- **AI coach**: sends the student's budget snapshot and the cheapest catalogue items to an OpenAI model and returns advice; supports a chat history
- **What-if simulator** for testing spending scenarios
- Installable as a PWA

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, pandas |
| AI | OpenAI API |
| Auth | python-jose (JWT), passlib and bcrypt |
| Storage | JSON files in `backend/data/` (an Alembic migration for PostgreSQL has been started) |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Radix UI, Recharts |

## Project structure

```
backend/
  main.py            FastAPI app and routers
  routers/           auth, profile, budget, meals, coach, transactions
  utils/             budget calculations and meal-combination logic
  data/              campus food catalogue and demo data
frontend/
  src/app/components/   Dashboard, ExpenseLogger, MealPlan, CoachChat, WhatIfSimulator ...
```

## Running locally

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate          # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then add your own OPENAI_API_KEY and SECRET_KEY
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`, with interactive docs at `/docs`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Status

Working prototype.

## Author

Onaopemipo Samuel Ehalaiye · [GitHub](https://github.com/samuelehalaiye-tech) · [LinkedIn](https://www.linkedin.com/in/onaopemipo-ehalaiye-7b140b424/)
