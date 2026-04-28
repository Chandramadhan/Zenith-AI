# 🚀 Zenith AI - Free Hosting Guide

This guide will help you deploy the Zenith AI Ecosystem for **$0/month**.

## 1. Database (Supabase)
1.  Go to [Supabase](https://supabase.com/) and create a free project.
2.  Go to **Project Settings > Database** and scroll down to the **Connection Pooler** section.
3.  Ensure the **Pooler** is enabled and set to **Mode: Transaction**.
4.  Copy the **Connection String** and update it in your `backend/.env` (and Render Environment Variables):
    ```bash
    # IMPORTANT: Use the .supabase.com (IPv4) hostname for Render, NOT .supabase.co
    # Format: postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
    DATABASE_URL=postgresql://postgres.mfjcgcwdynavltfrbnoe:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
    ```

## 2. Backend (Render.com)
1.  Push your code to **GitHub**.
2.  Go to [Render](https://render.com/) and create a new **Web Service**.
3.  Connect your GitHub repository.
4.  **CRITICAL:** Scroll down to **Root Directory** and set it to `backend`.
5.  Set the following:
    *   **Environment:** `Python`
    *   **Build Command:** `pip install uv && uv sync`
    *   **Start Command:** `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
6.  Add **Environment Variables**:
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
