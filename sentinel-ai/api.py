from fastapi import FastAPI, HTTPException, Header
from runner import run_ai_for_trial
from db import fetch_active_trials
import os 

app = FastAPI()

CRON_SECRET = os.getenv("CRON_SECRET")

@app.post("/cron/run-daily-ai")
def run_daily_ai(x_cron_secret: str = Header(None)):
    if x_cron_secret != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    trial_ids = fetch_active_trials()

    for trial_id in trial_ids:
        run_ai_for_trial(trial_id, triggered_by="cron")

    return {"status": "ok", "trials_processed": len(trial_ids)}


@app.post("/run-ai/{trial_id}")
def run_ai(trial_id: str):
    try:
        run_ai_for_trial(trial_id)
        return {"status": "completed", "trial_id": trial_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
