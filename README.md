# X-Elevate: Autonomous Multi-Agent B2B Growth Engine


## Project Overview
X-Elevate is an event-driven platform powered by 16 specialized AI agents acting as a 24/7 digital sales team. It automates the entire outbound B2B sales funnel by discovering leads, enriching data, drafting hyper-personalized multi-channel outreach, and analyzing reply sentiment to completely replace manual prospecting bottlenecks.

## External Apps Connected (3+)
1. **X (Twitter) API:** Used for real-time intent signal monitoring, profile scanning, and tracking social engagement.
2. **LinkedIn API / Profile Scraper:** Used to capture professional headlines, company insights, and trigger context-aware professional outreach.
3. **Neon DB (Serverless PostgreSQL):** Used as the robust database layer for secure data persistence, JWT authentication state, and storing dynamic agent execution logs.

## Setup Instructions
**1. Clone the repository:**
`git clone https://github.com/Muhammadsaimraza/x-elevate-enterprise.git`
`cd x-elevate-enterprise`

**2. Backend Setup (FastAPI):**
`cd backend`
`pip install -r requirements.txt`
*Add your API keys (OpenAI, Neon DB URL, etc.) to a `.env` file.*
`uvicorn app.main:app --reload`

**3. Frontend Setup (Next.js):**
`cd ../frontend`
`npm install`
*Add your backend URL to `.env.local`.*
`npm run dev`

## How We Tested Reliability
Testing a highly dynamic, 16-agent non-deterministic AI system requires strict guardrails. We tested reliability by:
* **Asynchronous Queues & Fallbacks:** Restructuring our communication layer to use asynchronous job queues to prevent concurrent agent requests from causing database timeouts or hitting external API rate limits.
* **Proxy Configuration:** Implementing strict Next.js API rewrites to ensure seamless, CORS-compliant frontend-backend proxying in production (deployed on Vercel).
* **State-Aware Templates:** Developing automated fail-safes and custom state-aware testing templates that govern agent behavior to prevent endless conversational loops or data corruption.

## Two-Minute Demo
[https://www.youtube.com/watch?v=4BYJ-YnPpt0]