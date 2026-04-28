# 🚀 Zenith AI - Free Hosting Guide

This guide will help you deploy the Zenith AI Ecosystem for **$0/month**.

## 1. Database (Supabase)
1.  Go to [Supabase](https://supabase.com/) and create a free project.
2.  Go to **Project Settings > Database** and copy the **URI Connection String**.
3.  In your `backend/.env` file, update the `DATABASE_URL`:
    ```bash
    DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
    ```

## 2. Backend (Render.com)
1.  Push your code to **GitHub**.
2.  Go to [Render](https://render.com/) and create a new **Web Service**.
3.  Connect your GitHub repository.
4.  Set the following:
    *   **Environment:** `Python`
    *   **Build Command:** `pip install uv && uv sync`
    *   **Start Command:** `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  Add **Environment Variables**:
    *   `GROQ_API_KEY`: (Your key)
    *   `DATABASE_URL`: (Your Supabase URL)

## 3. Frontend (Vercel)
1.  Go to [Vercel](https://vercel.com/) and create a new project.
2.  Connect your GitHub repository.
3.  Set the **Root Directory** to `frontend`.
4.  In the `frontend`, update the API URLs in `page.tsx` files from `http://127.0.0.1:8000` to your **Render URL** (e.g., `https://zenith-backend.onrender.com`).
5.  Click **Deploy**.

---

### Pro Tip for Resume:
When recruiters ask about the stack, say:
> "I built a decoupled full-stack architecture using **Next.js 15** for the frontend and **FastAPI** with **LangGraph** for the agentic backend. Data persistence is handled via a **PostgreSQL** database on Supabase, and I used **Groq** for ultra-low latency AI inference to enable real-time voice-to-voice mock interviews."
