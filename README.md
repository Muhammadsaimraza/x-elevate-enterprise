# X-Elevate Enterprise

**16-Agent AI Swarm for X (Twitter) & LinkedIn Growth**

Multi-step AI agent platform that orchestrates 16 specialized agents to automate content creation, trend analysis, engagement, lead generation, and analytics across X and LinkedIn.

**Live Demo:** https://x-elevate-enterprise.vercel.app  
**2-Minute Demo Video:** [Yahan apna Loom/YouTube link daalo]

---

## Project Overview

X-Elevate is a multi-agent AI system designed for social media growth. It uses a coordinated swarm of 16 specialized AI agents that work together to:

- Analyze trends in real-time
- Generate platform-optimized content (threads, carousels, posts)
- Manage engagement and replies
- Track competitors
- Run A/B tests
- Generate leads
- Provide real-time analytics

The system connects multiple external services and runs multi-step workflows automatically.

---

## External Apps / Integrations Used

1. **X (Twitter) API v2** – Posting, trend analysis, engagement, analytics
2. **LinkedIn API** – Content publishing, profile data, engagement
3. **Google Gemini** – Core AI reasoning & content generation for all agents
4. **PostgreSQL** – User data, agent state, linked accounts
5. **WebSockets** – Real-time metrics streaming to frontend

*(Minimum 3 external apps requirement satisfied)*

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python), SQLAlchemy, WebSockets
- **Database:** PostgreSQL (SQLite for local dev)
- **AI:** Google Gemini
- **Auth:** JWT + HTTP-only cookies
- **Deployment:** Vercel (frontend) + Docker-ready backend

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (optional — SQLite works for local)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your keys (GEMINI_API_KEY, X_API keys, etc.)
uvicorn app.main:app --reload --port 8000

### Frontend

cd frontend
npm install
npm run dev
Open http://localhost:3000