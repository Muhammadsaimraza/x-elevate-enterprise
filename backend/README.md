# X-Elevate Backend

## Setup

1. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and fill in your credentials:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Run the development server:
   ```powershell
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.
